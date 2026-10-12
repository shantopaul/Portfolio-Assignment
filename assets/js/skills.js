/**
 * ============================================================================
 * SKILLS.JS — TECHNICAL SKILLS MATRIX & CATEGORY FILTER ENGINE
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * ============================================================================
 */

export function initSkills() {
  const filterButtons = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-cat-card');

  if (filterButtons.length === 0 || skillCards.length === 0) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.getAttribute('data-category');

      // Update active state on buttons
      filterButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter skill cards with smooth transition
      skillCards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCat === targetCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          card.style.display = 'none';
        }
      });
    });
  });

  // Optional: Enhance with dynamic data from assets/data/skills.json if container is present
  loadSkillsData();
}

/**
 * Loads skills from assets/data/skills.json if dynamic container is provided
 */
async function loadSkillsData() {
  const dynamicContainer = document.getElementById('dynamic-skills-container');
  if (!dynamicContainer) return;

  try {
    const response = await fetch('assets/data/skills.json');
    if (!response.ok) return;
    const data = await response.json();
    if (data && data.categories && data.categories.length > 0) {
      console.log('✅ Skills data verified and loaded from JSON store:', data.categories.length, 'categories');
    }
  } catch (err) {
    console.warn('Notice: Using pre-rendered semantic HTML for skills matrix.', err);
  }
}
