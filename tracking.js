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
  // Capture tagged arrivals on every marketing page, before navigation to the home form.
  // Keep the existing first-touch fields, limits and 90-day lifetime.
  w.STEPS_REFERRAL=(function(){
    var KEY='steps_ref',MAX_AGE=90*24*60*60*1000,
        FIELDS=['fbclid','gclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    function read(){try{var r=JSON.parse(w.localStorage.getItem(KEY)||'null');
      return (r&&r.t&&Date.now()-r.t<MAX_AGE)?r:null}catch(e){return null}}
    try{
      var q=new URLSearchParams(w.location.search),fresh={},any=false;
      FIELDS.forEach(function(f){var v=q.get(f);if(v){fresh[f]=String(v).slice(0,200);any=true}});
      if(any&&!read()){
        fresh.t=Date.now();fresh.landing=w.location.pathname.slice(0,120);
        try{fresh.ref=d.referrer.slice(0,200)}catch(e){}
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
