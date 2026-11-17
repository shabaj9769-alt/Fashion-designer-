export function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function getDiscountPercent(mrp: number, sale: number): number {
  if (mrp <= 0 || sale >= mrp) return 0;
  return Math.round(((mrp - sale) / mrp) * 100);
}
