import { ledger, personKey, type RecordData } from './attribution.ts';
import { localDay } from './outcomes.ts';

const TENANT = '7ef4ffae-b657-46ab-a68a-36fc24c05641';
const DAY = 86400000;
export function normalizePhone(raw: unknown): string {
  if(typeof raw !== 'string') return '';
  const digits=raw.replace(/[^0-9]/g,'');
  const local=digits.startsWith('972')?'0'+digits.slice(3):digits;
  return /^05\d{8}$/.test(local)?local:'';
}

async function officialIdentity(phone: string, fetcher: typeof fetch): Promise<number | null> {
  const q=new URLSearchParams({type:'phone',value:phone,location_id:'18259'});
  const r=await fetcher('https://arboxserver.arboxapp.com/api/public/v3/users/searchUser?'+q,{headers:{'api-key':process.env.ARBOX_API_KEY || '',Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!r.ok) throw Error('identity_unavailable');
  const b=await r.json();
  if(b.statusCode && Number(b.statusCode)!==200 || !Array.isArray(b.data) || b.extra?.pagination?.next_page_url) throw Error('identity_incomplete');
  // A shared number with multiple official cards is ambiguous. Do not guess by name.
  const ids=new Set<number>(b.data.filter((x:RecordData)=>normalizePhone(x.phone)===phone && Number.isSafeInteger(x.user_id) && x.user_id>0 && (Number(x.location_id)===18259 || String(x.location_name||'').includes('פולג'))).map((x:RecordData)=>x.user_id));
  return ids.size===1?[...ids][0]:null;
}

/** Report-time reconciliation, read-only in WhatsApp/Arbox; private attribution writes only. */
export async function reconcileWhatsApp(records: RecordData[], range:{from:string;to:string}, fetcher=fetch, store=ledger, now=Date.now()) {
  const from=Date.parse(range.from+'T00:00:00Z')-8*DAY;
  const end=Math.min(Date.parse(range.to+'T23:59:59Z'),now);
  const pending=records.filter(i=>i.channel==='whatsapp' && i.state==='outbound_intent' && Date.parse(i.created_at)>=from && Date.parse(i.created_at)<=end);
  if(!pending.length) return {records,pending_intents:0,whatsapp_status:'no_pending_intents'};
  if(!process.env.WEBSITE_ATTRIBUTION_TOKEN || !process.env.ATTRIBUTION_SECRET) return {records,pending_intents:pending.length,whatsapp_status:'not_configured'};
  if(pending.length>200) throw Error('whatsapp_batch_limit');
  const proofs:RecordData[]=[];
  // Each request covers at most seven intent days plus their seven-day receipt window.
  const groups=new Map<number,RecordData[]>();
  for(const i of pending){const day=Math.floor(Date.parse(i.created_at)/(7*DAY));if(!groups.has(day))groups.set(day,[]);groups.get(day)!.push(i);}
  for(const group of groups.values()) for(let offset=0;offset<group.length;offset+=50){
    const batch=group.slice(offset,offset+50);
    const after=Math.min(...batch.map(i=>Date.parse(i.created_at)));
    const before=Math.min(end,Math.max(...batch.map(i=>Date.parse(i.created_at)))+7*DAY);
    const r=await fetcher('https://steps-backend-production.up.railway.app/integrations/website/whatsapp',{method:'POST',headers:{Authorization:'Bearer '+process.env.WEBSITE_ATTRIBUTION_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({references:batch.map(i=>i.inquiry_id),after:new Date(after).toISOString(),before:new Date(before).toISOString()}),signal:AbortSignal.timeout(15000)});
    if(!r.ok) throw Error('whatsapp_evidence_unavailable');
    const b=await r.json();
    if(b.tenant!==TENANT || b.evidence!=='received_meta_inbound' || !Array.isArray(b.matches)) throw Error('whatsapp_evidence_invalid');
    proofs.push(...b.matches);
  }
  const updated=new Map(records.map(i=>[i.inquiry_id,i]));
  const identities=new Map<string,number|null>();
  let lookups=0,received=0;
  for(const intent of pending){
    const matches=proofs.filter(p=>p.reference===intent.inquiry_id && typeof p.message_id==='string' && p.message_id.startsWith('wamid.') && normalizePhone(p.phone) && Date.parse(p.received_at)>=Date.parse(intent.created_at) && Date.parse(p.received_at)<=Math.min(end,Date.parse(intent.created_at)+7*DAY));
    const phones=new Set(matches.map(p=>normalizePhone(p.phone)));
    if(phones.size!==1) continue;
    const phone=[...phones][0], first=matches.sort((a,b)=>a.received_at.localeCompare(b.received_at))[0];
    // Bound API cost; unresolved identities can be retried in the next report.
    if(!identities.has(phone) && lookups>=10) continue;
    if(!identities.has(phone)){identities.set(phone,await officialIdentity(phone,fetcher));lookups++;}
    const id=identities.get(phone);
    const row={...intent,intent_created_at:intent.created_at,created_at:first.received_at,state:id?'linked':'received_unmatched',evidence:'received_meta_inbound',person_key:personKey(phone),arbox_user_id:id || null};
    // Do not persist unmatched yet: a receptionist may create the Arbox card later.
    if(id) await store.write(intent.inquiry_id,row,true);
    updated.set(intent.inquiry_id,row);received++;
  }
  return {records:[...updated.values()],pending_intents:pending.length-received,whatsapp_status:'checked',identity_lookups:lookups};
}

export function inReport(i:RecordData, range:{from:string;to:string}) {
  return i.state!=='outbound_intent' && localDay(i.created_at)>=range.from && localDay(i.created_at)<=range.to;
}
