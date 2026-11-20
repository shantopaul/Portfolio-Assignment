/**
 * ============================================================================
 * THEME.JS — AUTO SYSTEM (PREFERS-COLOR-SCHEME) & MANUAL THEME SWITCHER
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * ============================================================================
 */

const THEME_MODE_KEY = 'sp_portfolio_theme_mode';
const LEGACY_THEME_KEY = 'sp_portfolio_theme';

/**
 * Returns the current OS/browser color scheme preference.
 * @returns {'light'|'dark'}
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Reads the persisted theme mode ('system' | 'light' | 'dark').
 * Defaults to 'system' so the UI follows the user's OS theme automatically.
 * @returns {'system'|'light'|'dark'}
 */
export function getThemeMode() {
  try {
    const saved = localStorage.getItem(THEME_MODE_KEY);
    if (saved === 'system' || saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted browsing contexts
  }
  return 'system';
}

/**
 * Resolves a theme mode ('system' | 'light' | 'dark') to an active theme.
 * @param {'system'|'light'|'dark'} mode
 * @returns {'light'|'dark'}
 */
export function resolveTheme(mode) {
  return mode === 'system' ? getSystemTheme() : mode;
}

/**
 * Initializes automatic OS theme tracking and binds toggle controls.
 */
export function initTheme() {
  // Clean up legacy key so returning visitors automatically follow OS preference
  try {
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    // Ignore storage errors
  }

  const initialMode = getThemeMode();
  applyTheme(initialMode, { persist: false });

  // Bind toggle buttons
  const toggleBtns = document.querySelectorAll('.theme-toggle');
  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  // Live listener for OS/system Dark <-> Light changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (getThemeMode() === 'system') {
        applyTheme('system', { persist: false });
      }
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemChange);
    }
  }
}

/**
 * Applies the selected theme mode to the document root and updates browser meta.
 * Only writes to localStorage when `persist` is true so 'system' stays dynamic.
 * @param {'system'|'light'|'dark'} mode
 * @param {{ persist?: boolean }} [options]
 */
export function applyTheme(mode, { persist = true } = {}) {
  const validMode = mode === 'light' || mode === 'dark' ? mode : 'system';
  const resolved = resolveTheme(validMode);

  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-mode', validMode);
  document.documentElement.style.colorScheme = resolved;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? '#0A0E17' : '#F8FAFC');
  }

  if (persist) {
    try {
      localStorage.setItem(THEME_MODE_KEY, validMode);
    } catch {
      // Ignore storage errors
    }
  }

  updateToggleIcons(validMode, resolved);
}

/**
 * Backwards-compatible helper to explicitly set 'light' or 'dark' or 'system'.
 * @param {'system'|'light'|'dark'} theme
 */
export function setTheme(theme) {
  applyTheme(theme, { persist: true });
}

/**
 * Cycles cleanly through:
 * Auto (System) -> Opposite Theme -> Matching Manual Theme -> Auto (System)
 * Ensures every click from Auto immediately switches visual appearance.
 */
export function toggleTheme() {
  const currentMode = getThemeMode();
  const systemTheme = getSystemTheme();
  let nextMode;

  if (currentMode === 'system') {
    nextMode = systemTheme === 'dark' ? 'light' : 'dark';
  } else if (currentMode !== systemTheme) {
    nextMode = systemTheme;
  } else {
    nextMode = 'system';
  }

  applyTheme(nextMode, { persist: true });
}

/**
 * Updates icons and accessible labels on all theme toggle controls.
 * @param {'system'|'light'|'dark'} mode
 * @param {'light'|'dark'} resolved
 */
function updateToggleIcons(mode, resolved) {
  const toggleBtns = document.querySelectorAll('.theme-toggle');
  const systemTheme = getSystemTheme();

  toggleBtns.forEach((btn) => {
    const icon = btn.querySelector('i');
    if (!icon) return;

    icon.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      if (mode === 'system') {
        icon.className = 'fa-solid fa-circle-half-stroke';
        const nextVisual = systemTheme === 'dark' ? 'Light' : 'Dark';
        const label = `Theme: Auto (System ${resolved === 'dark' ? 'Dark' : 'Light'}). Click to switch to ${nextVisual} Mode`;
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', `Auto (System: ${resolved === 'dark' ? 'Dark' : 'Light'})`);
      } else if (mode === 'light') {
        icon.className = 'fa-solid fa-sun';
        btn.setAttribute('aria-label', 'Theme: Light. Click to switch theme');
        btn.setAttribute('title', 'Light Mode (Click to switch)');
      } else {
        icon.className = 'fa-solid fa-moon';
        btn.setAttribute('aria-label', 'Theme: Dark. Click to switch theme');
        btn.setAttribute('title', 'Dark Mode (Click to switch)');
      }
      icon.style.transform = 'rotate(0deg)';
    }, 100);
  });
}
