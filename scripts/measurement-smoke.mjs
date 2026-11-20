// Run with: node --env-file=.env.measurement.local scripts/measurement-smoke.mjs
// Writes disposable storage probes only. Never creates a CRM lead, booking or charge.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { put, get, del } from '@vercel/blob';
import { joinOutcomes, readReport } from '../lib/outcomes.ts';
import { writeFile } from 'node:fs/promises';

const path = '_health/measurement-' + randomUUID() + '.json';
let url;
const proof = { checked_at: new Date().toISOString(), crm_mutations: 0 };
try {
  const writes = await Promise.allSettled([1,2].map(() => put(path,JSON.stringify({kind:'disposable_storage_probe',value:50}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'})));
  const successes=writes.filter(w=>w.status==='fulfilled');
  assert.equal(successes.length,1,'a concurrent reservation must have exactly one winner');
  url=successes[0].value.url;
  const saved=await get(path,{access:'private',useCache:false});
  assert.equal((await new Response(saved.stream).json()).value,50);
  const publicRead=await fetch(url);
  assert.ok([401,403,404].includes(publicRead.status),'private ledger must not be publicly readable');
  proof.storage={private_write_and_read:true,concurrent_claim_has_one_winner:true,unauthorized_read_status:publicRead.status};
} finally { if(url) await del(path); }

// Read-only verification against the previously audited CRM customer and transaction.
const trials=await readReport('trialClassesReport','2026-10-06','2026-10-10');
const sales=await readReport('salesReport','2026-10-06','2026-10-10');
const transactions=await readReport('transactionsReport','2026-10-06','2026-10-10');
const [joined]=joinOutcomes([{inquiry_id:'read-only-existing-customer-check',arbox_user_id:12124583,created_at:'2026-10-06T00:00:00Z',source:'unknown',landing:'',submitted_page:'',location_id:18259}],trials,sales,transactions);
assert.equal(joined.bookings.length,1);
assert.ok(joined.payments.some(p=>p.transaction_id===28577070&&p.amount===400&&p.membership_user_id===20750947&&p.sale_id===104895208));
proof.existing_crm_case={bookings:joined.bookings.length,positive_success_amount:joined.paid_total,transaction_to_sale_join:true,historical_page_not_invented:joined.landing===''&&joined.source==='unknown'};
await writeFile('_preview/measurement-2026-11-01/implementation-smoke.json',JSON.stringify(proof,null,2));
console.log(JSON.stringify(proof,null,2));
