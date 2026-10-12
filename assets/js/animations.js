/**
 * ============================================================================
 * ANIMATIONS.JS — SCROLL REVEAL OBSERVERS & TYPEWRITER RUNNER
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * ============================================================================
 */

export function initAnimations() {
  initScrollReveal();
}

/**
 * Initializes IntersectionObserver to reveal elements as they scroll into view.
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if (revealElements.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }
}

/**
 * Runs a typewriter effect on a target element.
 * @param {HTMLElement} element
 * @param {string[]} phrases
 * @param {number} typingSpeed
 * @param {number} pauseDelay
 */
export function runTypewriter(element, phrases, typingSpeed = 80, pauseDelay = 2000) {
  if (!element || phrases.length === 0) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      element.textContent = currentPhrase.substring(0, charIndex);
    } else {
      charIndex++;
      element.textContent = currentPhrase.substring(0, charIndex);
    }

    let delay = isDeleting ? typingSpeed / 2 : typingSpeed;

    if (!isDeleting && charIndex === currentPhrase.length) {
      delay = pauseDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
}
