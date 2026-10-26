import { formatPrice } from '../lib/format';
import { cart, type CartItem } from './cart';
import { orderMessage, whatsappUrl, type Customer } from './whatsapp';

const CUSTOMER_KEY = 'zeya:customer:v1';
type View = 'bag' | 'checkout' | 'sent';

// Items being checked out: the whole bag, or a single "Buy now" item.
let checkout: { items: CartItem[]; fromCart: boolean } = { items: [], fromCart: true };

const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(`#cart ${sel}`);
const dialog = () => document.getElementById('cart') as HTMLDialogElement | null;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function setView(view: View) {
  document.querySelectorAll<HTMLElement>('#cart [data-view]').forEach((el) => {
    const active = el.dataset.view === view;
    el.classList.toggle('hidden', !active);
    el.classList.toggle('flex', active);
  });
  $('[data-cart-back]')?.classList.toggle('hidden', view !== 'checkout' || !checkout.fromCart);
  const title = $('#cart-title');
  if (title) title.textContent = { bag: 'Your bag', checkout: 'Your details', sent: 'Order ready' }[view];
}

function itemRow(i: CartItem) {
  const meta = [`Size ${i.size}`, i.color, i.code].filter(Boolean).map(esc).join(' · ');
  return `
  <li class="flex gap-4 py-5" data-key="${esc(i.key)}">
    <a href="${esc(i.url)}" data-dialog-close class="shrink-0 overflow-hidden rounded-lg bg-sand">
      <img src="${esc(i.image)}" alt="" class="aspect-4/5 w-20 object-cover" loading="lazy" />
    </a>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-3">
        <a href="${esc(i.url)}" data-dialog-close class="font-serif text-lg leading-tight hover:text-terracotta">${esc(i.name)}</a>
        <button type="button" data-cart-remove class="-mr-1 -mt-1 rounded-full p-1 text-muted hover:text-espresso" aria-label="Remove ${esc(i.name)}">
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="mt-1 text-xs text-muted">${meta}</p>
      <div class="mt-auto flex items-center justify-between pt-3">
        <div class="flex items-center rounded-full border border-line">
          <button type="button" data-cart-qty="-1" class="grid size-8 place-items-center rounded-full hover:bg-sand" aria-label="Decrease quantity">−</button>
          <span class="w-6 text-center text-sm tabular-nums">${i.qty}</span>
          <button type="button" data-cart-qty="1" class="grid size-8 place-items-center rounded-full hover:bg-sand" aria-label="Increase quantity">+</button>
        </div>
        <span class="text-sm font-semibold">${formatPrice(i.price * i.qty)}</span>
      </div>
    </div>
  </li>`;
}

export function renderCart() {
  const items = cart.items();
  const list = $('[data-cart-items]');
  if (!list) return;
  list.innerHTML = items.map(itemRow).join('');
  const empty = items.length === 0;
  list.classList.toggle('hidden', empty);
  $('[data-cart-footer]')?.classList.toggle('hidden', empty);
  $('[data-cart-empty]')?.classList.toggle('hidden', !empty);
  $('[data-cart-empty]')?.classList.toggle('flex', empty);
  const subtotal = $('[data-cart-subtotal]');
  if (subtotal) subtotal.textContent = formatPrice(cart.subtotal());

  const count = cart.count();
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('hidden', count === 0);
  });
}

// Re-trigger a one-shot CSS animation class.
export function replay(el: Element | null | undefined, className: string) {
  if (!el) return;
  el.classList.remove(className);
  el.getBoundingClientRect(); // force reflow so the animation restarts
  el.classList.add(className);
}

export function bumpBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => replay(el, 'animate-bump'));
}

export function openCart() {
  setView('bag');
  renderCart();
  const d = dialog();
  if (d && !d.open) d.showModal();
}

export function openCheckout(items: CartItem[], fromCart: boolean) {
  checkout = { items, fromCart };
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const summary = $('[data-checkout-summary]');
  if (summary) {
    summary.innerHTML = `
      <ul class="space-y-1">${items
        .map((i) => `<li class="flex justify-between gap-3"><span class="truncate">${i.qty} × ${esc(i.name)} <span class="text-muted">(${esc(i.size)})</span></span><span>${formatPrice(i.qty * i.price)}</span></li>`)
        .join('')}</ul>
      <div class="mt-3 flex justify-between border-t border-line pt-3 font-semibold"><span>${count} item${count > 1 ? 's' : ''}</span><span>${formatPrice(total)}</span></div>`;
  }
  const form = $<HTMLFormElement>('form[data-view="checkout"]');
  if (form) {
    const saved = loadCustomer();
    for (const [k, v] of Object.entries(saved)) {
      const field = form.elements.namedItem(k) as HTMLInputElement | null;
      if (field && !field.value && typeof v === 'string') field.value = v;
    }
  }
  $('[data-checkout-error]')?.classList.add('hidden');
  setView('checkout');
  const d = dialog();
  if (d && !d.open) d.showModal();
}

function loadCustomer(): Partial<Customer> {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function submitCheckout(form: HTMLFormElement) {
  const data = Object.fromEntries(
    [...new FormData(form)].map(([k, v]) => [k, String(v).trim()]),
  ) as unknown as Customer;
  if (!form.checkValidity() || !data.name || !data.phone || !data.city) {
    const error = $('[data-checkout-error]');
    error?.classList.remove('hidden');
    replay(error, 'animate-shake');
    form.querySelector<HTMLInputElement>(':invalid')?.focus();
    return;
  }
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: data.name, phone: data.phone, city: data.city, address: data.address }));
  } catch {}

  const url = whatsappUrl(orderMessage(checkout.items, data));
  const retry = $<HTMLAnchorElement>('[data-sent-retry]');
  if (retry) retry.href = url;
  $('[data-sent-cart-actions]')?.classList.toggle('hidden', !checkout.fromCart);
  setView('sent');
  window.open(url, '_blank', 'noopener');
}

// One-time wiring; the dialog element persists across navigations.
export function initDrawer() {
  window.addEventListener('cart:change', renderCart);

  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const d = dialog();

    if (t.closest('[data-cart-open]')) {
      e.preventDefault();
      openCart();
    } else if (t.closest('[data-cart-checkout]')) {
      openCheckout(cart.items(), true);
    } else if (t.closest('[data-cart-back]')) {
      setView('bag');
    } else if (t.closest('[data-cart-clear]')) {
      cart.clear();
      d?.close();
    } else if (t.closest('[data-cart-remove]')) {
      const key = t.closest<HTMLElement>('[data-key]')?.dataset.key;
      if (key) cart.remove(key);
    } else if (t.closest('[data-cart-qty]')) {
      const key = t.closest<HTMLElement>('[data-key]')?.dataset.key;
      const delta = Number(t.closest<HTMLElement>('[data-cart-qty]')!.dataset.cartQty);
      const item = cart.items().find((i) => i.key === key);
      if (item) cart.setQty(item.key, item.qty + delta);
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (!form.matches('#cart form[data-view="checkout"]')) return;
    e.preventDefault();
    submitCheckout(form);
  });

  // Close before navigating away (links inside the bag).
  document.addEventListener('astro:before-preparation', () => dialog()?.close());
}
