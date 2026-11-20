import { timingSafeEqual } from 'node:crypto';
import type { RecordData } from './attribution.ts';

export function authorized(value: unknown, token: unknown): boolean {
  if (typeof token !== 'string' || typeof value !== 'string') return false;
  const secret = token.trim();
  if (secret.length < 32) return false;
  const a = Buffer.from(value), b = Buffer.from('Bearer ' + secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function reportRange(from: unknown, to: unknown): { from: string; to: string } | null {
  if (typeof from !== 'string' || typeof to !== 'string') return null;
  if (![from,to].every(s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s)) return null;
  const days = (Date.parse(to) - Date.parse(from)) / 86400000;
  return days >= 0 && days <= 30 ? { from, to } : null;
}
export function localDay(timestamp: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date(timestamp));
}
function rowDay(row: RecordData): string { return String(row.date || row.transaction_date || '').slice(0,10); }
function israelTime(text: string): number {
  if (/Z$|[+-]\d\d:\d\d$/.test(text)) return Date.parse(text);
  const normalized = text.replace(' ', 'T');
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d)?$/.test(normalized)) return NaN;
  const utc = Date.parse(normalized + 'Z'); let result = utc;
  for (let n = 0; n < 2; n++) {
    const parts = new Intl.DateTimeFormat('en-CA',{ timeZone:'Asia/Jerusalem', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23' }).formatToParts(new Date(result));
    const p = Object.fromEntries(parts.map(x => [x.type,x.value]));
    const rendered = Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`);
    result = utc - (rendered - result);
  }
  return result;
}
function atOrAfter(row: RecordData, inquiry: RecordData): boolean {
  const stamp = row.transaction_date_time || (row.date && row.start_time ? row.date + ' ' + row.start_time : '');
  if (stamp) {
    const moment = israelTime(stamp);
    return Number.isFinite(moment) && moment >= Date.parse(inquiry.created_at);
  }
  // A date-only row cannot establish ordering inside a day. Do not guess.
  return rowDay(row) > localDay(inquiry.created_at);
}
export function joinOutcomes(inquiries: RecordData[], trials: RecordData[], sales: RecordData[], transactions: RecordData[], cancellations: RecordData[] = []) {
  // Multiple inquiries can refer to the same person. A result is credited once,
  // to the most recent eligible website inquiry, never counted for every touch.
  const rows: RecordData[] = inquiries.map(i => ({ ...i, bookings: [] as any[], payments: [] as any[], paid_total: 0 }));
  function owner(outcome: RecordData) {
    return rows.filter(i => i.arbox_user_id && String(i.arbox_user_id) === String(outcome.user_id) && atOrAfter(outcome,i))
      .sort((a,b) => b.created_at.localeCompare(a.created_at))[0];
  }
  const booked = new Set<string>(), paid = new Set<string>();
  for (const t of trials) {
    const i = owner(t); if (!i) continue;
    const key = [t.user_id,t.date,t.start_time,t.class_name].join('|');
    if (booked.has(key)) continue; booked.add(key);
    const cancelled = cancellations.some(c => String(c.user_id) === String(t.user_id) && c.date === t.date && c.start_time === t.start_time && c.class_name === t.class_name);
    i.bookings.push({ date:t.date, start_time:t.start_time, class_name:t.class_name, evidence:'trial_report', cancellation_observed: cancelled, active_booking_verified: false });
  }
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.status !== 'SUCCESS' || !Number.isFinite(amount) || amount <= 0 || !t.transaction_id || paid.has(String(t.transaction_id))) continue;
    const i = owner(t); if (!i) continue;
    paid.add(String(t.transaction_id));
    const sale = sales.find(s => String(s.user_id) === String(t.user_id) && s.membership_user_id && String(s.membership_user_id) === String(t.membership_user_id));
    i.payments.push({ transaction_id:t.transaction_id, date:t.transaction_date, amount, currency:'ILS', item_type:t.item_type || sale?.item_type || 'unknown', membership_user_id:t.membership_user_id || null, sale_id:sale?.sale_id || null, sale_amount_differs_from_transaction: !!sale && Number(sale.paid) !== amount });
    i.paid_total = Math.round((i.paid_total + amount) * 100) / 100;
  }
  return rows.map(({ person_key, ...row }) => row);
}

/** Complete, sequential official v3 reads. Never turn pagination failures into zero outcomes. */
export async function readReport(name: string, from: string, to: string, fetcher = fetch): Promise<RecordData[]> {
  const result: RecordData[] = [];
  for (let page = 1; page <= 20; page++) {
    const q = new URLSearchParams({ fromDate:from, toDate:to, location_id:'18259', page:String(page) });
    const r = await fetcher('https://arboxserver.arboxapp.com/api/public/v3/reports/' + name + '?' + q, { headers: { 'api-key':process.env.ARBOX_API_KEY || '', Accept:'application/json' }, signal:AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error('arbox_report_unavailable');
    const body = await r.json();
    if (body.statusCode && Number(body.statusCode) !== 200 || !Array.isArray(body.data)) throw new Error('invalid_arbox_report');
    result.push(...body.data.filter((row: RecordData) => rowDay(row) >= from && rowDay(row) <= to && (row.location_id === 18259 || String(row.location_name || '').includes('פולג'))));
    const pagination = body.extra?.pagination;
    if (!pagination) throw new Error('pagination_not_verified');
    if (!pagination.next_page_url) return result;
  }
  throw new Error('report_page_limit');
}
