(() => {
  const root = document.getElementById('roomvibe-loading');
  const status = document.getElementById('loading-status');
  const hint = document.getElementById('loading-hint');
  const retry = document.getElementById('loading-retry');
  let done = false;
  let failed = false;
  const slow = setTimeout(() => {
    if (done || failed) return;
    hint.textContent = 'Первый запуск может занять чуть больше времени.';
    hint.hidden = false;
  }, 20000);
  window.roomVibeLoading = {
    status(message) { if (!done && !failed) status.textContent = message; },
    fail(error) {
      if (done || failed) return;
      failed = true;
      clearTimeout(slow);
      if (error) console.error('RoomVibe startup failed', error);
      root.classList.add('failed');
      root.setAttribute('aria-busy', 'false');
      status.textContent = 'Не удалось запустить приложение.';
      hint.textContent = 'Проверьте соединение и попробуйте снова.';
      hint.hidden = false;
      retry.hidden = false;
    },
    finish() {
      if (done) return;
      done = true;
      clearTimeout(slow);
      root.setAttribute('aria-busy', 'false');
      root.classList.add('leaving');
      setTimeout(() => root.remove(), 240);
    },
  };
  retry.addEventListener('click', () => window.location.reload());
  window.addEventListener('flutter-first-frame', () => window.roomVibeLoading.finish(), { once: true });
  window.addEventListener('error', event => {
    if (event.target instanceof HTMLScriptElement) window.roomVibeLoading.fail();
  }, true);
})();
