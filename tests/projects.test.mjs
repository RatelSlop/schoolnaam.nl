import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProjects, selectProjects, projectCard, safeHomepage, skeletonCard, skeletonCards } from '../public/assets/projects.mjs';

const record = (name, more = {}) => ({ name, private: false, languages: ['TypeScript'], ...more });
test('excludes private and meta repos and only trusts canonical source URLs', () => {
  const result = normalizeProjects([record('public', { html_url: 'https://evil.example' }), record('hidden', { private: true }), record('.github'), record('PUBLIC')]);
  assert.equal(result.length, 1);
  assert.equal(result[0].html_url, 'https://github.com/RatelSlop/PUBLIC');
});
test('rejects malformed responses so a service error cannot erase the fallback', () => {
  for (const response of [{ error: 'offline' }, [null], [{ name: 'test' }], [record('../invalid')]]) assert.throws(() => normalizeProjects(response));
  assert.deepEqual(normalizeProjects([]), []);
});
test('rejects unsafe homepages including schemes and embedded credentials', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,x', 'https://user:pass@example.com', 'https://example.com\n.bad', '//example.com', 'https://example.com\\bad']) assert.equal(safeHomepage(value), null);
  assert.equal(safeHomepage('schoolnaam.nl'), 'https://schoolnaam.nl/');
});
test('renders hostile metadata as text and never creates an executable URL', () => {
  const [repo] = normalizeProjects([record('demo', { description: '<img src=x onerror=alert(1)>', languages: ['<svg/onload=alert(1)>'], homepage: 'javascript:alert(1)' })]);
  const html = projectCard(repo, 0);
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<svg/onload'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;img'));
});
test('search, mutually exclusive filters and sorting combine without mutating the source order', () => {
  const projects = normalizeProjects([record('Zulu'), record('Alpha', { homepage: 'https://example.com', description: 'Handige tool' })]);
  assert.deepEqual(selectProjects(projects, { filter: 'web', query: 'tool' }).map(p => p.name), ['Alpha']);
  assert.deepEqual(selectProjects(projects, { filter: 'source' }).map(p => p.name), ['Zulu']);
  assert.deepEqual(selectProjects(projects, { query: 'typescript', sort: 'name' }).map(p => p.name), ['Alpha', 'Zulu']);
  assert.deepEqual(projects.map(p => p.name), ['Zulu', 'Alpha']);
});
test('generates accessible skeleton cards for the loading state', () => {
  const single = skeletonCard();
  assert.ok(single.includes('project-card-skeleton'));
  assert.ok(single.includes('aria-hidden="true"'));
  assert.ok(single.includes('skeleton-block'));
  const multiple = skeletonCards(4);
  assert.equal((multiple.match(/project-card-skeleton/g) || []).length, 4);
});
