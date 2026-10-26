// Cart kept in localStorage; every change fires a `cart:change` event on window.
export type CartItem = {
  key: string;
  slug: string;
  name: string;
  code: string;
  price: number;
  size: string;
  color: string;
  qty: number;
  image: string;
  url: string;
};

export type NewCartItem = Omit<CartItem, 'key' | 'qty'>;

const STORAGE_KEY = 'zeya:cart:v1';
const MAX_QTY = 20;

function read(): CartItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode etc.) — the cart just won't persist.
  }
  memory = items;
  window.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
}

let memory: CartItem[] | null = null;

export const itemKey = (i: Pick<CartItem, 'slug' | 'size' | 'color'>) => `${i.slug}|${i.size}|${i.color}`;

export const cart = {
  items(): CartItem[] {
    memory ??= read();
    return memory;
  },
  count() {
    return cart.items().reduce((n, i) => n + i.qty, 0);
  },
  subtotal() {
    return cart.items().reduce((n, i) => n + i.qty * i.price, 0);
  },
  add(item: NewCartItem, qty = 1) {
    const key = itemKey(item);
    const items = cart.items().slice();
    const existing = items.find((i) => i.key === key);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
    else items.push({ ...item, key, qty: Math.min(MAX_QTY, qty) });
    write(items);
  },
  setQty(key: string, qty: number) {
    if (qty <= 0) return cart.remove(key);
    write(cart.items().map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)));
  },
  remove(key: string) {
    write(cart.items().filter((i) => i.key !== key));
  },
  clear() {
    write([]);
  },
};

// Keep tabs in sync.
window.addEventListener('storage', (e) => {
  if (e.key !== STORAGE_KEY) return;
  memory = read();
  window.dispatchEvent(new CustomEvent('cart:change', { detail: memory }));
});
