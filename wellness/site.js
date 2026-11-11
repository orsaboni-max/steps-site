const dialog = document.querySelector('#choice');
const audio = document.querySelector('#mix');
const audioButtons = [...document.querySelectorAll('.audio-button')];
const audioStatus = document.querySelector('#audio-status');
const reel = document.querySelector('.social-reel video');
const mobileDock = document.querySelector('[data-mobile-dock]');
let selectedButton;

document.querySelectorAll('[data-slot]').forEach(button => {
  button.addEventListener('click', () => {
    selectedButton = button;
    const { slot, title, detail, group } = button.dataset;
    const time = document.createElement('time');
    time.dir = 'ltr';
    time.dateTime = slot;
    time.textContent = slot;
    const heading = dialog.querySelector('#choice-title');
    heading.replaceChildren(title + ' · ', time);
    dialog.querySelector('#choice-detail').textContent = group === 'studio' ? 'עם ' + detail : detail;
    dialog.querySelectorAll('[data-booking]').forEach(section => {
      section.hidden = section.dataset.booking !== group;
    });
    dialog.showModal();
    heading.focus();
  });
});

dialog.querySelectorAll('[data-close]').forEach(button => {
  button.addEventListener('click', () => dialog.close());
});
dialog.addEventListener('close', () => selectedButton?.focus());

function showAudioState(playing) {
  for (const button of audioButtons) {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'עצירת מוזיקה' : 'הפעלת מוזיקה');
    button.querySelector('[data-audio-label]').textContent = playing ? 'לעצור מוזיקה' : 'לנגן מוזיקה';
  }
}

audio.volume = 0.5;
let waitingForGesture = audio.autoplay;

function stopWaitingForGesture() {
  waitingForGesture = false;
  document.removeEventListener('click', startOnFirstClick);
}

async function startMusic() {
  audioStatus.textContent = '';
  try {
    await audio.play();
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') return;
    showAudioState(false);
    audioStatus.textContent = 'המוזיקה לא נטענה. אפשר לנסות שוב.';
  }
}

function startOnFirstClick(event) {
  if (!waitingForGesture || !event.isTrusted || event.target.closest('.audio-button, .social-reel')) return;
  stopWaitingForGesture();
  void startMusic();
}

audio.addEventListener('play', () => {
  stopWaitingForGesture();
  showAudioState(true);
});
audio.addEventListener('pause', () => showAudioState(false));
reel.addEventListener('play', () => {
  stopWaitingForGesture();
  audio.pause();
});
for (const button of audioButtons) {
  button.addEventListener('click', () => {
    stopWaitingForGesture();
    if (!audio.paused) {
      audio.pause();
      return;
    }
    reel.pause();
    void startMusic();
  });
}
if (waitingForGesture) {
  document.addEventListener('click', startOnFirstClick);
  void startMusic();
}

if (mobileDock) {
  const heroActions = document.querySelector('.hero-actions');
  const bottomCta = document.querySelector('.bottom-cta');
  const observer = new IntersectionObserver(() => {
    mobileDock.hidden = heroActions.getBoundingClientRect().bottom > 0 ||
      bottomCta.getBoundingClientRect().top < window.innerHeight;
  });
  observer.observe(heroActions);
  observer.observe(bottomCta);
}
