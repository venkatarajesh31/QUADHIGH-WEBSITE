/*
 * ═══════════════════════════════════════════════════════════════
 *  QUADHIGH — Central Site Configuration
 * ═══════════════════════════════════════════════════════════════
 *  To change the company name, simply update 'companyName' below.
 *  Every reference across the entire website updates automatically.
 *
 *  Contact details, stats, and branding assets are centralized
 *  here for easy updates.
 * ═══════════════════════════════════════════════════════════════
 */

window.SITE_CONFIG = {

  /* ── Branding ─────────────────────────────────────────────── */
  companyName: "QUADHIGH",
  tagline: "AI-Accelerated, Engineer-Validated NetSuite Solutions",
  description:
    "Transform enterprise operations with 14+ years of deep NetSuite expertise, 100+ successful implementations, and AI-accelerated delivery validated by senior ERP architects.",

  /* ── Logos for Different Backgrounds ──────────────────────── */
  logos: {
    darkBg: "assets/logo-dark-bg.png",       // For dark header, hero, footer
    lightBg: "assets/logo-light-bg.png",     // For light backgrounds
    black: "assets/logo-black.png",
    gray: "assets/logo-gray.png"
  },

  /* ── Contact (update when final details are ready) ────────── */
  contact: {
    email: "info@target100.com",
    phone: "+91-123456789",
    linkedin: "https://www.linkedin.com/",
    address: "Hyderabad Metropolitan City, India",
  },

  /* ── Key Stats ────────────────────────────────────────────── */
  stats: {
    projects:     100,
    years:        14,
    engineers:    14,
    satisfaction: 99,
    countries:    9,
    industries:   6,
  },

  /* ── Regions Served ───────────────────────────────────────── */
  regions: [
    "United States", "Canada", "United Kingdom", "Germany",
    "Saudi Arabia", "United Arab Emirates", "China", "Japan", "Australia",
  ],

  /* ── Industries ───────────────────────────────────────────── */
  industries: [
    "Retail", "Trading", "Manufacturing",
    "Advertising", "Food Delivery", "Service",
  ],

  copyrightYear: new Date().getFullYear(),
};
