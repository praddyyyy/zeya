// Client-side size filter + sort for product listings rendered by ShopView.astro.
function apply(shop: HTMLElement) {
  const grid = shop.querySelector<HTMLElement>('[data-shop-grid]');
  if (!grid) return;
  const sizes = [...shop.querySelectorAll<HTMLInputElement>('input[name="size"]:checked')].map((i) => i.value);
  const sort = shop.querySelector<HTMLSelectElement>('select[name="sort"]')?.value ?? 'featured';
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-card]')];

  let shown = 0;
  for (const card of cards) {
    const cardSizes = card.dataset.sizes!.split('|');
    const visible = sizes.length === 0 || sizes.some((s) => cardSizes.includes(s));
    card.hidden = !visible;
    if (visible) shown++;
  }

  const num = (el: HTMLElement, key: string) => Number(el.dataset[key]);
  const sorters: Record<string, (a: HTMLElement, b: HTMLElement) => number> = {
    featured: (a, b) => num(a, 'index') - num(b, 'index'),
    new: (a, b) => num(b, 'new') - num(a, 'new') || num(a, 'index') - num(b, 'index'),
    'price-asc': (a, b) => num(a, 'price') - num(b, 'price'),
    'price-desc': (a, b) => num(b, 'price') - num(a, 'price'),
  };
  cards.sort(sorters[sort] ?? sorters.featured).forEach((c) => grid.append(c));

  const count = shop.querySelector('[data-shop-count]');
  if (count) count.textContent = `${shown} ${shown === 1 ? 'piece' : 'pieces'}`;
  shop.querySelector('[data-shop-empty]')?.classList.toggle('hidden', shown > 0);
  shop.querySelector('[data-shop-clear]')?.classList.toggle('hidden', sizes.length === 0);
}

export function initShop() {
  document.addEventListener('change', (e) => {
    const shop = (e.target as HTMLElement).closest<HTMLElement>('[data-shop]');
    if (shop) apply(shop);
  });
  document.addEventListener('click', (e) => {
    const clear = (e.target as HTMLElement).closest('[data-shop-clear]');
    const shop = clear?.closest<HTMLElement>('[data-shop]');
    if (!shop) return;
    shop.querySelectorAll<HTMLInputElement>('input[name="size"]').forEach((i) => (i.checked = false));
    apply(shop);
  });
}
