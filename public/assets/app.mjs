import { API_ENDPOINT, normalizeProjects, selectProjects, projectCard } from './projects.mjs';

const list = document.querySelector('#project-list');
const status = document.querySelector('#sync-status');
const retry = document.querySelector('#retry');
const search = document.querySelector('#project-search');
const sort = document.querySelector('#project-sort');
const empty = document.querySelector('#empty-state');
const count = document.querySelector('#project-count');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
let projects = normalizeProjects(JSON.parse(document.querySelector('#repo-snapshot').textContent));
let filter = 'all';

function render() {
  const visible = selectProjects(projects, { query: search.value, filter, sort: sort.value });
  list.innerHTML = visible.map(projectCard).join('');
  empty.hidden = visible.length !== 0;
  count.textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projecten'}`;
  if (projects.length === 0) {
    document.querySelector('#empty-title').textContent = 'Er wordt aan iets nieuws gewerkt.';
    document.querySelector('#empty-description').textContent = 'Zodra er openbare projecten zijn, verschijnen ze hier automatisch.';
    document.querySelector('#reset-filters').hidden = true;
  } else {
    document.querySelector('#empty-title').textContent = 'Even verder zoeken?';
    document.querySelector('#empty-description').textContent = 'Er passen geen projecten bij je zoekopdracht of filter.';
    document.querySelector('#reset-filters').hidden = false;
  }
}

search.addEventListener('input', render);
sort.addEventListener('change', render);
filterButtons.forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  render();
}));
document.querySelector('#reset-filters').addEventListener('click', () => {
  search.value = '';
  filter = 'all';
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
  render();
  search.focus();
});
document.querySelector('#project-controls').hidden = false;
document.querySelector('#static-note').hidden = true;
render();

async function refreshProjects() {
  retry.hidden = true;
  retry.disabled = true;
  status.dataset.state = 'loading';
  status.textContent = 'Projecten bijwerken…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(API_ENDPOINT, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error' });
    if (!response.ok) throw new Error('Projects unavailable');
    projects = normalizeProjects(await response.json());
    render();
    status.textContent = 'Overzicht bijgewerkt';
    status.dataset.state = 'live';
    status.title = `Opgehaald om ${new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit' }).format(new Date())}. De projectgegevens worden kort gecachet.`;
  } catch {
    status.textContent = 'Reserveoverzicht · mogelijk verouderd';
    status.dataset.state = 'offline';
    status.title = 'De API is nu niet bereikbaar. Je ziet het openbare overzicht dat bij deze websiteversie is meegeleverd.';
    retry.hidden = false;
  } finally {
    clearTimeout(timeout);
    retry.disabled = false;
  }
}
retry.addEventListener('click', refreshProjects);
refreshProjects();
