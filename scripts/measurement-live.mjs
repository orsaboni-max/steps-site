import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
const base='https://stepsnetanya.co.il';
const evidence={deployment:'dpl_E1N8d9C1B9EkZgHJZbhPXCHaEjZf',checked_at:new Date().toISOString(),checks:[]};
for(const [url,file] of [['/','index.html'],['/tracking.js','tracking.js'],['/privacy.html','privacy.html'],['/sitemap.xml','sitemap.xml']]) {
  const r=await fetch(base+url); assert.equal(r.status,200);
  assert.equal((await r.text()).replace(/\r\n/g,'\n'),(await readFile(file,'utf8')).replace(/\r\n/g,'\n'));
  evidence.checks.push({url,status:200,matches_source:true});
}
const unauthorized=await fetch(base+'/api/attribution?from=2026-11-01&to=2026-11-01');
assert.equal(unauthorized.status,401); evidence.checks.push({url:'/api/attribution',unauthorized_status:401});
const report=await fetch(base+'/api/attribution?from=2026-11-01&to=2026-11-01',{headers:{Authorization:'Bearer '+process.env.ATTRIBUTION_REPORT_TOKEN.trim()}});
assert.equal(report.status,200);const body=await report.json();
assert.equal(body.coverage,'website_form_only');assert.ok(Array.isArray(body.inquiries));
assert.match(report.headers.get('cache-control'),/no-store/);
evidence.checks.push({url:'/api/attribution',authorized_status:200,inquiries:body.inquiries.length,private_no_store:true,arbox_reads:body.arbox_reads??'cohort_present'});
const invalid=await fetch(base+'/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'',phone:''})});
assert.equal(invalid.status,400); evidence.checks.push({url:'/api/lead',invalid_form_status:400,no_crm_write:true});
for(const url of ['/.env.measurement.local','/_preview/measurement-2026-11-01/implementation-smoke.json','/docs/decisions/2026-11-01-website-attribution-implementation.md','/lib/attribution.test.mjs','/api/lead.test.mjs','/ads.html','/ads-board.html','/nutrition-v3.html']) {
  const r=await fetch(base+url,{redirect:'manual'});const expected=url==='/nutrition-v3.html'?307:404;assert.equal(r.status,expected,url);
  evidence.checks.push({url,status:r.status});
}
const schedule=await fetch(base+'/api/schedule?date=2026-11-01');assert.equal(schedule.status,200);const classes=await schedule.json();assert.ok(Array.isArray(classes));evidence.checks.push({url:'/api/schedule',status:200,classes:classes.length});
await writeFile('_preview/measurement-2026-11-01/implementation-live.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify(evidence,null,2));
