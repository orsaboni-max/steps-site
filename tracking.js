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
        FIELDS=['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    function read(){try{var r=JSON.parse(w.localStorage.getItem(KEY)||'null');
      return (r&&r.t&&Date.now()-r.t<(r.ref_only?REF_AGE:MAX_AGE))?r:null}catch(e){return null}}
    try{
      var q=new URLSearchParams(w.location.search),fresh={},any=false,source='',prior=read();
      FIELDS.forEach(function(f){var v=q.get(f);if(v){fresh[f]=String(v).slice(0,200);any=true}});
      if(!any&&d.referrer&&w.localStorage.getItem('steps-consent')==='granted'){
        try{var u=new URL(d.referrer),h=u.hostname.toLowerCase();
          if(u.protocol==='https:'&&/(^|\.)(google\.com|google\.co\.il|bing\.com|duckduckgo\.com|yahoo\.com|chatgpt\.com|perplexity\.ai)$|^copilot\.microsoft\.com$/.test(h))source=u.origin+'/';
        }catch(e){}
      }
      if((any&&(!prior||prior.ref_only))||(source&&!prior)){
        fresh.t=Date.now();fresh.landing=w.location.pathname.slice(0,120);
        if(any){try{fresh.ref=d.referrer.slice(0,200)}catch(e){}}
        else{fresh.ref=source;fresh.ref_only=true}
        w.localStorage.setItem(KEY,JSON.stringify(fresh));
      }
    }catch(e){/* Blocked storage must not prevent using the form. */}
    return read()||{};
  })();
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
