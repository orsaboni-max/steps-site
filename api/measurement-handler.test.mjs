import test from 'node:test';
import assert from 'node:assert/strict';
import lead from './lead.ts';
import report from './attribution.ts';
import { ledger } from '../lib/attribution.ts';

const reply=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}});

test('actual lead handler captures the returned CRM identity and the protected report joins booking and payment',async()=>{
  const originals={...ledger}, originalFetch=globalThis.fetch;
  const env=Object.fromEntries(['ARBOX_API_KEY','ATTRIBUTION_SECRET','BLOB_READ_WRITE_TOKEN','ATTRIBUTION_REPORT_TOKEN'].map(k=>[k,process.env[k]]));
  const records=new Map(); let creates=0;
  try {
    for(const k of Object.keys(env))process.env[k]='test-only-'+ 'x'.repeat(64);
    ledger.read=async id=>records.get(id)||null;
    ledger.write=async(id,row,overwrite=false)=>{if(records.has(id)&&!overwrite)throw Error('exists');records.set(id,structuredClone(row))};
    ledger.all=async()=>[...records.values()];
    globalThis.fetch=async(url,options)=>{
      const u=new URL(url); assert.equal(u.hostname,'arboxserver.arboxapp.com');
      if(options.method==='POST') {
        creates++;const body=JSON.parse(options.body); assert.equal(body.source_id,6552); assert.equal(body.phone,'0521234567');assert.match(body.comment,/landing=\/pilates-price.html/);
        return {ok:true,json:async()=>({statusCode:200,data:{user_id:123}})};
      }
      let data=[];
      const common={user_id:123,location_name:'STEPS פולג'};
      if(u.pathname.endsWith('/trialClassesReport'))data=[{...common,date:'2026-11-02',start_time:'17:00',class_name:'פילאטיס מכשירים'}];
      if(u.pathname.endsWith('/salesReport'))data=[{...common,date:'2026-11-03',sale_id:12,membership_user_id:34,paid:50}];
      if(u.pathname.endsWith('/transactionsReport'))data=[{...common,transaction_date:'2026-11-03',transaction_date_time:'2026-11-03 12:00',transaction_id:56,membership_user_id:34,amount:50,item_type:'trial',status:'SUCCESS'}];
      return {ok:true,json:async()=>({statusCode:200,data,extra:{pagination:{next_page_url:null}}})};
    };
    const req={method:'POST',headers:{'x-forwarded-for':'integration-test-only'},body:{name:'בודקת מקומית',phone:'0521234567',website:'',inquiry_id:'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',consent:'granted',page:'/',ref:{landing:'/pilates-price.html',utm_source:'google',utm_medium:'cpc'}}};
    const saved=reply(); await lead(req,saved);assert.deepEqual(saved.body,{ok:true}); assert.equal(saved.statusCode,200);
    const retry=reply(); await lead(req,retry);assert.equal(retry.statusCode,200);assert.equal(creates,1);
    const denied=reply(); await report({method:'GET',headers:{},query:{}},denied);assert.equal(denied.statusCode,401);
    const row=[...records.values()][0];
    // Fixed report window isolates matching from the wall clock in future test runs.
    row.created_at='2026-11-01T08:00:00Z';records.set(row.inquiry_id,row);
    const result=reply();await report({method:'GET',headers:{authorization:'Bearer '+process.env.ATTRIBUTION_REPORT_TOKEN},query:{from:'2026-11-01',to:'2026-11-30'}},result);
    assert.equal(result.statusCode,200);const [joined]=result.body.inquiries;
    assert.equal(joined.source,'google');assert.equal(joined.landing,'/pilates-price.html');assert.equal(joined.submitted_page,'/');assert.equal(joined.arbox_user_id,123);
    assert.equal(joined.bookings[0].class_name,'פילאטיס מכשירים');assert.equal(joined.payments[0].sale_id,12);assert.equal(joined.paid_total,50);
    assert.doesNotMatch(JSON.stringify(result.body),/0521234567|בודקת מקומית|person_key/);
  } finally {
    Object.assign(ledger,originals);globalThis.fetch=originalFetch;
    for(const [k,v] of Object.entries(env))if(v===undefined)delete process.env[k];else process.env[k]=v;
  }
});
