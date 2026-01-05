# UpdateApp Optimization Plan

- Defer scripts where safe: mark non-critical modules as `defer` and move page-specific init after DOMContentLoaded.
- Cache templates: memoize `loadTmpl` responses to avoid repeat fetches; invalidate on locale/page change.
- Batch DOM writes: collect text/content updates and apply in a single frame via `requestAnimationFrame`.
- Network hygiene: add `AbortController` to cancel stale fetches when navigating between sections; set timeouts.
- Image performance: add `loading="lazy"` to below-the-fold images and prefer `srcset`/`sizes`.
- Pagination perf: debounce pagination clicks; keep `pageCounter` state centralized to prevent redundant renders.
- Error observability: funnel errors to `yell.error` with context; add console debug guard to avoid prod noise.
- CSS footprint: remove dead selectors tied to removed plugins; use `prefers-reduced-motion` friendly transitions.
- Accessibility: ensure overlays trap focus; provide `aria-live` on notifier area; keep buttons disabled only while busy.
- Tracking resilience: no-op if GA/FB not present; never throw on missing trackers; keep `data-*` contract stable.
