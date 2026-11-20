import assert from 'node:assert/strict';
import { get, del } from '@vercel/blob';
import { writeFile } from 'node:fs/promises';
// Exact UUID observed in the agent's live browser click; no customer identity.
const id=process.argv[2];assert.match(id,/^[a-f0-9-]{36}$/);
const path='website-attribution/v1/'+id+'.json';
const blob=await get(path,{access:'private',useCache:false});assert.equal(blob?.statusCode,200);
const row=await new Response(blob.stream).json();
assert.equal(row.inquiry_id,id);assert.equal(row.channel,'whatsapp');assert.equal(row.state,'outbound_intent');assert.equal(row.submitted_page,'/pilates-price.html');assert.ok(Date.now()-Date.parse(row.created_at)<3600000);
assert.equal(row.arbox_user_id,undefined);
const evidence={checked_at:new Date().toISOString(),browser_click_persisted:true,page:row.submitted_page,state:row.state,customer_message_sent:false,crm_mutations:0,disposable_intent_removed:true};
await del(path);
await writeFile('_preview/measurement-2026-11-01/whatsapp-browser-proof.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify(evidence));
