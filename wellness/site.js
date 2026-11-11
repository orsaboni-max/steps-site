const audio = document.querySelector('#mix');
const audioButtons = [...document.querySelectorAll('.audio-button')];
const audioStatus = document.querySelector('#audio-status');
const reel = document.querySelector('.reel video');
const dock = document.querySelector('[data-dock]');

function showAudioState(playing) {
  for (const button of audioButtons) {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'עצירת מוזיקה' : 'הפעלת מוזיקה');
    button.querySelector('[data-audio-label]').textContent = playing ? 'לעצור מוזיקה' : 'לנגן מוזיקה';
  }
}

audio.volume = 0.45;
audio.addEventListener('play', () => showAudioState(true));
audio.addEventListener('pause', () => showAudioState(false));
reel?.addEventListener('play', () => audio.pause());

for (const button of audioButtons) {
  button.addEventListener('click', async () => {
    if (!audio.paused) { audio.pause(); return; }
    reel?.pause();
    audioStatus.textContent = '';
    try { await audio.play(); }
    catch { showAudioState(false); audioStatus.textContent = 'המוזיקה לא נטענה. אפשר לנסות שוב.'; }
  });
}

// Music is on by default. Browsers only allow sound after the visitor's first touch or click,
// so we try right away and otherwise start on that first interaction. The button turns it off.
let userStopped = false;
for (const button of audioButtons) button.addEventListener('click', () => { if (!audio.paused) userStopped = true; }, { capture: true });
const kick = () => { if (!userStopped && audio.paused) audio.play().catch(() => {}); };
audio.play().catch(() => {
  const once = e => {
    if (e.target.closest?.('.audio-button, .reel')) return;
    kick();
    ['pointerdown','keydown','touchend'].forEach(t => removeEventListener(t, once, true));
  };
  ['pointerdown','keydown','touchend'].forEach(t => addEventListener(t, once, true));
});

// Days left until the event (Israel time), shown next to the sign-up count.
const cd = document.querySelector('[data-countdown]');
if (cd) {
  const days = Math.ceil((new Date('2026-11-27T08:00:00+02:00') - Date.now()) / 864e5);
  cd.textContent = days > 1 ? `עוד ${days} ימים` : days === 1 ? 'זה מחר!' : days === 0 ? 'זה היום!' : '';
}

// The booking dock appears on phones once the hero button has scrolled away, and steps aside for the other booking buttons.
if (dock && window.matchMedia('(max-width: 620px)').matches) {
  const anchors = [...document.querySelectorAll('.hero .cta, .how .cta, .closing .cta')];
  const visible = new Set();
  const update = () => {
    const pastHero = document.querySelector('.hero').getBoundingClientRect().bottom < 0;
    dock.hidden = !pastHero || visible.size > 0;
  };
  const io = new IntersectionObserver(entries => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
    update();
  });
  anchors.forEach(a => io.observe(a));
  addEventListener('scroll', update, { passive: true });
}
