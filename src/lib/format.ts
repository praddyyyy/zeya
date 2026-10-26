const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatPrice = (amount: number) => inr.format(amount);

export const discountPercent = (price: number, mrp?: number) =>
  mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
