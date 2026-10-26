import { getCollection, type CollectionEntry } from 'astro:content';
import type { Category, Gender } from '../config/catalog';

export type Product = CollectionEntry<'products'>;

export const productUrl = (p: Product) => `/p/${p.id}`;

// Featured first, then new arrivals, then alphabetical — a stable default order.
const byDefault = (a: Product, b: Product) =>
  Number(b.data.featured) - Number(a.data.featured) ||
  Number(b.data.newArrival) - Number(a.data.newArrival) ||
  a.data.name.localeCompare(b.data.name);

export async function getProducts(filter: { gender?: Gender; category?: Category } = {}) {
  const all = await getCollection('products', ({ data }) => {
    if (filter.gender && data.gender !== filter.gender) return false;
    if (filter.category && data.category !== filter.category) return false;
    return true;
  });
  return all.sort(byDefault);
}
