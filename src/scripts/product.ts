import { cart, itemKey, type NewCartItem } from './cart';
import { bumpBadge, openCart, openCheckout, replay } from './drawer';

type ProductData = Omit<NewCartItem, 'size' | 'color'>;

function handleSubmit(form: HTMLFormElement, intent: string) {
  const product = JSON.parse(form.dataset.product!) as ProductData;
  const fd = new FormData(form);
  const size = String(fd.get('size') ?? '');
  const color = String(fd.get('color') ?? '');
  const qty = Math.max(1, Number(fd.get('qty')) || 1);

  const sizeError = form.querySelector<HTMLElement>('[data-size-error]');
  if (!size) {
    sizeError?.classList.remove('hidden');
    replay(form.querySelector('[data-size-group]'), 'animate-shake');
    return;
  }
  sizeError?.classList.add('hidden');

  const item: NewCartItem = { ...product, size, color };
  if (intent === 'buy') {
    openCheckout([{ ...item, key: itemKey(item), qty }], false);
    return;
  }

  cart.add(item, qty);
  bumpBadge();
  const button = form.querySelector<HTMLButtonElement>('button[value="add"]');
  if (button) {
    button.dataset.added = '';
    setTimeout(() => delete button.dataset.added, 1800);
  }
  setTimeout(openCart, 450);
}

export function initProduct() {
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (!form.matches('[data-product-form]')) return;
    e.preventDefault();
    const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    handleSubmit(form, submitter?.value ?? 'add');
  });

  document.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const form = input.closest<HTMLFormElement>('[data-product-form]');
    if (!form) return;
    if (input.name === 'size') form.querySelector('[data-size-error]')?.classList.add('hidden');
    if (input.name === 'color') {
      const label = form.querySelector('[data-color-label]');
      if (label) label.textContent = input.value;
    }
  });

  // Quantity stepper
  document.addEventListener('click', (e) => {
    const step = (e.target as HTMLElement).closest<HTMLElement>('[data-qty-step]');
    if (!step) return;
    const input = step.parentElement?.querySelector<HTMLInputElement>('input[name="qty"]');
    if (!input) return;
    const next = Number(input.value) + Number(step.dataset.qtyStep);
    input.value = String(Math.min(Number(input.max) || 20, Math.max(1, next)));
  });
}

// Gallery: swipeable track with dots on mobile, thumbnails on desktop.
export function initGallery() {
  const track = document.querySelector<HTMLElement>('[data-gallery-track]');
  if (!track) return;
  const slides = [...track.children] as HTMLElement[];
  const markers = document.querySelectorAll<HTMLElement>('[data-gallery-go]');

  const setActive = (index: number) =>
    markers.forEach((m) => m.toggleAttribute('data-active', Number(m.dataset.galleryGo) === index));

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(slides.indexOf(entry.target as HTMLElement));
      }
    },
    { root: track, threshold: 0.6 },
  );
  slides.forEach((s) => io.observe(s));

  markers.forEach((m) =>
    m.addEventListener('click', () => {
      const slide = slides[Number(m.dataset.galleryGo)];
      track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
    }),
  );
}
