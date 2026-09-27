const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const base=html.match(/var ARBOX='([^']+)'/)[1];
const flush=()=>new Promise(r=>setImmediate(r));
function harness(instant){
  let clock=Date.parse(instant);class ClockDate extends Date{constructor(...args){super(...(args.length?args:[clock]))}}
  function el(){return {children:[],style:{},dataset:{},attrs:{},listeners:{},get firstChild(){return this.children[0]},appendChild(x){this.children.push(x)},removeChild(x){this.children.splice(this.children.indexOf(x),1)},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this.listeners[k]=f},closest(){return {remove(){}}}}}
  const nodes=Object.fromEntries(['rows','chips','days','board','more','weekly'].map(k=>['#'+k,el()])),pending=[],intervals=[];
  const c={Date:ClockDate,Intl,URL,Promise,$:s=>nodes[s],ARBOX:base,WA:'https://wa.me/972527927575',window:{},matchMedia:()=>({matches:true,addEventListener(){}}),setTimeout(){},setInterval:f=>intervals.push(f),document:{createElement:el,createTextNode:t=>({textContent:t}),addEventListener(){},hidden:false},fetch:url=>new Promise((resolve,reject)=>pending.push({url,resolve:data=>resolve({ok:true,json:()=>Promise.resolve(data)}),reject}))};
  const start=html.indexOf('(function(){',html.indexOf('/* ═══ מערכת שעות חיה'));
  let code=html.slice(start,html.indexOf('/* ── מאיפה היא הגיעה',start)).trim();
  code=code.replace(/\}\)\(\);$/, 'this.qa={state,cache,load,render,refreshSchedule,getIsraelNow,getArboxUrl,getDates:()=>dates};})();');
  vm.createContext(c);vm.runInContext(code,c);
  return {qa:c.qa,nodes,pending,intervals,setClock:t=>{clock=Date.parse(t)},text:()=>JSON.stringify(nodes['#rows'].children),links:()=>nodes['#rows'].children.map(r=>r.children?.[2]).filter(a=>a?.attrs?.['data-track']==='trial-cta arbox-open')};
}
test('Israel date and expiry work with a foreign device timezone, including daylight saving transitions',async()=>{
  for(const instant of ['2026-09-27T21:15:00Z','2026-10-24T21:15:00Z','2026-10-25T22:15:00Z']){
    const h=harness(instant);assert.equal(h.qa.getDates()[0],new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(instant)));
  }
  const h=harness('2026-09-27T03:59:00Z');h.pending[0].resolve([{session_name:'GYM',start_time:'07:00',schedule_id:123}]);await flush();assert.equal(h.links().length,1);
  h.setClock('2026-09-27T04:00:00Z');h.intervals[0]();assert.equal(h.links().length,0);
});
test('midnight rebuilds fourteen dates and retains a selected future date',async()=>{
  const h=harness('2026-09-27T20:59:00Z');h.qa.state.day=2;const selected=h.qa.getDates()[2];
  h.setClock('2026-09-27T21:00:00Z');h.qa.refreshSchedule();assert.equal(h.qa.getDates()[0],'2026-09-28');assert.equal(h.qa.getDates()[h.qa.state.day],selected);assert.equal(h.nodes['#days'].children.length,14);
  h.setClock('2026-10-12T21:00:00Z');h.qa.refreshSchedule();assert.equal(h.qa.state.day,0);assert.equal(h.qa.getDates()[0],'2026-10-13');
});
test('failure from an abandoned day cannot replace the selected day',async()=>{
  const h=harness('2026-09-27T03:00:00Z');h.qa.state.day=1;h.qa.load(1);
  h.pending[1].resolve([{session_name:'GYM selected',start_time:'08:00',schedule_id:456}]);await flush();assert.match(h.text(),/GYM selected/);
  h.pending[0].reject(Error('old request failed'));await flush();assert.match(h.text(),/GYM selected/);
});
test('direct class links keep the approved trial parameters; invalid IDs use the general trial page',()=>{
  const h=harness('2026-09-27T03:00:00Z');for(const id of [123,'456','bad/1',undefined]){const u=new URL(h.qa.getArboxUrl({schedule_id:id}));assert.equal(u.pathname,/^\d+$/.test(String(id))?'/group/'+id:'/group');assert.equal(u.search,new URL(base).search);assert.equal(JSON.parse(u.searchParams.get('filters')).trial,'trial')}
});
test('invalid API payload shows a recovery link without a false class',async()=>{
  const h=harness('2026-09-27T03:00:00Z');h.pending[0].resolve({wrong:true});await flush();assert.match(h.text(),/לא הצלחנו/);assert.equal(h.links().length,0);
});
test('all homepage inline JavaScript parses',()=>{for(const [,script]of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(script.trim().startsWith('{'))continue;new vm.Script(script)}});

