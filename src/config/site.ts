// Brand + contact details used across the site. Edit these, not the components.
export const site = {
  name: 'Zeya',
  tagline: 'Clothing made with care, ordered with a message.',
  description:
    "Men's shirts, tees and trousers, women's sarees, kurtis and western wear, made in our own workshop. Browse, pick your size and order directly on WhatsApp.",

  // WhatsApp number that receives orders: country code + number, digits only (e.g. '919876543210').
  // While empty, WhatsApp opens with the order message and asks the customer which chat to send it to.
  whatsappNumber: '',

  // Placeholder contact details — replace before launch.
  email: 'hello@zeya.example.com',
  instagram: 'https://instagram.com/',
  address: ['Zeya Workshop', '12 Placeholder Street', 'Your City, State 600001'],
  hours: 'Mon – Sat, 10 am – 7 pm',
};

export const nav = [
  { label: 'Women', href: '/women' },
  { label: 'Men', href: '/men' },
  { label: 'Shop All', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
