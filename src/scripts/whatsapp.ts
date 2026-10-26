import { site } from '../config/site';
import { formatPrice } from '../lib/format';
import type { CartItem } from './cart';

export type Customer = {
  name: string;
  phone: string;
  city: string;
  address?: string;
  note?: string;
};

export function whatsappUrl(text: string) {
  const number = site.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function orderMessage(items: CartItem[], customer: Customer, origin = location.origin) {
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  const lines = items.map((i, n) => {
    const variant = [`Size: ${i.size}`, i.color && `Colour: ${i.color}`, `Qty: ${i.qty}`].filter(Boolean).join(' | ');
    return [`${n + 1}. *${i.name}* (${i.code})`, `   ${variant} | ${formatPrice(i.price * i.qty)}`, `   ${origin}${i.url}`].join('\n');
  });

  return [
    `Hi ${site.name}! I'd like to place an order:`,
    '',
    ...lines,
    '',
    `*Total: ${formatPrice(total)}*`,
    '',
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `City / Pincode: ${customer.city}`,
    customer.address ? `Address: ${customer.address}` : null,
    customer.note ? `Note: ${customer.note}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export const enquiryUrl = (text = `Hi ${site.name}! I have a question.`) => whatsappUrl(text);
