# Zeya

Website for Zeya — a clothing manufacturer selling men's shirts, T-shirts and pants, and women's sarees, kurtis and western wear. Customers browse the catalogue, add pieces to a bag and **check out on WhatsApp**: the site opens WhatsApp with the full order (items, sizes, quantities, prices, customer details) ready to send. All sales are then handled in WhatsApp.

Built with [Astro](https://astro.build) (static site) and Tailwind CSS. There is no backend, database or payment integration.

## Getting started

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # production build in ./dist
npm run preview   # serve the production build
npx astro check   # type-check
```

Requires Node 22+.

## Adding or editing products

Every product is a folder inside `src/content/products/`. The folder name becomes the product's web address (`/p/<folder-name>`), so use lowercase words joined by dashes.

```
src/content/products/
  linen-shirt-olive/
    index.md      ← product details
    1.jpg         ← main photo (shown first)
    2.jpg         ← extra photos (2nd photo also appears on hover in the grid)
```

`index.md` looks like this:

```yaml
---
name: "Linen Casual Shirt"
code: "ZM-SH-101"            # your product code — appears in the WhatsApp order
gender: "men"                # men | women
category: "shirts"           # men: shirts, tshirts, pants · women: sarees, kurtis, western
price: 1199
mrp: 1599                    # optional — shows a strike-through price and "Save %"
sizes: ["S", "M", "L", "XL", "XXL"]
colors: ["Olive"]            # list several to let the customer choose
fabric: "100% Linen"         # optional
fit: "Regular fit"           # optional
care: "Machine wash cold"    # optional
highlights: ["Breathable, pre-washed linen", "Curved hem"]   # optional bullet points
images: ["./1.jpg", "./2.jpg"]
inStock: true                # false shows "Sold out"
featured: true               # shows in "Bestsellers" on the home page
newArrival: true             # shows in "New arrivals" and gets a "New" badge
---

A short description of the piece. This paragraph appears on the product page.
```

**Photos:** portrait photos with a 4:5 ratio (e.g. 1200 × 1500 px) look best. JPG, PNG or WebP all work, and the site automatically resizes and compresses them. Keep originals under ~2 MB to keep the repository small.

To add a product without any tools, open the repository on GitHub, go to `src/content/products/`, choose **Add file → Upload files**, and upload the new folder (the `index.md` plus photos). If a required field is missing or misspelt, the build fails and says which product and field to fix, so a broken product can never go live.

> The products currently in the repo are **placeholders** (illustrated garments marked with their product code). Replace them with real photos and details.

## Configuration

| What | Where |
| --- | --- |
| **WhatsApp order number**, email, Instagram, address, hours | `src/config/site.ts` |
| Categories for men / women | `src/config/catalog.ts` |
| Home page hero slideshow (photos, titles, links) | `looks` in `src/components/Hero.astro`; photos in `src/assets/hero/` |
| Colours, fonts, animation timings | `src/styles/global.css` (`@theme`) and `astro.config.mjs` (`fonts`) |
| Site domain (used for SEO + share links) | `site` in `astro.config.mjs` |
| FAQ, policies, size chart | `src/pages/contact.astro` |
| About page story | `src/pages/about.astro` |

While `whatsappNumber` is empty, checkout still works: WhatsApp opens with the order message and asks the customer which chat to send it to. Set it to the country code plus number, digits only (e.g. `919876543210`), to send orders straight to the shop.

## How it works

- **Pages:** home (`/`), shop all (`/shop`), gender (`/women`, `/men`), category (`/women/sarees`, …), product (`/p/<slug>`), about, contact (FAQ, size guide), 404.
- **Bag:** stored in the browser (`localStorage`), so it survives refreshes. Logic lives in `src/scripts/cart.ts`.
- **Checkout:** the bag drawer (`src/components/CartDrawer.astro`, `src/scripts/drawer.ts`) collects name, phone, city/pincode and an optional address and note. These are remembered for next time. The message is built in `src/scripts/whatsapp.ts` and opened via `wa.me`. "Buy on WhatsApp" on a product page checks out that single item without touching the bag.
- **Motion:** headline line reveals, scroll-in fades, image hover swaps, a category ticker, a shrinking header and shared-element page transitions (Astro `ClientRouter` + View Transitions). All of it is disabled when the visitor's device asks for reduced motion.
- **SEO:** per-page titles and descriptions, Open Graph share images (product photos preview in WhatsApp), Product structured data and a sitemap.

## Deploying

The site is fully static: `npm run build` outputs `dist/`, which any static host can serve (GitHub Pages, Cloudflare Pages, Netlify, Vercel). Hosting and the domain are still to be decided. When they are, set `site` in `astro.config.mjs` to the real domain.
