/* Production-only measurement. Consent UI and form submission remain independent. */
(function(w,d){
  'use strict';
  var enabled=w.location.protocol==='https:'&&w.location.hostname==='stepsnetanya.co.il';
  w.STEPS_TRACKING_ENABLED=enabled;
  if(!enabled){
    // Existing pixel loaders stop when their queue function already exists.
    w.gtag=w.fbq=w.oaiq=function(){};
    return;
  }
  // Legal pages previously had no GA4 and keep that behavior.
  if(!d.currentScript.hasAttribute('data-ga'))return;
  // Keep tagged campaign attribution; preserve a short-lived source host for untagged search/AI visits.
  w.STEPS_REFERRAL=(function(){
    var KEY='steps_ref',MAX_AGE=90*24*60*60*1000,REF_AGE=7*24*60*60*1000,
        FIELDS=['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term','ad_id'];
    function read(){try{var r=JSON.parse(w.localStorage.getItem(KEY)||'null');
      return (r&&r.t&&Date.now()-r.t<(r.ref_only?REF_AGE:MAX_AGE))?r:null}catch(e){return null}}
    function sourceHost(){
      if(!d.referrer)return '';
      try{var u=new URL(d.referrer),h=u.hostname.toLowerCase();
        return u.protocol==='https:'&&/(^|\.)(google\.com|google\.co\.il|bing\.com|duckduckgo\.com|yahoo\.com|chatgpt\.com|perplexity\.ai)$|^copilot\.microsoft\.com$/.test(h)?u.origin+'/':'';
      }catch(e){return ''}
    }
    try{
      var q=new URLSearchParams(w.location.search),fresh={},any=false,source='',prior=read();
      FIELDS.forEach(function(f){var v=q.get(f);if(v){fresh[f]=String(v).slice(0,200);any=true}});
      if(!any&&w.localStorage.getItem('steps-consent')==='granted')source=sourceHost();
      if((any&&(!prior||prior.ref_only))||(!prior&&w.localStorage.getItem('steps-consent')==='granted')){
        fresh.t=Date.now();fresh.landing=w.location.pathname.slice(0,120);
        if(any){try{fresh.ref=d.referrer.slice(0,200)}catch(e){}}
        else{if(source)fresh.ref=source;fresh.ref_only=true}
        w.localStorage.setItem(KEY,JSON.stringify(fresh));
      }
    }catch(e){/* Blocked storage must not prevent using the form. */}
    var result=read()||{};
    // On a first visit, the search referrer still belongs to this page when consent is accepted.
    // Update the same object so the home form's reference sees the source without a reload.
    if(!read()&&d.addEventListener)d.addEventListener('click',function(e){
      if(!e.target||!e.target.closest||!e.target.closest('#ckOk,.ck-ok'))return;
      try{
        if(w.localStorage.getItem('steps-consent')!=='granted'||read())return;
        var source=sourceHost();
        var fresh={t:Date.now(),landing:w.location.pathname.slice(0,120),ref:source,ref_only:true};
        w.localStorage.setItem(KEY,JSON.stringify(fresh));
        for(var key in fresh)result[key]=fresh[key];
      }catch(e){/* Consent or attribution storage may be unavailable. */}
    });
    return result;
  })();
  // Attach an inquiry reference without delaying or changing WhatsApp navigation.
  // The beacon is an intent only; received-message evidence is required server-side.
  if(w.crypto&&w.crypto.randomUUID&&d.addEventListener){
    var originals=new WeakMap();
    function whatsappIntent(e){
      var a=e.target&&e.target.closest&&e.target.closest('a[href]');
      if(!a||e.defaultPrevented||(e.type==='auxclick'&&e.button!==1))return;
      try{
        var u=new URL(originals.get(a)||a.href,w.location.href);
        if(u.protocol!=='https:'||u.hostname!=='wa.me'||u.pathname!=='/972527927575')return;
        var text=u.searchParams.get('text');
        // Cancellation and legal-contact links deliberately carry no website campaign text.
        if(!text||text.indexOf('הגעתי מהאתר')<0)return;
        originals.set(a,u.href);
        var id=w.crypto.randomUUID(),consent='';
        try{consent=w.localStorage.getItem('steps-consent')||''}catch(ignore){}
        u.searchParams.set('text',text+'\nעמוד באתר: https://stepsnetanya.co.il'+w.location.pathname+'\n[STEPS:'+id+']');
        var payload=JSON.stringify({channel:'whatsapp',inquiry_id:id,page:w.location.pathname||'/',consent:consent,ref:w.STEPS_REFERRAL||{}});
        var sent=w.navigator.sendBeacon&&w.navigator.sendBeacon('/api/outbound',new Blob([payload],{type:'application/json'}));
        if(!sent&&w.fetch)w.fetch('/api/outbound',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}).catch(function(){});
        a.href=u.href;
      }catch(ignore){/* Storage, beacon or URL failure must not block contacting the studio. */}
    }
    d.addEventListener('click',whatsappIntent,true);
    d.addEventListener('auxclick',whatsappIntent,true);
  }
  w.dataLayer=w.dataLayer||[];
  w.gtag=function(){w.dataLayer.push(arguments)};
  w.gtag('consent','default',{'analytics_storage':'denied','ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':500});
  var script=d.createElement('script');
  script.async=true;
  script.src='https://www.googletagmanager.com/gtag/js?id=G-5T22VE9YHT';
  d.head.appendChild(script);
  w.gtag('js',new Date());
  w.gtag('config','G-5T22VE9YHT');
})(window,document);
