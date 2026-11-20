/**
 * ============================================================================
 * PROJECTS.JS — LAZY PROJECT RENDERING, SHIMMER THUMBNAILS & CATEGORY FILTER
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * ============================================================================
 */

let cachedProjects = [];
let loadPromise = null;

/**
 * Fetches and caches project metadata lazily without blocking initial page paint.
 * @returns {Promise<Array>}
 */
function ensureProjectsLoaded() {
  if (cachedProjects.length > 0) {
    return Promise.resolve(cachedProjects);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = fetch('assets/data/projects.json')
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load projects');
      return response.json();
    })
    .then((data) => {
      cachedProjects = data.projects || [];
      return cachedProjects;
    })
    .catch((error) => {
      console.warn('Notice: Using pre-rendered fallback project cards.', error);
      return [];
    });

  return loadPromise;
}

/**
 * Progressive lazy-load shimmer state for project thumbnail images.
 * Uses native loading="lazy" + decoding="async" + smooth shimmer fade-in.
 * @param {HTMLElement} root
 */
function wireLazyThumbnails(root) {
  const imgs = root.querySelectorAll('.project-card-image');
  imgs.forEach((img) => {
    const wrap = img.closest('.project-card-image-wrap');
    if (!wrap) return;

    if (img.complete && img.naturalWidth > 0) {
      wrap.classList.remove('is-thumb-loading');
      img.classList.remove('is-thumb-pending');
      img.classList.add('is-thumb-loaded');
      return;
    }

    wrap.classList.add('is-thumb-loading');
    img.classList.add('is-thumb-pending');

    const markLoaded = () => {
      wrap.classList.remove('is-thumb-loading');
      img.classList.remove('is-thumb-pending');
      img.classList.add('is-thumb-loaded');
    };

    img.addEventListener('load', markLoaded, { once: true });
    img.addEventListener('error', markLoaded, { once: true });
  });
}

/**
 * Initializes project thumbnails and defers JSON fetch until section approaches viewport or idle.
 */
export function initProjects() {
  const container = document.getElementById('projects-container');
  const filterBtns = document.querySelectorAll('.project-filter-btn');

  if (!container) return;

  // Wire progressive shimmer on pre-rendered static cards right away (zero layout wipe)
  wireLazyThumbnails(container);
  setupFilters(filterBtns, container);

  // Lazy prefetch projects.json when user scrolls near Projects section or during browser idle
  const projectsSection = document.getElementById('projects') || container;
  if ('IntersectionObserver' in window) {
    const prefetchObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          ensureProjectsLoaded();
          observer.disconnect();
        }
      },
      { rootMargin: '450px 0px' }
    );
    prefetchObserver.observe(projectsSection);
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => ensureProjectsLoaded(), { timeout: 1500 });
  } else {
    setTimeout(() => ensureProjectsLoaded(), 600);
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
        <img src="${p.image}" alt="${p.title} preview illustration" loading="lazy" decoding="async" fetchpriority="low" class="project-card-image" width="600" height="340">
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

  wireLazyThumbnails(container);
}

/**
 * Binds category filtering click events (lazily loading projects.json on demand).
 * @param {NodeList} buttons
 * @param {HTMLElement} container
 */
function setupFilters(buttons, container) {
  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = (btn.getAttribute('data-filter') || 'all').toLowerCase();
      const projects = await ensureProjectsLoaded();

      if (projects.length > 0) {
        if (filter === 'all') {
          renderProjects(projects, container);
        } else {
          const filtered = projects.filter((p) => {
            const categoryMatch = p.category.toLowerCase().includes(filter);
            const tagMatch = p.tags.some((t) => t.toLowerCase().includes(filter));
            return categoryMatch || tagMatch;
          });
          renderProjects(filtered, container);
        }
        return;
      }

      // Offline / static card fallback filter if fetch is unavailable
      const cards = container.querySelectorAll('.project-card');
      cards.forEach((card) => {
        const category = (card.getAttribute('data-category') || '').toLowerCase();
        const show = filter === 'all' || category.includes(filter);
        card.style.display = show ? '' : 'none';
      });
    });
  });
}
