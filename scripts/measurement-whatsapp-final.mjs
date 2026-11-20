import assert from 'node:assert/strict';
import { readFile,writeFile } from 'node:fs/promises';
const base='https://stepsnetanya.co.il';
const evidence={deployment:'dpl_Fmv648vBpQSqMm1gwqyAeQZcDs9u',checked_at:new Date().toISOString(),checks:[]};
for(const [url,file] of [['/','index.html'],['/tracking.js','tracking.js'],['/privacy.html','privacy.html'],['/sitemap.xml','sitemap.xml']]){
 const r=await fetch(base+url);assert.equal(r.status,200);assert.equal((await r.text()).replace(/\r\n/g,'\n'),(await readFile(file,'utf8')).replace(/\r\n/g,'\n'));evidence.checks.push({url,status:200,matches_source:true});
}
assert.equal((await fetch(base+'/api/attribution?from=2026-11-01&to=2026-11-01')).status,401);
evidence.checks.push({url:'/api/attribution',unauthorized_status:401});
const report=await fetch(base+'/api/attribution?from=2026-11-01&to=2026-11-01',{headers:{Authorization:'Bearer '+process.env.ATTRIBUTION_REPORT_TOKEN.trim()}});
assert.equal(report.status,200);assert.match(report.headers.get('cache-control'),/no-store/);const body=await report.json();assert.deepEqual(body.coverage.channels,['website_form','website_whatsapp_reference']);assert.equal(body.coverage.direct_arbox,'not_linked');
evidence.checks.push({url:'/api/attribution',authorized_status:200,private_no_store:true,coverage:body.coverage,inquiry_count:body.inquiries.length});
for(const url of ['/.env.measurement.local','/_preview/measurement-2026-11-01/whatsapp-live.json','/docs/decisions/2026-11-01-website-attribution-implementation.md','/lib/whatsapp-attribution.test.mjs','/scripts/measurement-whatsapp-live.mjs','/api/lead.test.mjs','/ads.html','/ads-board.html','/nutrition-v3.html']){
 const r=await fetch(base+url,{redirect:'manual'});assert.equal(r.status,url==='/nutrition-v3.html'?307:404,url);evidence.checks.push({url,status:r.status});
}
await writeFile('_preview/measurement-2026-11-01/whatsapp-final-live.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));
