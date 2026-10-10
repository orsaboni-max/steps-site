/* עזרים משותפים לשלוש הדוגמאות.
   באתר החי השיעורים מגיעים מ-/api/schedule (Arbox). בדמו אין שרת, ולכן נטען צילום
   אמיתי של הלוח (schedule-snapshot.json, נמשך מארבוקס ב-10/10/26) והשעון מקובע
   לראשון 11/10 06:30 — כדי שהדמו ייראה זהה בכל יום שפותחים אותו. */
(function(){
  'use strict';
  var WA='https://wa.me/972527927575';
  var ARBOX='https://BP4JSUDD1589999012.web.arboxapp.com/group?whitelabel=Arbox&lang=he&location=18259&referrer=PLUGIN&filters=%7B%22trial%22%3A%22trial%22%2C%22pageName%22%3A%22group%22%7D';
  var LAB_NOW={date:'2026-10-11',time:'06:30'};
  var DAY=['א','ב','ג','ד','ה','ו','ש'];
  var data=null;

  // אותו סיווג כמו בלוח החי בדף הבית (index.html → roomOf)
  function roomOf(name){
    var n=(name||'').toLowerCase();
    if(/kids|teens|ילדים|ילדות|נוער|נערות|נערים/.test(n))return 'KIDS';
    if(/מכשירים|רפורמר|reformer|מתקדמים/.test(n))return 'REF';
    if(/barre|yoga|יוגה|sculpt|גמישות|מזרן|booty|core|(^|\s)בר(\s|$)/.test(n))return 'MOVE';
    return 'GYM';
  }
  function partOf(t){return t<'12:00'?'morning':t<'16:00'?'noon':'evening'}
  function dayLabel(iso){
    var diff=Math.round((Date.parse(iso)-Date.parse(LAB_NOW.date))/864e5);
    if(diff===0)return 'היום';
    if(diff===1)return 'מחר';
    var d=new Date(iso+'T12:00:00Z');
    return 'יום '+DAY[d.getUTCDay()]+'׳';
  }
  function trialUrl(s){
    var u=new URL(ARBOX);
    if(s&&/^\d+$/.test(String(s.schedule_id)))u.pathname='/group/trial/'+s.schedule_id;
    return u.href;
  }
  function waLink(text){
    if(text.indexOf('הגעתי מהאתר')<0)text+=' (הגעתי מהאתר)';
    return WA+'?text='+encodeURIComponent(text);
  }
  function load(){
    if(data)return Promise.resolve(data);
    return fetch('schedule-snapshot.json').then(function(r){return r.json()}).then(function(d){data=d;return d});
  }
  /* השיעורים הבאים בחלל מסוים (ובחלון זמן אם נבחר), מהשעון ואילך */
  function upcoming(opts){
    opts=opts||{};
    return load().then(function(d){
      var out=[];
      Object.keys(d).sort().forEach(function(iso){
        if(iso<LAB_NOW.date)return;
        d[iso].forEach(function(s){
          var t=(s.start_time||'').slice(0,5);
          if(iso===LAB_NOW.date&&t<=LAB_NOW.time)return;
          if(opts.room&&roomOf(s.session_name)!==opts.room)return;
          if(opts.part&&partOf(t)!==opts.part)return;
          out.push({iso:iso,day:dayLabel(iso),time:t,end:(s.end_time||'').slice(0,5),name:s.session_name,coach:s.coach,room:roomOf(s.session_name),url:trialUrl(s)});
        });
      });
      out.sort(function(a,b){return (a.iso+a.time)<(b.iso+b.time)?-1:1});
      return opts.n?out.slice(0,opts.n):out;
    });
  }
  function weekCount(){
    return load().then(function(d){return Object.keys(d).reduce(function(n,k){return k<LAB_NOW.date?n:n+d[k].length},0)});
  }
  function track(name,payload){
    (window.dataLayer=window.dataLayer||[]).push(Object.assign({event:name},payload||{}));
    if(window.console)console.log('[track]',name,payload||'');
  }
  window.STEPS={WA:WA,ARBOX:ARBOX,NOW:LAB_NOW,roomOf:roomOf,partOf:partOf,dayLabel:dayLabel,trialUrl:trialUrl,waLink:waLink,upcoming:upcoming,weekCount:weekCount,track:track,
    reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
})();
