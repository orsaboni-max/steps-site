// Disposable private-storage intent, real HTTP handlers, no message or CRM mutation.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { del, get } from '@vercel/blob';
import { writeFile } from 'node:fs/promises';
const id=randomUUID(),base='https://stepsnetanya.co.il',backend='https://steps-backend-production.up.railway.app';
const evidence={checked_at:new Date().toISOString(),messages_sent:0,crm_mutations:0,checks:[]};
const payload={references:[id],after:new Date(Date.now()-60000).toISOString(),before:new Date().toISOString()};
for(const authenticated of [false,true]){
  const r=await fetch(backend+'/integrations/website/whatsapp',{method:'POST',headers:{'Content-Type':'application/json',...(authenticated?{Authorization:'Bearer '+process.env.WEBSITE_ATTRIBUTION_TOKEN.trim()}:{})},body:JSON.stringify(payload)});
  assert.equal(r.status,authenticated?200:401);
  if(authenticated){const b=await r.json();assert.equal(b.evidence,'received_meta_inbound');assert.equal(b.matches.length,0);assert.match(r.headers.get('cache-control'),/no-store/);}
  evidence.checks.push({service:'whatsapp_proof',authenticated,status:r.status,...authenticated?{unknown_reference_matches:0}:{}});
}
const path='website-attribution/v1/'+id+'.json';let owns=false;
try{
  const r=await fetch(base+'/api/outbound',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({channel:'whatsapp',inquiry_id:id,page:'/pilates-price.html',consent:'denied',ref:{utm_source:'test-do-not-preserve'}})});
  assert.equal(r.status,200);owns=true;
  const blob=await get(path,{access:'private',useCache:false});assert.equal(blob.statusCode,200);
  const row=await new Response(blob.stream).json();
  assert.equal(row.inquiry_id,id);assert.equal(row.state,'outbound_intent');assert.equal(row.source,'unknown');assert.equal(row.submitted_page,'/pilates-price.html');assert.equal(row.arbox_user_id,undefined);
  assert.ok([401,403,404].includes((await fetch(blob.blob.url)).status));
  evidence.checks.push({service:'website_intent',saved_privately:true,page_preserved:true,declined_consent_source:'unknown',crm_lead_created:false});
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const result=await fetch(base+'/api/attribution?from='+day+'&to='+day,{headers:{Authorization:'Bearer '+process.env.ATTRIBUTION_REPORT_TOKEN.trim()}});
  assert.equal(result.status,200);const report=await result.json();
  assert.equal(report.coverage.whatsapp_status,'checked');assert.ok(report.coverage.pending_whatsapp_intents>=1);assert.ok(!report.inquiries.some(i=>i.inquiry_id===id));
  evidence.checks.push({service:'protected_report',status:200,whatsapp_lookup:'checked',unsent_click_counted_as_inquiry:false,direct_arbox:report.coverage.direct_arbox});
}finally{if(owns){await del(path);evidence.disposable_intent_removed=true;}}
await writeFile('_preview/measurement-2026-11-01/whatsapp-live.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify(evidence,null,2));
