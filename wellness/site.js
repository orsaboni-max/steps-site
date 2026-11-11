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

audio.volume = 0.5;
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
