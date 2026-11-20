import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import outbound from '../api/outbound.ts';
import report from '../api/attribution.ts';
import { ledger } from './attribution.ts';
import { reconcileWhatsApp } from './whatsapp-attribution.ts';
const ID='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN='local-test-'+ 'x'.repeat(64);
const range={from:'2026-10-01',to:'2026-10-31'};
const now=Date.parse('2026-11-01T12:00:00Z');
const reply=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.statusCode=c;return this},json(b){this.body=b;return this}});
function fixture(){
  const env=Object.fromEntries(['BLOB_READ_WRITE_TOKEN','ATTRIBUTION_SECRET','WEBSITE_ATTRIBUTION_TOKEN','ARBOX_API_KEY','ATTRIBUTION_REPORT_TOKEN'].map(k=>[k,process.env[k]]));
  for(const k of Object.keys(env)) process.env[k]=TOKEN;
  const original={...ledger},fetcher=globalThis.fetch,records=new Map();
  ledger.read=async id=>records.get(id)||null;
  ledger.write=async(id,row,overwrite=false)=>{if(records.has(id)&&!overwrite)throw Error('exists');records.set(id,structuredClone(row))};
  ledger.all=async()=>[...records.values()];
  return {records,restore(){Object.assign(ledger,original);globalThis.fetch=fetcher;for(const[k,v]of Object.entries(env))if(v===undefined)delete process.env[k];else process.env[k]=v;}};
}
const intent={version:1,inquiry_id:ID,channel:'whatsapp',state:'outbound_intent',location_id:18259,created_at:'2026-10-10T08:00:00Z',submitted_page:'/pilates.html',landing:'/pilates-price.html',source:'google',medium:'referrer'};
const proof={reference:ID,phone:'972521234567',received_at:'2026-10-10T08:01:00Z',message_id:'wamid.only-test'};
function responses(matches=[proof],ids=[{user_id:123,phone:'0521234567',location_name:'סניף פולג'}]){
  const calls=[];
  const fetcher=async (url,options={})=>{
    const u=new URL(url);calls.push(u);
    let body;
    if(u.hostname==='steps-backend-production.up.railway.app'){
      assert.equal(options.headers.Authorization,'Bearer '+TOKEN);
      assert.deepEqual(JSON.parse(options.body).references,[ID]);
      body={tenant:'7ef4ffae-b657-46ab-a68a-36fc24c05641',evidence:'received_meta_inbound',matches};
    }else if(u.pathname.endsWith('searchUser')){assert.equal(u.searchParams.get('location_id'),'18259');assert.equal(u.searchParams.get('value'),'0521234567');body={statusCode:200,data:ids};}
    else {
      const common={user_id:123,location_name:'סניף פולג'};let data=[];
      if(u.pathname.endsWith('trialClassesReport'))data=[{...common,date:'2026-10-11',start_time:'17:00',class_name:'פילאטיס'}];
      if(u.pathname.endsWith('salesReport'))data=[{...common,date:'2026-10-11',sale_id:4,membership_user_id:5,paid:50}];
      if(u.pathname.endsWith('transactionsReport'))data=[{...common,transaction_date:'2026-10-11',transaction_date_time:'2026-10-11 18:00',transaction_id:6,membership_user_id:5,amount:50,status:'SUCCESS'}];
      body={statusCode:200,data,extra:{pagination:{next_page_url:null}}};
    }
    return {ok:true,json:async()=>body};
  };return{fetcher,calls};
}

test('actual intent endpoint does not create a lead; received proof links official user, class and 50 ILS once',async()=>{
  const f=fixture();try{
    const saved=reply();await outbound({method:'POST',headers:{origin:'https://stepsnetanya.co.il','x-forwarded-for':'local-wa'},body:{channel:'whatsapp',inquiry_id:ID,page:'/pilates.html',consent:'granted',ref:{landing:'/pilates-price.html',ref:'https://www.google.com/'}}},saved);
    assert.equal(saved.statusCode,200);assert.equal(f.records.get(ID).state,'outbound_intent');assert.equal(f.records.get(ID).arbox_user_id,undefined);
    Object.assign(f.records.get(ID),intent);
    let r=responses([]);globalThis.fetch=r.fetcher;
    const clickOnly=reply();await report({method:'GET',headers:{authorization:'Bearer '+TOKEN},query:range},clickOnly);
    assert.equal(clickOnly.body.inquiries.length,0);assert.equal(r.calls.length,1);
    r=responses();globalThis.fetch=r.fetcher;
    const received=reply();await report({method:'GET',headers:{authorization:'Bearer '+TOKEN},query:range},received);
    assert.equal(received.statusCode,200);const[row]=received.body.inquiries;
    assert.equal(row.created_at,proof.received_at);assert.equal(row.intent_created_at,intent.created_at);
    assert.equal(row.arbox_user_id,123);assert.equal(row.landing,'/pilates-price.html');assert.equal(row.submitted_page,'/pilates.html');assert.equal(row.bookings.length,1);assert.equal(row.paid_total,50);
    assert.doesNotMatch(JSON.stringify(received.body),/0521234567|972521234567|person_key|wamid/);
    assert.equal(f.records.get(ID).state,'linked');
    const again=reply();await report({method:'GET',headers:{authorization:'Bearer '+TOKEN},query:range},again);assert.equal(again.body.inquiries[0].paid_total,50);
    assert.equal(r.calls.filter(u=>u.pathname.endsWith('searchUser')).length,1);
  }finally{f.restore()}
});

test('unknown, copied, late, untrusted and ambiguous references never become a guessed identity',async()=>{
  const f=fixture();try{
    for(const matches of [[],[{...proof,reference:'other'}],[{...proof,message_id:'extension-mirror'}],[{...proof,received_at:'2026-10-09T00:00:00Z'}],[{...proof,received_at:'2026-10-20T00:00:00Z'}],[proof,{...proof,phone:'0529999999'}]]){
      const r=responses(matches);const out=await reconcileWhatsApp([intent],range,r.fetcher,ledger,now);
      assert.equal(out.records[0].state,'outbound_intent');assert.equal(r.calls.filter(u=>u.pathname.endsWith('searchUser')).length,0);
    }
    const r=responses([proof],[{user_id:1,phone:'0521234567',location_name:'סניף פולג'},{user_id:2,phone:'0521234567',location_name:'סניף פולג'}]);
    const out=await reconcileWhatsApp([intent],range,r.fetcher,ledger,now);
    assert.equal(out.records[0].state,'received_unmatched');assert.equal(out.records[0].arbox_user_id,null);assert.equal(f.records.size,0);
    await assert.rejects(reconcileWhatsApp([intent],range,async()=>({ok:false}),ledger,now),/evidence_unavailable/);
  }finally{f.restore()}
});

test('intent validation, consent and immutable record ownership',async()=>{
  const f=fixture();try{
    const base={method:'POST',headers:{origin:'https://stepsnetanya.co.il'},body:{channel:'whatsapp',inquiry_id:ID,page:'/barre.html',consent:'denied',ref:{utm_source:'google',landing:'/pilates.html'}}};
    let r=reply();await outbound({...base,headers:{origin:'https://other.example'}},r);assert.equal(r.statusCode,403);
    r=reply();await outbound({...base,body:{...base.body,page:'https://other.example'}},r);assert.equal(r.statusCode,400);
    r=reply();await outbound(base,r);assert.equal(r.statusCode,200);assert.equal(f.records.get(ID).source,'unknown');assert.equal(f.records.get(ID).landing,'');assert.equal(f.records.get(ID).submitted_page,'/barre.html');
    r=reply();await outbound({...base,body:{...base.body,page:'/gym-women.html'}},r);assert.equal(r.statusCode,503);assert.equal(f.records.get(ID).submitted_page,'/barre.html');
  }finally{f.restore()}
});

test('browser keeps original WhatsApp text and target, sends only an intent and never blocks navigation',()=>{
  const listeners={},beacons=[];const text='היי, הגעתי מהאתר של STEPS';
  const anchor={href:'https://wa.me/972527927575?text='+encodeURIComponent(text),target:'_blank'};
  const window={location:{protocol:'https:',hostname:'stepsnetanya.co.il',pathname:'/pilates.html',href:'https://stepsnetanya.co.il/pilates.html',search:''},crypto:{randomUUID:()=>ID},navigator:{sendBeacon:(url,body)=>{beacons.push([url,body]);return true}},localStorage:{getItem:()=>null}};
  const document={referrer:'',currentScript:{hasAttribute:()=>true},addEventListener:(type,fn,capture)=>{if(capture)listeners[type]=fn},createElement:()=>({}),head:{appendChild(){}}};
  vm.runInNewContext(fs.readFileSync(new URL('../tracking.js',import.meta.url),'utf8'),{window,document,URL,URLSearchParams,Blob});
  const event={target:{closest:()=>anchor},defaultPrevented:false};
  listeners.click(event);let u=new URL(anchor.href);assert.ok(u.searchParams.get('text').startsWith(text));assert.ok(u.searchParams.get('text').includes('[STEPS:'+ID+']'));assert.equal(anchor.target,'_blank');assert.equal(beacons.length,1);assert.equal(window.dataLayer.filter(a=>a[0]==='event').length,0);
  listeners.click(event);assert.equal(new URL(anchor.href).searchParams.get('text').match(/\[STEPS:/g).length,1);
  anchor.href='https://wa.me/972527927575';const legal={...event,target:{closest:()=>({...anchor})}};listeners.click(legal);assert.equal(beacons.length,2);
});
