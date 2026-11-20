import test from 'node:test';
import assert from 'node:assert/strict';
import { attribution, trackedLead, arboxUserId, personKey } from './attribution.ts';
import { authorized, joinOutcomes, reportRange, readReport } from './outcomes.ts';

function memoryStore() {
  const rows = new Map();
  return { rows, async read(id) { return rows.get(id) || null; }, async write(id, data, overwrite = false) { if (rows.has(id) && !overwrite) throw Error('exists'); rows.set(id, structuredClone(data)); } };
}
const inquiry = { inquiry_id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', person_key:'opaque', location_id:18259, created_at:'2026-10-06T08:00:00Z', submitted_page:'/', landing:'/pilates-price.html', source:'www.google.com', medium:'referrer', state:'pending' };

test('long campaign identifiers cannot displace complete source and page in the private record', () => {
  const a = attribution({ landing:'/pilates-price.html',ref:'https://www.google.com/search?q=private',utm_campaign:'x'.repeat(500),fbclid:'z'.repeat(1000) },'/', 'granted');
  assert.equal(a.landing,'/pilates-price.html'); assert.equal(a.ref,'https://www.google.com/'); assert.equal(a.source,'www.google.com');
  assert.doesNotMatch(JSON.stringify(a),/private|search\?q/);
  const denied = attribution({landing:'/pilates.html',utm_source:'google'},'/', 'declined');
  assert.equal(denied.source,'unknown'); assert.equal(denied.landing,''); assert.equal(denied.submitted_page,'/');
  assert.equal(attribution({landing:'https://evil.test/'},'/bad?phone=123','granted').submitted_page,'/');
});
test('HTTP 200 without the official v3 user_id cannot count as saved', () => {
  for (const body of [{}, {statusCode:400,data:{user_id:123}}, {error:'bad',user_id:123},{data:{user_id:'not-id'}}, {success:false,user_id:123}]) assert.equal(arboxUserId(body),null);
  assert.equal(arboxUserId({statusCode:200,data:{user_id:123}}),123);
});
test('the full attribution survives CRM creation, retry and a subsequent payment join', async () => {
  const store = memoryStore(); let calls = 0;
  const create = async () => { calls++; assert.equal(store.rows.get(inquiry.inquiry_id).landing, '/pilates-price.html'); return {data:{user_id:12124583}}; };
  assert.equal((await trackedLead(inquiry,create,store)).ok,true);
  assert.equal((await trackedLead(inquiry,create,store)).ok,true); assert.equal(calls,1);
  const [row] = joinOutcomes([...store.rows.values()], [{user_id:12124583,date:'2026-10-09',start_time:'07:30',class_name:'GYM'}], [{user_id:12124583,membership_user_id:20750947,sale_id:104895208,paid:400}], [{user_id:12124583,transaction_id:28577070,transaction_date:'2026-10-10',transaction_date_time:'2026-10-10 02:01',membership_user_id:20750947,item_type:'plan',status:'SUCCESS',amount:400}]);
  assert.equal(row.landing,'/pilates-price.html'); assert.equal(row.bookings.length,1); assert.equal(row.payments[0].sale_id,104895208); assert.equal(row.paid_total,400); assert.equal(row.person_key,undefined);
});
test('concurrent submissions create one CRM lead; an uncertain timeout never replays it', async () => {
  const store=memoryStore(); let calls=0;
  const results=await Promise.all([1,2].map(() => trackedLead(inquiry,async()=>{calls++;return {user_id:3};},store)));
  assert.equal(calls,1); assert.ok(results.some(r=>r.ok));
  const pending=memoryStore(); calls=0;
  const create=async()=>{calls++;throw Error('response lost after CRM write');};
  assert.equal((await trackedLead(inquiry,create,pending)).error,'inquiry_pending');
  assert.equal((await trackedLead(inquiry,create,pending)).error,'inquiry_pending'); assert.equal(calls,1);
});
test('storage must succeed before writing to CRM, and post-CRM retries only touch storage', async () => {
  let calls=0; const failing={ async read(){return null},async write(){throw Error('storage down')} };
  assert.equal((await trackedLead(inquiry,async()=>{calls++;},failing)).status,503); assert.equal(calls,0);
  const store=memoryStore(), original=store.write.bind(store); let failures=2;
  store.write=async(id,r,overwrite)=>{if(overwrite&&failures-->0)throw Error('temporary'); return original(id,r,overwrite)};
  assert.equal((await trackedLead(inquiry,async()=>{calls++;return {user_id:7}},store)).ok,true); assert.equal(calls,1); assert.equal(store.rows.get(inquiry.inquiry_id).arbox_user_id,7);
});
test('paid status, failed charges, refunds, duplicate transactions and earlier charges do not inflate revenue', () => {
  const i={...inquiry,arbox_user_id:9,created_at:'2026-10-10T07:00:00Z'};
  const base={user_id:9,transaction_id:1,transaction_date:'2026-10-10',transaction_date_time:'2026-10-10 10:01',status:'SUCCESS',amount:50};
  const rows=joinOutcomes([i,{...i,inquiry_id:'later',created_at:'2026-10-10T07:00:30Z'}],[],[{user_id:9,paid:500}], [base,base,{...base,transaction_id:2,status:'FAIL'}, {...base,transaction_id:3,amount:-50}, {...base,transaction_id:4,transaction_date_time:'2026-10-10 09:59'}, {...base,transaction_id:5,transaction_date_time:''}]);
  assert.equal(rows[0].paid_total,0); assert.equal(rows[1].paid_total,50); assert.equal(rows[1].payments.length,1);
});
test('report access fails closed and date filters reject rollover and large ranges', () => {
  assert.equal(authorized(undefined,undefined),false); assert.equal(authorized('Bearer '+ 'x'.repeat(32),'x'.repeat(32)),true); assert.equal(authorized('Bearer wrong','x'.repeat(32)),false);
  assert.equal(reportRange('2026-02-30','2026-03-01'),null); assert.equal(reportRange('2026-10-01','2026-11-01'),null); assert.ok(reportRange('2026-10-02','2026-11-01'));
});
test('official reports paginate sequentially, filter wrong dates and branches, and reject incomplete envelopes', async () => {
  let active=0,max=0; const urls=[];
  const rows=await readReport('transactionsReport','2026-10-01','2026-10-31',async url=>{active++;max=Math.max(max,active);urls.push(url);const page=new URL(url).searchParams.get('page');active--;return {ok:true,json:async()=>({statusCode:200,data:[{date:'2026-10-10',location_name:'STEPS פולג'},{date:'2026-09-01',location_name:'STEPS פולג'},{date:'2026-10-10',location_name:'other'}],extra:{pagination:{next_page_url:page==='1'?'next':null}}})};});
  assert.equal(max,1); assert.equal(urls.length,2); assert.equal(rows.length,2);
  await assert.rejects(readReport('salesReport','2026-10-01','2026-10-31',async()=>({ok:true,json:async()=>({data:[]})})),/pagination/);
});
