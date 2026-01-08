Here’s a practical way to document every helper under lib, keeping things organized and scalable:

**1. Inventory & Grouping**  
- Run a quick listing (`tree app/scripts/lib`) and categorize files by domains we already split during RefactorLib (e.g., `runtime`, `dom`, `forms`, `number`, `postmessage`, `shared`, `event`, `format`, `head`, `detect`).  
- Within each category, list exported symbols (default + named) so you know what needs coverage.

**2. Docs Structure**  
- Under `docs/lib/` create one markdown per domain to keep pages short:  
  - `docs/lib/shared.md` – `withBrowser()`, `ensureBrowser()`, `toElements()`, etc.  
  - `docs/lib/detect.md` – capability API.  
  - `docs/lib/event.md` – emitter and usage patterns.  
  - `docs/lib/postmessage.md`, `docs/lib/format.md`, `docs/lib/dom.md`, `docs/lib/forms.md`, etc.  
- Add an overview index (`docs/lib/README.md`) linking out to each page; update _sidebar.md so folks find it.

**3. Per-Function Template**  
For consistency, each entry should include:  
- **Signature** (parameters, return type).  
- **Purpose** in 1–2 sentences.  
- **Usage Example** – short code snippet with imports.  
- **Notes** – SSR caveats, teardown responsibilities, optional dependencies.  
- **Related Helpers** – links to other functions or sections.

Example block:

````markdown
### `withBrowser(callback, fallback?)`
- **Use when** you need `window` access without breaking SSR.
- **Returns** whatever `callback(win)` returns, or the fallback when no browser is present.
```js
import { withBrowser } from '../../app/scripts/lib/shared';

const width = withBrowser(({ window }) => window.innerWidth, () => 1024);
```
- **Notes**: Never call DOM APIs outside `callback`; keep fallback side-effect free.
````

**4. Implementation Flow**  
1. **Gather exports**: use `grep '^export'` or import files into a scratch doc.  
2. **Draft content**: start with highest-use modules (`shared`, `event`, `postmessage`), then fill in utility buckets.  
3. **Review** with lint mindset: ensure examples use current APIs (no legacy adapters).  
4. **Add navigation**: update _sidebar.md and, if helpful, cross-link from guide.md.

**5. Quality Checks**  
- Run `npm run lint`/`test:run` only if you touch code; otherwise ensure markdown preview renders.  
- Ask a teammate to review one page to see if the template is clear for junior devs.

Follow this plan and you’ll end up with a discoverable, consistent lib reference that stays aligned with the RefactorLib guardrails.