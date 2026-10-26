import { initDrawer, renderCart } from './drawer';
import { initGallery, initProduct } from './product';
import { initShop } from './shop';

// ── One-time setup (document-level delegation survives client-side navigation) ──
initDrawer();
initProduct();
initShop();

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;

  // Click on a dialog's backdrop (the dialog element itself) or a close control.
  if (t instanceof HTMLDialogElement) t.close();
  else if (t.closest('[data-dialog-close]')) t.closest('dialog')?.close();

  if (t.closest('[data-menu-open]')) {
    (document.getElementById('menu') as HTMLDialogElement | null)?.showModal();
  }
});

const header = () => document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header()?.toggleAttribute('data-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });

// ── Per-page setup ──
let reveal: IntersectionObserver | undefined;

document.addEventListener('astro:page-load', () => {
  renderCart();
  onScroll();
  initGallery();

  reveal?.disconnect();
  reveal = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        reveal?.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => reveal!.observe(el));
});
