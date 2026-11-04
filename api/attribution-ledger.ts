import { ledger } from '../lib/attribution.ts';
import { authorized } from '../lib/outcomes.ts';
import { buildFeed } from '../lib/ledger-feed.ts';

/**
 * Ledger-only read for the STEPS backend's free inquiry-to-payment alert.
 * No Arbox call, no WhatsApp call, no write. The report at /api/attribution spends metered Arbox reads and is not used.
 * Authenticated with the same shared server token that already protects the backend's WhatsApp proof lookup.
 */
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (!authorized(req.headers.authorization, process.env.WEBSITE_ATTRIBUTION_TOKEN)) return res.status(401).json({ error: 'unauthorized' });
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'method_not_allowed' }); }
  const from = typeof req.query?.from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.from) ? req.query.from : '2026-11-01';
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'not_configured' });
  try {
    return res.status(200).json(buildFeed(await ledger.all(), from));
  } catch {
    return res.status(503).json({ error: 'ledger_unavailable' });
  }
}
