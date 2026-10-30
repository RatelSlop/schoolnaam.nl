import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { skeletonCards } from '../public/assets/projects.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const githubIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1a11 11 0 0 0-3.48 21.44c.55.1.75-.24.75-.53v-2.05c-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.22-1.6-1.22-1.6-1-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.2.92.1-.71.38-1.2.7-1.48-2.44-.28-5.02-1.22-5.02-5.44 0-1.2.43-2.18 1.13-2.95-.12-.28-.49-1.4.1-2.91 0 0 .92-.3 3.02 1.12a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.12 3.02-1.12.6 1.51.22 2.63.1 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.15-5.04 5.42.4.34.75 1.01.75 2.04v3.03c0 .29.2.63.76.53A11 11 0 0 0 12 1Z"/></svg>';
const brand = '<span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>schoolnaam<span class="brand-dot">.nl</span></span>';
const header = `<a class="skip-link" href="#main">Direct naar inhoud</a><header class="site-header wrap"><a class="brand" href="/" aria-label="schoolnaam.nl — home">${brand}</a><div class="header-right"><nav class="nav-links" aria-label="Hoofdnavigatie"><a href="/#ratelslop">Projecten</a><a href="/#over">Over</a><a class="nav-github" href="https://github.com/RatelSlop/schoolnaam.nl" target="_blank" rel="noopener noreferrer">GitHub ↗</a></nav><button type="button" id="theme-toggle" class="theme-button" aria-label="Wissel kleurthema" title="Wissel kleurthema"><span aria-hidden="true">◐</span></button></div></header>`;
const footer = `<footer class="site-footer wrap"><div class="footer-main"><div><a class="brand footer-brand" href="/">${brand}</a><p>Een eigen plek. Voor eigen ideeën.</p></div><nav class="footer-links" aria-label="Voetnavigatie"><a href="/privacy/">Privacy</a><a href="/terms/">Voorwaarden</a><a href="mailto:support@ratelslop.studio">Contact ↗</a><a href="https://github.com/RatelSlop/schoolnaam.nl" target="_blank" rel="noopener noreferrer">Broncode ↗</a></nav></div><p class="footer-note">© 2026 schoolnaam.nl · Een onafhankelijk hobbyproject. Je gekozen kleurthema wordt alleen op dit apparaat bewaard.</p></footer>`;

await mkdir(out, { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
const template = await readFile(path.join(root, 'src/index.html'), 'utf8');
const replacements = { header, footer, 'github-icon': githubIcon, count: 'Laden…', skeletons: skeletonCards(6) };
await writeFile(path.join(out, 'index.html'), template.replace(/\{\{([\w-]+)\}\}/g, (_, name) => replacements[name]));
for (const [slug, title] of [['privacy', 'Privacy'], ['terms', 'Voorwaarden']]) {
  const content = await readFile(path.join(root, `src/${slug}.html`), 'utf8');
  await mkdir(path.join(out, slug), { recursive: true });
  await writeFile(path.join(out, slug, 'index.html'), `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — schoolnaam.nl</title><meta name="description" content="${title} voor schoolnaam.nl en het automatische projectoverzicht."><link rel="canonical" href="https://schoolnaam.nl/${slug}/"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><script src="/assets/theme.js"></script><link rel="stylesheet" href="/assets/style.css"></head><body>${header}<main id="main" class="legal wrap">${content}</main>${footer}</body></html>`);
}
await writeFile(path.join(out, '404.html'), `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pagina niet gevonden — schoolnaam.nl</title><meta name="robots" content="noindex"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><script src="/assets/theme.js"></script><link rel="stylesheet" href="/assets/style.css"></head><body>${header}<main id="main" class="not-found wrap"><p class="eyebrow">404 / Verkeerd afgeslagen</p><h1>Hier is nog<br>niks gebouwd.</h1><p>Deze pagina bestaat niet of is verplaatst.</p><a class="button" href="/">Terug naar schoolnaam.nl <span aria-hidden="true">↗</span></a></main>${footer}</body></html>`);
console.log('Built schoolnaam.nl with loading skeleton, privacy, terms and 404.');
