const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname+'/../barre.html','utf8');
const base = 'https://bp4jsudd1589999012.web.arboxapp.com/group?lang=he&location=18259&referrer=PLUGIN&filters=%7B%22boxCategories%22%3A%5B45670%5D%2C%22trial%22%3A%22trial%22%7D&utm_source=google';
function element(){return {children:[],attrs:{},get firstChild(){return this.children[0]},appendChild(v){this.children.push(v)},removeChild(v){this.children.splice(this.children.indexOf(v),1)},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]}}}
test('selected Barre IDs preserve trial, category, language and attribution with safe fallback',()=>{
  for(const mobile of [true,false]){
    const list=element();
    const c={URL,matchMedia:()=>({matches:mobile}),document:{createElement:element,querySelector:()=>({href:base}),getElementById:()=>list}};
    vm.createContext(c);
    vm.runInContext(html.slice(html.indexOf('  function mkEl(tag,cls)'),html.indexOf('  var cache=')),c);
    c.renderItems([{schedule_id:54133329,session_name:'Barre',start_time:'18:00'},{schedule_id:'bad/1',session_name:'Barre',start_time:'19:00'}]);
    assert.deepEqual(list.children.map(r=>new URL(r.children[2].href).pathname),['/group/trial/54133329','/group']);
    for(const row of list.children){const a=row.children[2];assert.equal(new URL(a.href).search,new URL(base).search);assert.equal(a.target,mobile?undefined:'_blank');assert.match(a.attrs['aria-label'],/הרשמה לBarre בשעה/)}
    c.renderItems([],'אין עוד שיעורים');assert.equal(list.children.length,1);assert.equal(list.children[0].textContent,'אין עוד שיעורים');
  }
});
test('a dynamic registration link emits interest events once, without a lead event',()=>{
  const events=[],el=element();el.textContent='נרשמת';el.href=base;el.attrs['data-track']='trial-cta arbox-open';
  let click;
  const c={location:{href:'https://stepsnetanya.co.il/barre.html'},gtag:(...args)=>events.push(args),document:{addEventListener:(type,fn)=>{if(type==='click')click=fn}}};
  vm.runInNewContext(html.match(/\/\/ Conversion tracking\s*([\s\S]*?)<\/script>/)[1],c);
  click({target:{closest:()=>el}});
  assert.deepEqual(events.map(e=>e[1]),['cta_trial_click','arbox_open']);
  assert.equal(events[1][2].link_url,base);
});
test('all inline draft scripts parse',()=>{
  for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(script.trim().startsWith('{'))continue;new vm.Script(script)}
});
