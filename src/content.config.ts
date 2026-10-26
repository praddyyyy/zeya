import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { catalog, categoryKeys, type Gender } from './config/catalog';

// Each product is a folder in src/content/products/<slug>/ with an index.md and its photos.
// The folder name becomes the product URL: /p/<slug>
const products = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/products' }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        code: z.string(),
        gender: z.enum(['women', 'men'] satisfies Gender[]),
        category: z.enum(categoryKeys),
        price: z.number().positive(),
        mrp: z.number().positive().optional(),
        sizes: z.array(z.string()).min(1),
        colors: z.array(z.string()).default([]),
        fabric: z.string().optional(),
        fit: z.string().optional(),
        care: z.string().optional(),
        highlights: z.array(z.string()).default([]),
        images: z.array(image()).min(1),
        inStock: z.boolean().default(true),
        featured: z.boolean().default(false),
        newArrival: z.boolean().default(false),
      })
      .refine((p) => p.category in catalog[p.gender].categories, {
        message: 'category does not belong to this gender (see src/config/catalog.ts)',
        path: ['category'],
      }),
});

export const collections = { products };
