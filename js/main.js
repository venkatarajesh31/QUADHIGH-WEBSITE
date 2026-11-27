const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const header = document.querySelector('.site-header');
const mobile = window.matchMedia('(max-width: 900px)');

function updateMenu(open = false) {
  menu.hidden = !mobile.matches;
  nav.hidden = mobile.matches && !open;
  menu.setAttribute('aria-expanded', String(mobile.matches && open));
}
menu.addEventListener('click', () => updateMenu(nav.hidden));
mobile.addEventListener('change', () => updateMenu());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobile.matches && !nav.hidden) {
    updateMenu();
    menu.focus();
  }
});
updateMenu();

// Keep anchor destinations clear of the sticky header, including the mobile menu.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateHeaderOffset() {
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
}
if ('ResizeObserver' in window) new ResizeObserver(updateHeaderOffset).observe(header);
updateHeaderOffset();

function findAnchorTarget(hash) {
  if (!hash || hash === '#') return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}
function scrollToSection(target, { focus = true, animate = true } = {}) {
  // Wait for the mobile menu to close before calculating the sticky-header offset.
  requestAnimationFrame(() => {
    cancelSectionSettle();
    updateHeaderOffset();
    const gap = target.matches('main > [data-nav-group]') ? 0 : 20;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - header.offsetHeight - gap);
    if (focus) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    window.scrollTo({ top, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant' });
  });
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    // Preserve normal browser behaviour for opening a link in another tab.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = findAnchorTarget(link.hash);
    if (!target) return;
    event.preventDefault();
    if (mobile.matches) updateMenu();
    if (link.dataset.service) document.getElementById('service').value = link.dataset.service;
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
    scrollToSection(target, { animate: !link.classList.contains('skip') });
  });
});
function restoreAnchor() {
  const target = findAnchorTarget(window.location.hash);
  if (target) scrollToSection(target, { focus: false, animate: false });
}
window.addEventListener('hashchange', restoreAnchor);
// The browser also supports direct links to nested sections such as #industries.
if (document.readyState === 'complete') restoreAnchor();
else window.addEventListener('load', restoreAnchor, { once: true });

const navLinks = [...nav.querySelectorAll('a')];
const sectionGroups = [...document.querySelectorAll('main > [data-nav-group]')];
// Let the browser handle input and momentum, then settle near a section start.
let settleTimer;
let settleFrame;
let gestureStart;
let lastScrollPosition = window.scrollY;
let scrollDirection = 0;
let touchActive = false;

function cancelSectionSettle() {
  clearTimeout(settleTimer);
  cancelAnimationFrame(settleFrame);
  settleFrame = undefined;
  gestureStart = undefined;
  scrollDirection = 0;
}

function settleSection() {
  const start = gestureStart;
  const direction = scrollDirection;
  cancelSectionSettle();
  if (!direction || reducedMotion.matches || (mobile.matches && !nav.hidden)) return;

  const position = window.scrollY;
  const reach = Math.min(104, Math.max(72, window.innerHeight * 0.12));
  const overshoot = Math.min(reach, 72);
  const headerHeight = header.offsetHeight;
  const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let closest;

  for (const section of sectionGroups) {
    const top = Math.max(0, Math.round(position + section.getBoundingClientRect().top - headerHeight));
    const distance = top - position;
    if (top > maxScroll || Math.abs(distance) > reach) continue;
    // A wheel step can cross the boundary. Never pull back a gesture that starts at it.
    const crossedBoundary = (top - start) * direction > 24;
    if (distance * direction < 0 && (!crossedBoundary || Math.abs(distance) > overshoot)) continue;
    if (!closest || Math.abs(distance) < Math.abs(closest.distance)) closest = { top, distance };
  }

  if (closest && Math.abs(closest.distance) >= 2) {
    easeToSection(position, closest.top);
  }
}

function easeToSection(from, to) {
  let startTime;

  function frame(time) {
    startTime ??= time;
    const progress = Math.min(1, (time - startTime) / 240);
    const eased = 1 - (1 - progress) ** 3;
    window.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
    settleFrame = progress < 1 ? requestAnimationFrame(frame) : undefined;
  }

  settleFrame = requestAnimationFrame(frame);
}

function queueSectionSettle() {
  clearTimeout(settleTimer);
  if (!touchActive) settleTimer = setTimeout(settleSection, 150);
}

function trackSectionGesture(event) {
  if (settleFrame !== undefined) cancelSectionSettle();

  if (reducedMotion.matches || (mobile.matches && !nav.hidden) ||
      (event.target instanceof Element && event.target.closest('input, select, textarea, [contenteditable]'))) {
    cancelSectionSettle();
    return;
  }

  if (gestureStart === undefined) {
    gestureStart = lastScrollPosition;
  }
  queueSectionSettle();
}

window.addEventListener('wheel', event => {
  if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    cancelSectionSettle();
    return;
  }
  trackSectionGesture(event);
}, { passive: true });
window.addEventListener('touchstart', event => {
  cancelSectionSettle();
  touchActive = event.touches.length === 1;
}, { passive: true });
window.addEventListener('touchmove', event => {
  if (touchActive && event.touches.length === 1) trackSectionGesture(event);
  else cancelSectionSettle();
}, { passive: true });
function finishSectionTouch() {
  touchActive = false;
  if (gestureStart !== undefined) queueSectionSettle();
}
window.addEventListener('touchend', finishSectionTouch, { passive: true });
window.addEventListener('touchcancel', finishSectionTouch, { passive: true });
window.addEventListener('pointerdown', cancelSectionSettle, { passive: true });
window.addEventListener('keydown', cancelSectionSettle);
window.addEventListener('resize', cancelSectionSettle);
reducedMotion.addEventListener('change', cancelSectionSettle);


let scrollQueued = false;
function updateActiveSection() {
  const offset = header.offsetHeight + 80;
  const current = sectionGroups.filter(group => group.getBoundingClientRect().top <= offset).at(-1) || sectionGroups[0];
  const sectionId = current?.dataset.navGroup;
  navLinks.forEach(link => {
    if (link.hash === `#${sectionId}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  const position = window.scrollY;
  const delta = position - lastScrollPosition;
  lastScrollPosition = position;
  if (gestureStart !== undefined && delta) {
    scrollDirection = Math.sign(delta);
    queueSectionSettle();
  }

  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateActiveSection);
  }
}, { passive: true });
window.addEventListener('resize', updateActiveSection);
window.addEventListener('load', updateActiveSection, { once: true });
updateActiveSection();

document.getElementById('contactForm').addEventListener('submit', event => event.preventDefault());
