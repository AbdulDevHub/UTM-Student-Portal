# AGENTS.md

Static, dependency-free site (HTML/CSS/ES modules) deployed by Netlify straight from the repo root.

Verify: npm run check

## Rules
- Content lives in `js/data/links.js` (links) and `js/data/dates.js` (UTM term dates). Never hand-edit the generated regions between `<!-- @name -->` and `<!-- /@name -->` markers in pages; edit `scripts/partials/` or the data files, then run `npm run build`.
- Pure logic goes in `js/lib/` with a test in `scripts/tests/`. No DOM there.
- All URLs are https. Run `npm run links` after adding links.
- All localStorage access goes through `js/store.js` (it handles blocked storage).
- Use absolute paths (`/css/...`) in pages; there is no bundler.
- Keep Lighthouse accessibility and SEO at 100 (CI asserts ≥ 95).
- The service worker is disabled on localhost; add `?sw` to test it.
