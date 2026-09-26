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
