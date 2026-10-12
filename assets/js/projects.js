/**
 * ============================================================================
 * PROJECTS.JS — DYNAMIC PROJECT RENDERING & CATEGORY FILTERING ENGINE
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * ============================================================================
 */

let cachedProjects = [];

/**
 * Initializes the projects module by fetching projects data.
 */
export async function initProjects() {
  const container = document.getElementById('projects-container');
  const filterBtns = document.querySelectorAll('.project-filter-btn');

  if (!container) return;

  try {
    const response = await fetch('assets/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects');
    const data = await response.json();
    cachedProjects = data.projects || [];
    renderProjects(cachedProjects, container);
    setupFilters(filterBtns, container);
  } catch (error) {
    console.warn('Notice: Using pre-rendered fallback project cards.', error);
    // In case fetch fails, existing static cards in HTML remain visible
    const existingCards = container.querySelectorAll('.project-card');
    existingCards.forEach((c) => c.classList.add('is-revealed'));
  }
}

/**
 * Renders an array of project cards to the container.
 * @param {Array} projects
 * @param {HTMLElement} container
 */
function renderProjects(projects, container) {
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="no-projects">
        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: var(--space-sm); display: block;"></i>
        <p>No projects found matching this category filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projects
    .map(
      (p) => `
    <article class="bento-card project-card reveal-on-scroll is-revealed" data-category="${p.category}">
      <div class="project-card-image-wrap">
        <img src="${p.image}" alt="${p.title} preview illustration" loading="lazy" class="project-card-image" width="600" height="340">
        ${p.featured ? '<span class="badge badge-featured"><i class="fa-solid fa-star"></i> Featured</span>' : ''}
      </div>
      <div class="project-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--space-xs);">
          <span class="badge badge-category">${p.category}</span>
          ${p.featured ? '<span class="badge badge-verified" style="font-size: 0.75rem;"><i class="fa-solid fa-shield-check"></i> SE 236 Lab</span>' : ''}
        </div>
        <h3 class="project-card-title">${p.title}</h3>
        <p class="project-card-desc">${p.short_description}</p>
        <div class="project-tags">
          ${p.tags.map((tag) => `<span class="badge">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="project-card-footer">
        ${
          p.github_url && !p.github_url.includes('[PLACEHOLDER')
            ? `<a href="${p.github_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" aria-label="View source code on GitHub for ${p.title}">
                <i class="fa-brands fa-github"></i> View Code
               </a>`
            : `<span class="badge" style="font-size: 0.75rem;"><i class="fa-solid fa-code-branch"></i> Academic Repo</span>`
        }
        ${
          p.demo_url && !p.demo_url.includes('[PLACEHOLDER')
            ? `<a href="${p.demo_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" aria-label="View live demo for ${p.title}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo
               </a>`
            : `<span class="badge" style="font-size: 0.75rem; background: var(--bg-tertiary);"><i class="fa-solid fa-flask"></i> Lab In-Progress</span>`
        }
      </div>
    </article>
  `
    )
    .join('');
}

/**
 * Binds category filtering click events.
 * @param {NodeList} buttons
 * @param {HTMLElement} container
 */
function setupFilters(buttons, container) {
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = (btn.getAttribute('data-filter') || 'all').toLowerCase();
      if (filter === 'all') {
        renderProjects(cachedProjects, container);
      } else {
        const filtered = cachedProjects.filter((p) => {
          const categoryMatch = p.category.toLowerCase().includes(filter);
          const tagMatch = p.tags.some((t) => t.toLowerCase().includes(filter));
          return categoryMatch || tagMatch;
        });
        renderProjects(filtered, container);
      }
    });
  });
}
