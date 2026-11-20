import { attribution, ledger, pathOnly } from '../lib/attribution.ts';

// An outbound intent is never a lead. A received WhatsApp message is required.
const hits = new Map<string, number[]>();
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'method_not_allowed'}); }
  if (req.headers.origin !== 'https://stepsnetanya.co.il') return res.status(403).json({error:'forbidden'});
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({error:'not_configured'});
  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0];
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now-t < 600000);
  recent.push(now); hits.set(ip,recent); if(hits.size > 5000) hits.clear();
  if(recent.length > 30) return res.status(429).json({error:'too_many_requests'});
  let b = req.body;
  if (typeof b === 'string') { try { b=JSON.parse(b); } catch { return res.status(400).json({error:'invalid_request'}); } }
  if (!b || b.channel !== 'whatsapp' || !pathOnly(b.page) || typeof b.inquiry_id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(b.inquiry_id)) return res.status(400).json({error:'invalid_request'});
  const record = {...attribution(b.ref,b.page,b.consent),version:1,inquiry_id:b.inquiry_id,location_id:18259,channel:'whatsapp',state:'outbound_intent',created_at:new Date(now).toISOString()};
  try { await ledger.write(record.inquiry_id,record); return res.status(200).json({ok:true}); }
  catch { return res.status(503).json({error:'intent_not_saved'}); }
}
