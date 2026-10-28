export const API_ENDPOINT = 'https://api.schoolnaam.nl/repos';

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function safeHomepage(value) {
  if (typeof value !== 'string') return null;
  const input = value.trim();
  if (!input || input.startsWith('//') || /[\u0000-\u0020\u007f\\]/.test(input)) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function normalizeProjects(value) {
  if (!Array.isArray(value) || value.length > 500) throw new Error('Invalid project list');
  // A malformed response is a service error, never an authoritative empty list.
  if (value.some(repo => !repo || typeof repo.private !== 'boolean' || typeof repo.name !== 'string' || !/^[a-z\d_.-]{1,100}$/i.test(repo.name))) {
    throw new Error('Invalid project metadata');
  }
  const unique = new Map();
  for (const repo of value) {
    if (repo.private || repo.name.startsWith('.')) continue;
    const languages = [...new Set((Array.isArray(repo.languages) ? repo.languages : [repo.language])
      .filter(language => typeof language === 'string' && language.trim()).map(language => language.trim().slice(0, 40)))].slice(0, 8);
    unique.set(repo.name.toLowerCase(), {
      name: repo.name,
      private: false,
      description: typeof repo.description === 'string' ? repo.description.slice(0, 1500) : '',
      homepage: safeHomepage(repo.homepage),
      html_url: `https://github.com/RatelSlop/${encodeURIComponent(repo.name)}`,
      languages,
      archived: repo.archived === true,
    });
  }
  return [...unique.values()];
}

export function selectProjects(projects, { query = '', filter = 'all', sort = 'recent' } = {}) {
  const needle = query.trim().toLocaleLowerCase('nl');
  const result = projects.filter(repo => (filter !== 'web' || repo.homepage) && (filter !== 'source' || !repo.homepage)
    && `${repo.name} ${repo.description} ${repo.languages.join(' ')}`.toLocaleLowerCase('nl').includes(needle));
  return sort === 'name' ? result.sort((a, b) => a.name.localeCompare(b.name, 'nl', { sensitivity: 'base' })) : result;
}

export function projectCard(repo, index) {
  const name = escapeHtml(repo.name);
  const homepage = safeHomepage(repo.homepage);
  const source = `https://github.com/RatelSlop/${encodeURIComponent(repo.name)}`;
  const description = repo.description || 'Een project van RatelSlop. Meer informatie vind je in de repository.';
  return `<article class="project-card">
    <div class="card-top"><span class="project-glyph glyph-${index % 4}" aria-hidden="true">${['↗', '{ }', '✳', '⌘'][index % 4]}</span><span class="project-kind">${repo.archived ? 'Gearchiveerd' : homepage ? 'Webproject' : 'Repository'}</span></div>
    <h3><a href="${source}" target="_blank" rel="noopener noreferrer">${name}<span class="title-arrow" aria-hidden="true">↗</span></a></h3>
    <p class="project-description">${escapeHtml(description)}</p>
    <div class="languages">${repo.languages.slice(0, 3).map(language => `<span><i aria-hidden="true"></i>${escapeHtml(language)}</span>`).join('') || '<span>Hobbyproject</span>'}</div>
    <div class="card-bottom">${homepage
      ? `<a class="visit-link" href="${escapeHtml(homepage)}" target="_blank" rel="noopener noreferrer" aria-label="Open website van ${name}">Open website <span aria-hidden="true">↗</span></a><a class="source-link" href="${source}" target="_blank" rel="noopener noreferrer" aria-label="Broncode van ${name}">Broncode</a>`
      : `<a class="visit-link" href="${source}" target="_blank" rel="noopener noreferrer" aria-label="Bekijk broncode van ${name}">Bekijk broncode <span aria-hidden="true">↗</span></a>`}</div>
  </article>`;
}
