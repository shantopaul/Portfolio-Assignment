/**
 * ============================================================================
 * THEME.JS — AUTO SYSTEM (PREFERS-COLOR-SCHEME) + LIGHT / DARK THEME ENGINE
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
  return 'dark';
}

/**
 * Reads the persisted theme mode ('system' | 'light' | 'dark').
 * Defaults to 'system' so the UI follows the user's OS preference automatically.
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
 * Initializes automatic OS theme tracking and binds desktop/mobile controls.
 */
export function initTheme() {
  try {
    localStorage.removeItem(LEGACY_THEME_KEY);
  } catch {
    // Ignore storage errors
  }

  const initialMode = getThemeMode();
  applyTheme(initialMode, { persist: false });

  // Bind desktop/header cycle buttons
  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  // Bind explicit mode segmented buttons (e.g. inside mobile nav drawer)
  document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-theme-choice');
      if (choice === 'system' || choice === 'light' || choice === 'dark') {
        applyTheme(choice, { persist: true });
      }
    });
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
    metaTheme.setAttribute('content', resolved === 'dark' ? '#070B14' : '#F8FAFC');
  }

  if (persist) {
    try {
      localStorage.setItem(THEME_MODE_KEY, validMode);
    } catch {
      // Ignore storage errors
    }
  }

  updateToggleIcons(validMode, resolved);
  updateThemeChoiceButtons(validMode);
}

/**
 * Explicitly sets 'system', 'light', or 'dark' mode.
 * @param {'system'|'light'|'dark'} theme
 */
export function setTheme(theme) {
  applyTheme(theme, { persist: true });
}

/**
 * Cycles cleanly: Auto (System) -> Opposite Theme -> Matching Manual Theme -> Auto (System).
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
 * Updates icons and accessible labels on navbar theme toggle controls.
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
        btn.setAttribute(
          'aria-label',
          `Theme: Auto (System ${resolved === 'dark' ? 'Dark' : 'Light'}). Click to switch to ${nextVisual} Mode`
        );
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

/**
 * Highlights the active theme option in segmented mobile drawer controls.
 * @param {'system'|'light'|'dark'} activeMode
 */
function updateThemeChoiceButtons(activeMode) {
  document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
    const isMatch = btn.getAttribute('data-theme-choice') === activeMode;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-pressed', String(isMatch));
  });
}
