import { ledger } from '../lib/attribution.ts';
import { authorized, joinOutcomes, localDay, readReport, reportRange } from '../lib/outcomes.ts';
import { inReport, reconcileWhatsApp } from '../lib/whatsapp-attribution.ts';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  if (!authorized(req.headers.authorization, process.env.ATTRIBUTION_REPORT_TOKEN)) return res.status(401).json({ error:'unauthorized' });
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({ error:'method_not_allowed' }); }
  const range = reportRange(req.query?.from, req.query?.to);
  if (!range) return res.status(400).json({ error:'provide_valid_range_max_31_days' });
  if (!process.env.ARBOX_API_KEY || !process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error:'not_configured' });
  try {
    const reconciliation = await reconcileWhatsApp((await ledger.all()).filter(i => i.location_id === 18259),range);
    const inquiries = reconciliation.records.filter(i=>inReport(i,range));
    const coverage={channels:['website_form','website_whatsapp_reference'],direct_arbox:'not_linked',whatsapp_status:reconciliation.whatsapp_status,pending_whatsapp_intents:reconciliation.pending_intents};
    if (!inquiries.length || !inquiries.some(i=>i.arbox_user_id)) return res.status(200).json({ range, coverage, inquiries:joinOutcomes(inquiries,[],[],[]), arbox_reads:reconciliation.identity_lookups || 0 });
    const trials = await readReport('trialClassesReport',range.from,range.to);
    const sales = await readReport('salesReport',range.from,range.to);
    const payments = await readReport('transactionsReport',range.from,range.to);
    return res.status(200).json({ range, coverage, generated_at:new Date().toISOString(), payment_definition:'positive_SUCCESS_transactions_in_range_not_net_revenue', booking_definition:'trial_report_evidence_not_current_active_status', inquiries:joinOutcomes(inquiries,trials,sales,payments), unresolved:inquiries.filter(i => !i.arbox_user_id).length });
  } catch {
    return res.status(503).json({ error:'report_incomplete_retry_later' });
  }
}
