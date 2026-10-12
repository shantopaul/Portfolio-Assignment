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
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    const toggleMenu = () => {
      const isOpen = navMenu.classList.toggle('active');
      navBackdrop?.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    };

    navToggle.addEventListener('click', toggleMenu);
    navBackdrop?.addEventListener('click', toggleMenu);

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  }

  // Universal smooth scroll handler with exact navbar offset calculation
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navBackdrop?.classList.remove('active');
        navToggle?.setAttribute('aria-expanded', 'false');
        const icon = navToggle?.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
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

          // Update URL hash cleanly
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
