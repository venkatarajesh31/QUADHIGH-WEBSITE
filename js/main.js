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
    updateHeaderOffset();
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - header.offsetHeight - 20);
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
  if (!scrollQueued) {
    scrollQueued = true;
    requestAnimationFrame(updateActiveSection);
  }
}, { passive: true });
window.addEventListener('resize', updateActiveSection);
window.addEventListener('load', updateActiveSection, { once: true });
updateActiveSection();

document.getElementById('contactForm').addEventListener('submit', event => event.preventDefault());
