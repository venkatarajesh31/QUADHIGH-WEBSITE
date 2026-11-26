(() => {
  const hero = document.querySelector('.hero');
  const video = document.querySelector('#hero-video');
  if (!hero || !video) return;

  hero.dataset.motion = 'globe';
  video.muted = true;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = true;
  let failed = false;

  function updatePlayback() {
    const wantsMotion = !reducedMotion.matches && !navigator.connection?.saveData;
    if (!wantsMotion || !inView || document.hidden || failed) {
      video.pause();
      return;
    }
    if (!video.getAttribute('src')) video.src = 'assets/hero-globe-clean-sharp.mp4';
    // Leave the poster visible when the browser prevents autoplay.
    video.play().catch(() => {});
  }

  video.addEventListener('error', () => {
    failed = true;
    video.removeAttribute('src');
    video.load();
  });
  reducedMotion.addEventListener('change', updatePlayback);
  document.addEventListener('visibilitychange', updatePlayback);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      updatePlayback();
    }, { threshold: 0 }).observe(hero);
  }
  updatePlayback();
})();
