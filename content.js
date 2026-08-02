/* STEPS — דפי התוכן. אותה התנהגות של דפי הנחיתה, בקובץ אחד במקום
   בארבעה עותקים: ניווט · הסכמה לעוגיות · מודאל נגישות · מדידה · חשיפה.
   טוען עם defer, ולכן ה-DOM כבר קיים כשהקובץ רץ. */
(function(){
'use strict';

/* ── ניווט ─────────────────────────────────────────────────── */
var nav=document.getElementById('nav');
addEventListener('scroll',function(){if(nav)nav.classList.toggle('solid',scrollY>80)});

var mobBtn=document.getElementById('mobBtn'),
    nLinks=document.getElementById('navLinks'),
    mobOv=document.getElementById('mobOverlay');
function toggleMenu(){
  var o=nLinks.classList.toggle('open');
  mobOv.classList.toggle('open');
  mobBtn.textContent=o?'✕':'☰';
  mobBtn.setAttribute('aria-expanded',o?'true':'false');
}
if(mobBtn&&nLinks&&mobOv){
  mobBtn.addEventListener('click',toggleMenu);
  mobOv.addEventListener('click',toggleMenu);
  document.querySelectorAll('.n-links a').forEach(function(a){
    a.addEventListener('click',function(){if(nLinks.classList.contains('open'))toggleMenu();});
  });
}

/* גלילה רכה לעוגנים בתוך הדף בלבד. href="#" לבדו אינו סלקטור חוקי
   ל-querySelector וזורק שגיאה, ולכן נבדק לפני. */
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    var h=this.getAttribute('href');
    if(!h||h==='#')return;
    var t=null;
    try{t=document.querySelector(h)}catch(err){return}
    if(!t)return;
    e.preventDefault();
    if(nLinks&&nLinks.classList.contains('open'))toggleMenu();
    t.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

/* ── הסכמה לעוגיות ─────────────────────────────────────────── */
function initTracking(){
  if(typeof gtag==='function')gtag('consent','update',{'analytics_storage':'granted','ad_storage':'granted','ad_user_data':'granted','ad_personalization':'granted'});
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  if(typeof fbq==='function'){fbq('init','1016773848190436');fbq('track','PageView');}
}
var banner=document.getElementById('cookie-banner');
window.acceptCookies=function(){try{localStorage.setItem('steps-consent','granted')}catch(e){}if(banner)banner.style.display='none';initTracking();};
window.declineCookies=function(){try{localStorage.setItem('steps-consent','declined')}catch(e){}if(banner)banner.style.display='none';};
var consent=null;
try{consent=localStorage.getItem('steps-consent')}catch(e){}
if(consent==='granted')initTracking();
else if(consent!=='declined'&&banner)banner.style.display='flex';

/* חזרה מהסכמה (תיקון 13). פיקסל שכבר נטען אי-אפשר להוריד מהדף — לכן
   מוחקים את הבחירה וטוענים מחדש: בטעינה החדשה הוא לא עולה והבאנר חוזר. */
var rst=document.getElementById('ckReset');
if(rst)rst.addEventListener('click',function(){try{localStorage.removeItem('steps-consent')}catch(e){}location.reload();});

/* ── מודאל נגישות ──────────────────────────────────────────── */
var modal=document.getElementById('acc-modal'),accBtn=document.getElementById('acc-btn');
function openAcc(){if(modal){modal.style.display='flex';var x=modal.querySelector('.modal-x');if(x)x.focus();}}
function closeAcc(){if(modal){modal.style.display='none';if(accBtn)accBtn.focus();}}
if(accBtn)accBtn.addEventListener('click',openAcc);
if(modal){
  modal.addEventListener('click',function(e){if(e.target===modal)closeAcc()});
  modal.querySelectorAll('[data-acc-close]').forEach(function(b){b.addEventListener('click',closeAcc)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.style.display==='flex')closeAcc()});
}

/* ── מדידת המרות ───────────────────────────────────────────── */
function trackEvent(name,params){
  params=params||{};
  params.page_location=location.href;
  if(typeof gtag==='function')gtag('event',name,params);
  if(typeof fbq==='function'){
    if(name==='arbox_open')fbq('track','Lead',params);
    else fbq('trackCustom',name,params);
  }
}
document.querySelectorAll('[data-track]').forEach(function(el){
  el.addEventListener('click',function(){
    var t=el.getAttribute('data-track')||'';
    if(t.indexOf('trial-cta')>-1)trackEvent('cta_trial_click',{cta_text:(el.textContent||'').trim()});
    if(t.indexOf('whatsapp-click')>-1)trackEvent('whatsapp_click',{link_url:el.href||''});
    if(t.indexOf('arbox-open')>-1)trackEvent('arbox_open',{link_url:el.href||''});
  });
});

/* אין חשיפה-בגלילה בדפים האלה. בדפי הנחיתה היא מסתירה מקטעים עד
   שגוללים אליהם, וזה בסדר שם. כאן מדובר במאמר של 1,500 מילים —
   הבהוב של כל פסקה בנפרד מפריע לקריאה, וכל מנגנון שמסתיר טקסט
   בברירת מחדל הוא עוד דרך שבה טקסט עלול להישאר בלתי-נראה. */
})();
