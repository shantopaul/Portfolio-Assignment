/**
 * ============================================================================
 * PROJECTS.JS — DYNAMIC PROJECT RENDERING & CATEGORY FILTERING
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
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
    console.error('Error initializing projects:', error);
    container.innerHTML = `
      <div class="projects-fallback">
        <p>Featured projects are loading. Please check back shortly.</p>
      </div>
    `;
  }
}

/**
 * Renders an array of project cards to the container.
 * @param {Array} projects
 * @param {HTMLElement} container
 */
function renderProjects(projects, container) {
  if (projects.length === 0) {
    container.innerHTML = `<p class="no-projects">No projects found in this category.</p>`;
    return;
  }

  container.innerHTML = projects
    .map(
      (p) => `
    <article class="bento-card project-card reveal-on-scroll" data-category="${p.category}">
      <div class="project-card-image-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy" class="project-card-image" width="600" height="340">
        ${p.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
      </div>
      <div class="project-card-body">
        <span class="badge badge-category">${p.category}</span>
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
                <i class="fa-brands fa-github"></i> Code
               </a>`
            : ''
        }
        ${
          p.demo_url && !p.demo_url.includes('[PLACEHOLDER')
            ? `<a href="${p.demo_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" aria-label="View live demo for ${p.title}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo
               </a>`
            : ''
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
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';
      if (filter === 'all') {
        renderProjects(cachedProjects, container);
      } else {
        const filtered = cachedProjects.filter((p) => p.category.toLowerCase().includes(filter.toLowerCase()));
        renderProjects(filtered, container);
      }
    });
  });
}
