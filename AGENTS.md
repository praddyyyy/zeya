## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Project notes

- Products live in `src/content/products/<slug>/index.md` (schema in `src/content.config.ts`); see README for the format.
- Brand/contact config: `src/config/site.ts`. Categories: `src/config/catalog.ts`.
- The site uses Astro's `ClientRouter`. Scripts run once, so per-page setup goes in an `astro:page-load` listener (see `src/scripts/main.ts`) and interactions use document-level event delegation. Forms handled in JS need `data-astro-reload` or the router will treat the submit as a navigation.

## Documentation

Full documentation: https://docs.astro.build
