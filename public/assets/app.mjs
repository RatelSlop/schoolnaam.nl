import { API_ENDPOINT, normalizeProjects, selectProjects, projectCard, skeletonCards } from './projects.mjs';

const list = document.querySelector('#project-list');
const status = document.querySelector('#sync-status');
const retry = document.querySelector('#retry');
const search = document.querySelector('#project-search');
const sort = document.querySelector('#project-sort');
const empty = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyDesc = document.querySelector('#empty-description');
const emptyIcon = document.querySelector('#empty-icon');
const resetBtn = document.querySelector('#reset-filters');
const errorState = document.querySelector('#error-state');
const errorRetry = document.querySelector('#error-retry');
const controls = document.querySelector('#project-controls');
const count = document.querySelector('#project-count');
const filterButtons = [...document.querySelectorAll('[data-filter]')];

let projects = null;
let filter = 'all';

function renderFiltered() {
  if (!projects) return;
  const visible = selectProjects(projects, { query: search.value, filter, sort: sort.value });

  if (visible.length === 0) {
    list.hidden = true;
    empty.hidden = false;
    emptyTitle.textContent = 'Even verder zoeken?';
    emptyDesc.textContent = 'Er passen geen projecten bij je zoekopdracht of filter.';
    if (emptyIcon) {
      emptyIcon.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    }
    resetBtn.hidden = false;
    count.textContent = '0 projecten';
  } else {
    list.hidden = false;
    empty.hidden = true;
    list.innerHTML = visible.map(projectCard).join('');
    count.textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projecten'}`;
  }
}

function showEmptyComingSoon() {
  list.hidden = true;
  controls.hidden = true;
  errorState.hidden = true;
  empty.hidden = false;
  emptyTitle.textContent = 'Binnenkort nieuwe projecten';
  emptyDesc.textContent = 'Er staan op dit moment geen openbare projecten online. We werken achter de schermen aan nieuwe tools en ideeën — zodra ze klaar zijn om te delen, verschijnen ze hier vanzelf.';
  if (emptyIcon) {
    emptyIcon.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>';
  }
  resetBtn.hidden = true;
  count.textContent = 'Binnenkort';
}

function showLoading() {
  list.innerHTML = skeletonCards(6);
  list.hidden = false;
  controls.hidden = true;
  empty.hidden = true;
  errorState.hidden = true;
  retry.hidden = true;
  retry.disabled = true;
  count.textContent = 'Laden…';
  status.dataset.state = 'loading';
  status.textContent = 'Projecten ophalen…';
  status.removeAttribute('title');
}

function showError() {
  list.hidden = true;
  controls.hidden = true;
  empty.hidden = true;
  errorState.hidden = false;
  count.textContent = 'Niet bereikbaar';
  status.dataset.state = 'error';
  status.textContent = 'Verbinding mislukt';
  status.title = 'De project-API is nu niet bereikbaar.';
  retry.hidden = false;
  retry.disabled = false;
}

search?.addEventListener('input', renderFiltered);
sort?.addEventListener('change', renderFiltered);
filterButtons.forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderFiltered();
}));
resetBtn?.addEventListener('click', () => {
  search.value = '';
  filter = 'all';
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
  renderFiltered();
  search.focus();
});

async function refreshProjects() {
  showLoading();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(API_ENDPOINT, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error' });
    if (!response.ok) throw new Error('Projects unavailable');
    const data = await response.json();
    projects = normalizeProjects(data);

    if (projects.length === 0) {
      showEmptyComingSoon();
    } else {
      errorState.hidden = true;
      controls.hidden = false;
      renderFiltered();
    }
    status.textContent = 'Overzicht bijgewerkt';
    status.dataset.state = 'live';
    status.title = `Opgehaald om ${new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit' }).format(new Date())}. De projectgegevens worden kort gecachet.`;
  } catch {
    showError();
  } finally {
    clearTimeout(timeout);
    retry.disabled = false;
  }
}

retry?.addEventListener('click', refreshProjects);
errorRetry?.addEventListener('click', refreshProjects);

refreshProjects();
