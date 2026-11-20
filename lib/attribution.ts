import { createHmac, randomUUID } from 'node:crypto';
import { get, put, list } from '@vercel/blob';

export type RecordData = Record<string, any>;
const PREFIX = 'website-attribution/v1/';
export function pathOnly(value: unknown): string {
  if (typeof value !== 'string' || !/^\/(?:[a-z0-9-]+\.html)?$/i.test(value)) return '';
  return value;
}
export function cleanText(value: unknown, max = 120): string {
  return typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f;|]/g, ' ').trim().slice(0, max) : '';
}
export function attribution(raw: unknown, page: unknown, consent: unknown): RecordData {
  const r = raw && typeof raw === 'object' ? raw as RecordData : {};
  const result: RecordData = { submitted_page: pathOnly(page) || '/', consent: consent === 'granted' ? 'granted' : 'not_granted', source: 'unknown', medium: 'unknown', landing: '' };
  // Cross-page marketing history is used only with the visitor's current consent.
  if (consent !== 'granted') return result;
  for (const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','ad_id','gclid','fbclid']) {
    const text = cleanText(r[key], 200); if (text) result[key] = text;
  }
  result.landing = pathOnly(r.landing);
  try {
    const u = new URL(r.ref);
    if (u.protocol === 'https:' && /(^|\.)(google\.com|google\.co\.il|bing\.com|duckduckgo\.com|yahoo\.com|chatgpt\.com|perplexity\.ai|facebook\.com|instagram\.com)$|^copilot\.microsoft\.com$/.test(u.hostname)) result.ref = u.origin + '/';
  } catch {}
  result.source = result.utm_source || (result.ref ? new URL(result.ref).hostname : 'unknown');
  result.medium = result.utm_medium || (result.gclid || result.fbclid ? 'click_id_present' : result.ref ? 'referrer' : 'unknown');
  return result;
}

export function personKey(phone: string): string {
  if (!process.env.ATTRIBUTION_SECRET) throw new Error('attribution_not_configured');
  return createHmac('sha256', process.env.ATTRIBUTION_SECRET).update(phone).digest('hex');
}
export function requestId(value: unknown): string {
  return typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value) ? value.toLowerCase() : randomUUID();
}
export function arboxUserId(body: any): number | null {
  if (body?.statusCode && Number(body.statusCode) >= 400 || body?.error || body?.success === false) return null;
  const id = Number(body?.data?.user_id ?? body?.user_id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export const ledger = {
  async read(id: string): Promise<RecordData | null> {
    const blob = await get(PREFIX + id + '.json', { access: 'private', useCache: false });
    return blob?.statusCode === 200 ? new Response(blob.stream as any).json() : null;
  },
  async write(id: string, data: RecordData, overwrite = false) {
    await put(PREFIX + id + '.json', JSON.stringify(data), { access: 'private', addRandomSuffix: false, allowOverwrite: overwrite, contentType: 'application/json', cacheControlMaxAge: 60 });
  },
  async all(): Promise<RecordData[]> {
    const rows: RecordData[] = []; let cursor: string | undefined;
    do {
      const page = await list({ prefix: PREFIX, limit: 200, cursor });
      for (const blob of page.blobs) {
        const id = blob.pathname.slice(PREFIX.length, -5);
        const row = await this.read(id); if (row) rows.push(row);
      }
      cursor = page.hasMore ? page.cursor : undefined;
      if (rows.length > 2000) throw new Error('ledger_limit');
    } while (cursor);
    return rows;
  },
};

/** Durable reservation precedes the CRM write. An uncertain request is never replayed. */
export async function trackedLead(record: RecordData, create: () => Promise<any>, store = ledger) {
  const existing = await store.read(record.inquiry_id);
  if (existing) {
    if (existing.person_key !== record.person_key) return { status: 409, error: 'inquiry_conflict' };
    return existing.arbox_user_id ? { status: 200, ok: true } : { status: 409, error: 'inquiry_pending' };
  }
  try { await store.write(record.inquiry_id, record); }
  catch {
    // Includes concurrent claims and storage failures. No CRM mutation occurred here.
    return { status: 503, error: 'please_retry' };
  }
  let response;
  try { response = await create(); }
  catch { return { status: 409, error: 'inquiry_pending' }; }
  const id = arboxUserId(response);
  if (!id) return { status: 409, error: 'inquiry_pending' };
  const complete = { ...record, arbox_user_id: id, state: 'linked' };
  for (let i = 0; i < 3; i++) {
    try { await store.write(record.inquiry_id, complete, true); return { status: 200, ok: true }; }
    catch { /* Retry storage only. Never repeat the successful CRM write. */ }
  }
  console.error('attribution_link_pending', record.inquiry_id, id);
  // CRM succeeded. Do not invite a duplicate submission; the private pending record remains.
  return { status: 200, ok: true };
}
