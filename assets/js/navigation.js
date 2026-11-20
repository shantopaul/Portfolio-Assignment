/**
 * ============================================================================
 * NAVIGATION.JS — STICKY NAVBAR, MOBILE DRAWER & ACTIVE SECTION TRACKER
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * ============================================================================
 */

export function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const navDrawerClose = document.querySelector('.nav-drawer-close');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  const setDrawerState = (open) => {
    if (!navMenu) return;
    navMenu.classList.toggle('active', open);
    navBackdrop?.classList.toggle('active', open);
    navToggle?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';

    const icon = navToggle?.querySelector('i');
    if (icon) {
      icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
  };

  // Mobile & Tablet Drawer Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('active');
      setDrawerState(!isOpen);
    });

    navBackdrop?.addEventListener('click', () => setDrawerState(false));
    navDrawerClose?.addEventListener('click', () => setDrawerState(false));

    document.querySelectorAll('[data-drawer-close]').forEach((el) => {
      el.addEventListener('click', () => setDrawerState(false));
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        setDrawerState(false);
        navToggle.focus();
      }
    });

    // Ensure body scroll lock resets if resized up to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && navMenu.classList.contains('active')) {
        setDrawerState(false);
      }
    });
  }

  // Universal smooth scroll handler with exact navbar offset calculation
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (navMenu && navMenu.classList.contains('active')) {
        setDrawerState(false);
      }

      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 70;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // Active Section IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              if (link.getAttribute('href') === `#${currentId}`) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }
}
