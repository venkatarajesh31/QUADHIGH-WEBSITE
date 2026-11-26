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
  document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight + 20}px`);
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

const form = document.getElementById('contactForm');
const copyButton = document.getElementById('copyEnquiry');
const status = document.getElementById('form-status');
const fallback = document.getElementById('copyFallback');
const enquiryText = document.getElementById('enquiryText');
form.querySelector('button[type="submit"]').disabled = false;
copyButton.disabled = false;

function enquiry() {
  const fields = new FormData(form);
  const service = form.elements.service;
  const serviceName = service.value ? service.selectedOptions[0].text : 'Help defining the scope';
  return {
    subject: `QUADHIGH enquiry: ${serviceName}`,
    body: `Hello QUADHIGH,\n\n${String(fields.get('message')).trim()}\n\nName: ${String(fields.get('name')).trim()}\nEmail: ${String(fields.get('email')).trim()}\nCompany: ${String(fields.get('company')).trim() || 'Not specified'}\nService: ${serviceName}`
  };
}
function showCopyFallback(text) {
  fallback.hidden = false;
  enquiryText.value = text;
  enquiryText.focus();
  enquiryText.select();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const { subject, body } = enquiry();
  const url = `mailto:quadhighpvt@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // Email apps vary in the length of mailto URLs they accept.
  if (url.length > 1800) {
    showCopyFallback(`To: quadhighpvt@gmail.com\nSubject: ${subject}\n\n${body}`);
    status.textContent = 'Your enquiry is ready below. Copy it into an email to quadhighpvt@gmail.com.';
    return;
  }
  window.location.href = url;
  status.textContent = 'Your enquiry is ready for your email app. If no draft opens, use Copy enquiry and email us directly. Nothing has been sent from this page.';
});
copyButton.addEventListener('click', async () => {
  if (!form.reportValidity()) return;
  const { subject, body } = enquiry();
  const text = `To: quadhighpvt@gmail.com\nSubject: ${subject}\n\n${body}`;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    fallback.hidden = true;
    status.textContent = 'Enquiry copied. Paste it into your email app and send it to quadhighpvt@gmail.com.';
  } catch {
    showCopyFallback(text);
    status.textContent = 'Select and copy the enquiry below, then paste it into your email app.';
  }
});
