// Gender → category structure. Product files must use these keys.
export const catalog = {
  women: {
    label: 'Women',
    blurb: 'Sarees, kurtis and western wear in fabrics that breathe.',
    categories: {
      sarees: 'Sarees',
      kurtis: 'Kurtis',
      western: 'Western Wear',
    },
  },
  men: {
    label: 'Men',
    blurb: 'Shirts, tees and trousers cut for everyday ease.',
    categories: {
      shirts: 'Shirts',
      tshirts: 'T-Shirts',
      pants: 'Pants',
    },
  },
} as const;

export type Gender = keyof typeof catalog;
export const genders = Object.keys(catalog) as Gender[];

export const categoryKeys = ['sarees', 'kurtis', 'western', 'shirts', 'tshirts', 'pants'] as const;
export type Category = (typeof categoryKeys)[number];

export function categoryLabel(gender: Gender, category: Category): string {
  return (catalog[gender].categories as Record<string, string>)[category] ?? category;
}

export function categoriesOf(gender: Gender): Category[] {
  return Object.keys(catalog[gender].categories) as Category[];
}
