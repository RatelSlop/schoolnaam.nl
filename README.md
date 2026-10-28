# schoolnaam.nl

Een zelfstandige Nederlandstalige homepage voor schoolnaam.nl, met alle openbare RatelSlop-projecten onder één automatisch gevuld kopje **RatelSlop**.

## Lokaal

Node.js 22 of nieuwer. Geen externe npm-afhankelijkheden.

```sh
npm run build
npm run dev
```

Open de gemelde lokale URL. `npm test` controleert het verwerken van onbetrouwbare projectgegevens en de zoek- en filterfuncties.

## Hosting

- GitHub: `RatelSlop/schoolnaam.nl` (alleen broncode).
- Cloudflare Pages: `schoolnaam`.
- Productietak: `main`.
- Build: `npm run build`.
- Uitvoermap: `dist`.
- Domeinen: `schoolnaam.nl` en `www.schoolnaam.nl` (redirect naar hoofddomein).
- GitHub Pages wordt voor deze website niet gebruikt.

De `src/`-templates worden door `scripts/build.mjs` gecombineerd met de gedeelde header, footer en een openbaar reserveoverzicht. Alleen `dist/` wordt gehost; broncode, tests en instellingen worden niet als sitebestanden gepubliceerd.

## Project-API

De browser vraagt uitsluitend `https://api.schoolnaam.nl/repos` op. Dit is een extra Custom Domain van de **bestaande** Worker `ratelslop-repos`, naast `api.ratelslop.studio`. De Worker-code en het bestaande `GITHUB_TOKEN` blijven in die Worker. Deze repository bevat geen token en implementeert geen tweede proxy.

Alle repositoryprojecten verschijnen samen onder RatelSlop. De API bepaalt namen, beschrijvingen, talen, archiefstatus en homepages; er is geen handmatige lijst met uitgelichte projecten. Zoekopdrachten en filters blijven in de browser. Privérepositories en meta-repositories worden uitgesloten, broncode-URL's worden canoniek opgebouwd en homepages worden gevalideerd.

Bij een fout toont de site het meegeleverde openbare overzicht uit `public/assets/repos-snapshot.json`, met een duidelijke melding dat het verouderd kan zijn. De browser probeert niet alsnog de GitHub API of api.ratelslop.studio. Een geldige lege API-lijst toont een echte lege staat. Werk het reservebestand en de datum in `scripts/build.mjs` samen bij wanneer dat nodig is.

Cloudflare-hosting van het overzicht verhuist de afzonderlijke projectwebsites niet. Projectlinks openen de website die in de repositorymetadata is ingesteld; die kan nog op GitHub Pages of een andere aanbieder staan. Bereikbaarheid op een schoolnetwerk moet op dat netwerk worden getest.

## Privacy en vormgeving

Fonts, illustraties, CSS en JavaScript worden lokaal geleverd. Alleen de expliciet gekozen thema-instelling wordt in localStorage opgeslagen. Geen externe analytics, CDN-fonts of automatische GitHub-fallback. De privacy- en voorwaardenpagina beschrijven de Cloudflare-hosting en het repo-endpoint. Fonts behouden hun SIL Open Font License; zie `public/assets/fonts/`.
