// api/ads-performance.ts — STEPS ads performance (the "which campaign brings money" loop).
//
// Shows ONLY currently-ACTIVE Meta campaigns + window metrics (spend ·
// impressions · results · ₪/result), a login-free "view the ad" preview per
// campaign, AND an Arbox cross-match — leads are tagged in Arbox with the AD
// NAME (Zapier: Ad Name → Arbox Campaign field), so we map ad name → its
// campaign (via Meta ad data) to attribute confirmed intro/paying members to
// the right campaign.
//
// Read-only. Token-gated (?key=DASHBOARD_TOKEN). PII-free aggregate. CORS-open.
// Window via ?days=7|30|90|all. ?status=all shows paused too (default: active).

declare const process: {
  env: {
    ARBOX_API_KEY?: string;
    DASHBOARD_TOKEN?: string;
    META_ACCESS_TOKEN?: string;
    META_AD_ACCOUNT_ID?: string;
  };
};

const ARBOX_V2 = "https://api.arboxapp.com/index.php/api/v2";
const GRAPH = "https://graph.facebook.com/v21.0";
const POLEG = "סניף פולג";
const INTRO_MAX = 70;

async function arboxGet(path: string, apiKey: string): Promise<any> {
  const r = await fetch(`${ARBOX_V2}${path}`, { headers: { apiKey } });
  if (!r.ok) throw new Error(`Arbox ${path} → HTTP ${r.status}`);
  return r.json();
}

function asList(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

function normPhone(p: any): string {
  let d = String(p ?? "").replace(/\D/g, "");
  if (d.startsWith("972")) d = "0" + d.slice(3);
  return d.length >= 9 ? d.slice(-10) : d;
}

function paidOf(row: any): number {
  const n = Number(row.paid ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isIntro(row: any): boolean {
  if (String(row.membership_type_name ?? "").includes("היכרות")) return true;
  const p = paidOf(row);
  return p > 0 && p <= INTRO_MAX;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function windowFrom(days: number | null): string {
  if (days == null) return "2025-01-01";
  const d = new Date();
  d.setDate(d.getDate() - days);
  return ymd(d);
}

const METATOK = () => process.env.META_ACCESS_TOKEN;
const METAACCT = () => process.env.META_AD_ACCOUNT_ID;

type MetaCampaign = {
  id: string;
  campaign: string;
  spend: number;
  impressions: number;
  metaLeads: number;
  metaChats: number;
  metaResults: number;
  previewUrl?: string;
};

async function fetchMetaCampaigns(
  days: number | null,
  activeOnly: boolean,
): Promise<{ list: MetaCampaign[]; pausedHidden: number }> {
  const tokenM = METATOK();
  const acct = METAACCT();
  if (!tokenM || !acct) return { list: [], pausedHidden: 0 };

  const statusOf = new Map<string, string>();
  try {
    const cr = await fetch(`${GRAPH}/${acct}/campaigns?fields=id,effective_status&limit=400&access_token=${tokenM}`);
    if (cr.ok) {
      const cj = await cr.json();
      for (const c of cj?.data ?? []) statusOf.set(String(c.id), String(c.effective_status ?? ""));
    }
  } catch {
    /* fall back to all-with-spend */
  }

  const preset = days == null ? "maximum" : days <= 7 ? "last_7d" : days <= 30 ? "last_30d" : "last_90d";
  const r = await fetch(
    `${GRAPH}/${acct}/insights?level=campaign&fields=campaign_id,campaign_name,spend,impressions,actions&date_preset=${preset}&limit=400&access_token=${tokenM}`,
  );
  if (!r.ok) return { list: [], pausedHidden: 0 };
  const j = await r.json();

  const list: MetaCampaign[] = [];
  let pausedHidden = 0;
  for (const c of j?.data ?? []) {
    const id = String(c.campaign_id ?? "");
    const status = statusOf.get(id) ?? "";
    const isActive = status === "ACTIVE" || (status === "" && !activeOnly);
    const acts: any[] = c.actions ?? [];
    const get = (t: string) => {
      const a = acts.find((x) => x.action_type === t);
      return a ? Number(a.value) || 0 : 0;
    };
    const metaLeads = Math.max(
      get("onsite_conversion.lead_grouped"),
      get("lead"),
      get("offsite_complete_registration_add_meta_leads"),
      get("onsite_web_lead"),
    );
    const metaChats = Math.max(
      get("onsite_conversion.messaging_conversation_started_7d"),
      get("onsite_conversion.total_messaging_connection"),
    );
    const spend = Math.round(Number(c.spend) || 0);
    const impressions = Math.round(Number(c.impressions) || 0);
    if (activeOnly && !isActive) {
      if (spend > 0) pausedHidden++;
      continue;
    }
    if (impressions === 0 && spend === 0) continue;
    list.push({ id, campaign: String(c.campaign_name ?? "").trim(), spend, impressions, metaLeads, metaChats, metaResults: metaLeads + metaChats });
  }
  return { list, pausedHidden };
}

// One ads fetch → (1) login-free preview per campaign, (2) the AD-NAME→campaign
// map (so an Arbox lead tagged with an ad name attributes to its campaign).
async function fetchAdsData(campaigns: MetaCampaign[]): Promise<Map<string, string[]>> {
  const adNamesByCampaign = new Map<string, string[]>(); // campaign_id → ad names
  const tokenM = METATOK();
  const acct = METAACCT();
  if (!tokenM || !acct || campaigns.length === 0) return adNamesByCampaign;
  const firstActiveAd = new Map<string, string>();
  try {
    const r = await fetch(`${GRAPH}/${acct}/ads?fields=id,name,campaign_id,effective_status&limit=600&access_token=${tokenM}`);
    if (!r.ok) return adNamesByCampaign;
    const j = await r.json();
    for (const a of j?.data ?? []) {
      const cid = String(a.campaign_id ?? "");
      const name = String(a.name ?? "").trim();
      if (!cid) continue;
      if (name) {
        const arr = adNamesByCampaign.get(cid) ?? [];
        arr.push(name);
        adNamesByCampaign.set(cid, arr);
      }
      if (String(a.effective_status) === "ACTIVE" && !firstActiveAd.has(cid)) firstActiveAd.set(cid, String(a.id));
    }
  } catch {
    return adNamesByCampaign;
  }
  await Promise.all(
    campaigns.map(async (c) => {
      const adId = firstActiveAd.get(c.id);
      if (!adId) return;
      try {
        const pr = await fetch(`${GRAPH}/${adId}/previews?ad_format=MOBILE_FEED_STANDARD&access_token=${tokenM}`);
        if (!pr.ok) return;
        const pj = await pr.json();
        const body: string = pj?.data?.[0]?.body ?? "";
        const m = body.match(/src="([^"]+)"/);
        if (m) c.previewUrl = m[1].replace(/&amp;/g, "&");
      } catch {
        /* preview optional */
      }
    }),
  );
  return adNamesByCampaign;
}

// Real PAID members traced to FB/IG ad leads (broad 365d window, FreeFit excluded).
// Answers "how much money actually comes back from ads" beyond free trials.
async function fromAdsStat(apiKey: string, leadsRaw: any) {
  const fbPhones = new Set<string>();
  for (const l of asList(leadsRaw)) {
    if (/facebook|instagram|אינסטגרם/i.test(String(l.lead_source ?? ""))) {
      const ph = normPhone(l.phone);
      if (ph) fbPhones.add(ph);
    }
  }
  const broadFrom = ymd(new Date(Date.now() - 365 * 86400000));
  const sales = await arboxGet(`/reports/salesReport?fromDate=${broadFrom}&toDate=${ymd(new Date())}`, apiKey);
  const members = new Set<string>();
  const intro = new Set<string>();
  let revenue = 0;
  for (const s of asList(sales)) {
    if (String(s.location ?? "") !== POLEG) continue;
    const ph = normPhone(s.phone);
    if (!ph || !fbPhones.has(ph)) continue;
    if (/freefit|free fit/i.test(String(s.membership_type_name ?? ""))) continue; // aggregator pass
    if (isIntro(s)) intro.add(ph);
    else if (paidOf(s) > INTRO_MAX) { members.add(ph); revenue += paidOf(s); }
  }
  return { fbLeads: fbPhones.size, intro: intro.size, members: members.size, revenue: Math.round(revenue) };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();

  const apiKey = process.env.ARBOX_API_KEY;
  const token = process.env.DASHBOARD_TOKEN;
  if (!apiKey) return res.status(500).json({ error: "No Arbox key" });
  // fail closed: a missing DASHBOARD_TOKEN must lock the endpoint, not open it.
  if (!token || req.query.key !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const daysParam = String(req.query.days ?? "30");
  const days = daysParam === "all" ? null : Math.max(1, parseInt(daysParam, 10) || 30);
  const activeOnly = String(req.query.status ?? "active") !== "all";
  const from = windowFrom(days);
  const to = ymd(new Date());

  try {
    const [meta, leadsRaw, salesRaw] = await Promise.all([
      fetchMetaCampaigns(days, activeOnly).catch(() => ({ list: [] as MetaCampaign[], pausedHidden: 0 })),
      arboxGet("/reports/leadsInProcessReport", apiKey),
      arboxGet(`/reports/salesReport?fromDate=${from}&toDate=${to}`, apiKey),
    ]);
    const metaCampaigns = meta.list;
    const adNamesByCampaign = await fetchAdsData(metaCampaigns).catch(() => new Map<string, string[]>());

    // Arbox ad-leads (tagged with an ad name) → phone → tag.
    const leads = asList(leadsRaw).filter((l) => {
      if (String(l.location ?? "") !== POLEG) return false;
      return String(l.created_at ?? "").slice(0, 10) >= from;
    });
    const phoneToTag = new Map<string, string>();
    const adLeadPhones = new Set<string>();
    const arboxByTag = new Map<string, number>();
    for (const l of leads) {
      const tag = String(l.campaign ?? "").trim();
      const ph = normPhone(l.phone);
      if (!tag) continue;
      arboxByTag.set(tag, (arboxByTag.get(tag) ?? 0) + 1);
      if (ph) { phoneToTag.set(ph, tag); adLeadPhones.add(ph); }
    }

    const introByTag = new Map<string, Set<string>>();
    const payByTag = new Map<string, Set<string>>();
    const revByTag = new Map<string, number>();
    const introPhones = new Set<string>();
    const payPhones = new Set<string>();
    let confirmedRevenue = 0;
    for (const s of asList(salesRaw)) {
      if (String(s.location ?? "") !== POLEG) continue;
      const ph = normPhone(s.phone);
      if (!ph || !adLeadPhones.has(ph)) continue;
      const tag = phoneToTag.get(ph)!;
      if (isIntro(s)) {
        introPhones.add(ph);
        (introByTag.get(tag) ?? introByTag.set(tag, new Set()).get(tag)!).add(ph);
      } else if (paidOf(s) > INTRO_MAX) {
        payPhones.add(ph);
        confirmedRevenue += paidOf(s);
        (payByTag.get(tag) ?? payByTag.set(tag, new Set()).get(tag)!).add(ph);
        revByTag.set(tag, (revByTag.get(tag) ?? 0) + paidOf(s));
      }
    }

    const useMeta = metaCampaigns.length > 0;
    let rows: any[];
    if (useMeta) {
      rows = metaCampaigns.map((c) => {
        // sum Arbox confirmations over THIS campaign's ad-name tags
        const adNames = adNamesByCampaign.get(c.id) ?? [];
        let leadsN = 0;
        const introSet = new Set<string>();
        const paySet = new Set<string>();
        let revenue = 0;
        for (const an of adNames) {
          leadsN += arboxByTag.get(an) ?? 0;
          for (const ph of introByTag.get(an) ?? []) introSet.add(ph);
          for (const ph of payByTag.get(an) ?? []) paySet.add(ph);
          revenue += revByTag.get(an) ?? 0;
        }
        // Meta's own "lead" action count double-fires per real submission
        // (confirmed 1/7: pilates showed 2 vs. 1 real; KIDS showed 38 vs. 12
        // real). For a lead-gen campaign the number to judge ₪/result by is
        // the Arbox-confirmed count, not Meta's raw claim. CTWA/chat campaigns
        // have no Arbox lead-form equivalent, so metaChats stays authoritative
        // there. metaLeads/metaResultsRaw keep Meta's original claim visible.
        const isLeadCampaign = c.metaLeads > 0;
        const realResults = isLeadCampaign ? leadsN : c.metaChats;
        return {
          campaign: c.campaign,
          previewUrl: c.previewUrl ?? null,
          spend: c.spend,
          impressions: c.impressions,
          metaLeads: c.metaLeads,
          metaChats: c.metaChats,
          metaResultsRaw: c.metaResults,
          metaResults: realResults,
          cpResult: realResults > 0 ? Math.round(c.spend / realResults) : null,
          leads: leadsN,
          intro: introSet.size,
          paying: paySet.size,
          revenue: Math.round(revenue),
        };
      });
    } else {
      rows = [...arboxByTag.keys()].map((tag) => ({
        campaign: tag, previewUrl: null, spend: null, impressions: 0, metaLeads: 0, metaChats: 0,
        metaResults: 0, cpResult: null, leads: arboxByTag.get(tag) ?? 0,
        intro: introByTag.get(tag)?.size ?? 0, paying: payByTag.get(tag)?.size ?? 0,
        revenue: Math.round(revByTag.get(tag) ?? 0),
      }));
    }
    rows.sort((a, b) => (b.spend ?? 0) - (a.spend ?? 0) || b.metaResults - a.metaResults);

    const tSpend = rows.reduce((s, r) => s + (r.spend ?? 0), 0);
    const tResults = rows.reduce((s, r) => s + r.metaResults, 0);
    const totals = {
      campaigns: rows.length,
      pausedHidden: meta.pausedHidden,
      spend: tSpend,
      impressions: rows.reduce((s, r) => s + r.impressions, 0),
      metaResults: tResults,
      confirmedIntro: introPhones.size,
      confirmedPaying: payPhones.size,
      revenue: Math.round(confirmedRevenue),
      cpResult: tSpend > 0 && tResults > 0 ? Math.round(tSpend / tResults) : null,
    };

    const fromAds = await fromAdsStat(apiKey, leadsRaw).catch(() => null);

    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).json({
      updated_at: new Date().toISOString(),
      window: { days: days ?? "all", from, to },
      status: activeOnly ? "active" : "all",
      source: useMeta ? "meta+arbox" : "arbox",
      totals,
      fromAds,
      rows,
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
