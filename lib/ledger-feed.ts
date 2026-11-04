import type { RecordData } from './attribution.ts';
import { localDay } from './outcomes.ts';

/** Fixed activation day of the inquiry ledger: nothing earlier is a measured inquiry. */
export const LEDGER_ACTIVATION_DAY = '2026-11-01';
const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const PAGE = /^\/(?:[a-z0-9-]+\.html)?$/i;

/**
 * The ledger as the STEPS backend may read it: a minimum of fields, no person key, no name, no phone,
 * no query strings. It performs no Arbox call and no WhatsApp call: a pure projection of private records.
 * Source only when the visitor consented and a source is known.
 */
export function feedRow(row: RecordData) {
  if (!row || typeof row.inquiry_id !== 'string' || !UUID.test(row.inquiry_id)) return null;
  if (row.location_id !== 18259 || !Number.isFinite(Date.parse(row.created_at))) return null;
  const channel = row.channel === 'whatsapp' ? 'whatsapp' : 'form';
  const linked = channel === 'form' && row.state === 'linked' && Number.isSafeInteger(row.arbox_user_id) && row.arbox_user_id > 0;
  return {
    inquiry_id: row.inquiry_id.toLowerCase(),
    created_at: new Date(row.created_at).toISOString(),
    channel,
    state: typeof row.state === 'string' ? row.state.slice(0, 40) : 'unknown',
    submitted_page: PAGE.test(row.submitted_page || '') ? row.submitted_page : '',
    consent: row.consent === 'granted' ? 'granted' : 'not_granted',
    source: row.consent === 'granted' && typeof row.source === 'string' && row.source && row.source !== 'unknown' ? row.source.slice(0, 120) : null,
    // A WhatsApp record's identity is proved by the backend from a received message, never taken from the site.
    arbox_user_id: linked ? row.arbox_user_id : null,
  };
}

export function buildFeed(rows: RecordData[], from: string, now = new Date()) {
  const start = from < LEDGER_ACTIVATION_DAY ? LEDGER_ACTIVATION_DAY : from;
  const inquiries = rows.map(feedRow)
    .filter((r): r is NonNullable<ReturnType<typeof feedRow>> => !!r && localDay(r.created_at) >= start && Date.parse(r.created_at) <= +now)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return { ledger: 'steps-website-inquiries', version: 1, from: start, generated_at: now.toISOString(), inquiries };
}
