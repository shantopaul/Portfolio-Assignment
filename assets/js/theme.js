/**
 * ============================================================================
 * THEME.JS — DEDICATED PROFESSIONAL DARK MODE CONTROLLER
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * ============================================================================
 */

const LEGACY_KEYS = ['sp_portfolio_theme', 'sp_portfolio_theme_mode'];

/**
 * Enforces the dedicated Midnight Dark theme and clears any legacy theme keys.
 */
export function initTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.removeAttribute('data-theme-mode');
  document.documentElement.style.colorScheme = 'dark';

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', '#070B14');
  }

  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Ignore storage access errors in restricted browsing contexts
  }
}

/**
 * Compatibility export ensuring callers always remain on dark mode.
 */
export function setTheme() {
  initTheme();
}
