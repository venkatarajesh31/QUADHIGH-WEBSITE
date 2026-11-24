/* ═══════════════════════════════════════════════════════
   RARIONS — Main JavaScript
   Vanilla JS — no dependencies
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const CFG = window.SITE_CONFIG || {};

  /* ── 1. Inject Company Name & Config ─────────────── */
  if (CFG.companyName) {
    document.querySelectorAll('.company-name').forEach(el => { el.textContent = CFG.companyName; });
    document.title = `${CFG.companyName} — ${CFG.tagline || 'Expert NetSuite Implementation Partners'}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && CFG.description) metaDesc.setAttribute('content', CFG.description);
  }
  if (CFG.contact) {
    document.querySelectorAll('.config-email').forEach(el => {
      el.textContent = CFG.contact.email;
      if (el.tagName === 'A') el.href = 'mailto:' + CFG.contact.email;
    });
    document.querySelectorAll('.config-phone').forEach(el => {
      el.textContent = CFG.contact.phone;
      if (el.tagName === 'A') el.href = 'tel:' + CFG.contact.phone.replace(/[^+\d]/g, '');
    });
    document.querySelectorAll('.config-linkedin').forEach(el => {
      if (el.tagName === 'A') el.href = CFG.contact.linkedin;
    });
  }
  if (CFG.copyrightYear) {
    document.querySelectorAll('.config-year').forEach(el => { el.textContent = CFG.copyrightYear; });
  }

  /* ── 2. Navbar Scroll ────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 80);
  };
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (!scrollTick) { requestAnimationFrame(() => { onScroll(); updateActiveNav(); scrollTick = false; }); scrollTick = true; }
  }, { passive: true });
  onScroll();

  /* ── 3. Smooth Scrolling ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar ? navbar.offsetHeight : 0;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      // Close mobile menu
      document.querySelector('.nav-menu')?.classList.remove('nav-menu--mobile-open');
      document.querySelector('.hamburger')?.classList.remove('hamburger--active');
    });
  });

  /* ── 4. Active Nav Link ──────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (!link) return;
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => l.classList.remove('nav-link--active'));
        link.classList.add('nav-link--active');
      }
    });
  }

  /* ── 5. Mobile Menu ──────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('hamburger--active');
      navMenu.classList.toggle('nav-menu--mobile-open');
    });
  }

  /* ── 6. Animated Counters ────────────────────────── */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.counted) return;
      el.dataset.counted = 'true';
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.3 });
  counters.forEach(c => counterObserver.observe(c));

  /* ── 7. Scroll Reveal ────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('.reveal')) : [];
        const idx = siblings.indexOf(entry.target);
        const delay = idx >= 0 ? idx * 80 : 0;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(r => revealObserver.observe(r));

  /* ── 8. Expertise Tabs ───────────────────────────── */
  const tabs = document.querySelectorAll('.expertise-tab');
  const panels = document.querySelectorAll('.expertise-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('expertise-tab--active'));
      panels.forEach(p => p.classList.remove('expertise-panel--active'));
      tab.classList.add('expertise-tab--active');
      const panel = document.querySelector(`.expertise-panel[data-panel="${tab.dataset.tab}"]`);
      if (panel) panel.classList.add('expertise-panel--active');
    });
  });

  /* ── 9. Testimonial Slider ──────────────────────── */
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  let currentSlide = 0;
  let autoSlide;
  function showSlide(idx) {
    currentSlide = ((idx % cards.length) + cards.length) % cards.length;
    cards.forEach(c => c.classList.remove('testimonial-card--active'));
    dots.forEach(d => d.classList.remove('testimonial-dot--active'));
    if (cards[currentSlide]) cards[currentSlide].classList.add('testimonial-card--active');
    if (dots[currentSlide]) dots[currentSlide].classList.add('testimonial-dot--active');
  }
  function startAutoSlide() { autoSlide = setInterval(() => showSlide(currentSlide + 1), 5000); }
  function resetAutoSlide() { clearInterval(autoSlide); startAutoSlide(); }
  document.querySelector('.testimonial-prev')?.addEventListener('click', () => { showSlide(currentSlide - 1); resetAutoSlide(); });
  document.querySelector('.testimonial-next')?.addEventListener('click', () => { showSlide(currentSlide + 1); resetAutoSlide(); });
  dots.forEach(dot => dot.addEventListener('click', () => { showSlide(parseInt(dot.dataset.index, 10)); resetAutoSlide(); }));
  if (cards.length > 0) startAutoSlide();

  /* ── 10. Contact Form ────────────────────────────── */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      if (!name?.value.trim() || !email?.value.trim()) {
        alert('Please fill in the required fields.');
        return;
      }
      if (success) success.classList.add('form-success--visible');
      form.querySelectorAll('input, select, textarea').forEach(f => { f.value = ''; });
      form.querySelector('button[type="submit"]').textContent = 'Sent!';
      setTimeout(() => { form.querySelector('button[type="submit"]').textContent = 'Send Inquiry'; }, 3000);
    });
  }

  /* ── 11. Hero Mouse Parallax ─────────────────────── */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', e => {
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const orbs = heroSection.querySelectorAll('.hero-orb');
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 15;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }
});
