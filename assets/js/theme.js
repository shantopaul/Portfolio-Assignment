/**
 * ============================================================================
 * THEME.JS — DARK/LIGHT THEME SWITCHER & STATE PERSISTENCE
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * ============================================================================
 */

const THEME_STORAGE_KEY = 'sp_portfolio_theme';

/**
 * Initializes the theme based on localStorage or OS preferences.
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  setTheme(initialTheme);

  // Bind toggle buttons
  const toggleBtns = document.querySelectorAll('.theme-toggle');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  // Listen to OS-level theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Sets the active theme on the document root and persists to localStorage.
 * @param {'light'|'dark'} theme
 */
export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  updateToggleIcons(theme);
}

/**
 * Toggles between light and dark themes.
 */
export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

/**
 * Updates sun/moon icons on all theme toggle controls.
 * @param {'light'|'dark'} theme
 */
function updateToggleIcons(theme) {
  const toggleBtns = document.querySelectorAll('.theme-toggle');
  toggleBtns.forEach((btn) => {
    const icon = btn.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        btn.setAttribute('aria-label', 'Switch to Light Theme');
      } else {
        icon.className = 'fa-solid fa-moon';
        btn.setAttribute('aria-label', 'Switch to Dark Theme');
      }
    }
  });
}
