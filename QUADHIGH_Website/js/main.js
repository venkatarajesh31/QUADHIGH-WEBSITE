const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const mobile = window.matchMedia('(max-width: 700px)');

function updateMenu(open = false) {
  menu.hidden = !mobile.matches;
  nav.hidden = mobile.matches && !open;
  menu.setAttribute('aria-expanded', String(mobile.matches && open));
}

menu.addEventListener('click', () => updateMenu(nav.hidden));
mobile.addEventListener('change', () => updateMenu());
nav.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || !mobile.matches) return;
  updateMenu();
  const target = document.querySelector(link.hash);
  target?.setAttribute('tabindex', '-1');
  target?.focus({ preventScroll: true });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !mobile.matches || nav.hidden) return;
  updateMenu();
  menu.focus();
});
updateMenu();

document.querySelector("#contactForm")?.addEventListener("submit", event => event.preventDefault());
