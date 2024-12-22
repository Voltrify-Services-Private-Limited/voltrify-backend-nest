export function calculateDiscountedPrice(
  originalPrice: number,
  discount: number,
  discountType: 'rate' | 'percentage'
): number {
  if (discountType === 'percentage') {
    return originalPrice - (originalPrice * discount) / 100;
  } else if (discountType === 'rate') {
    return originalPrice - discount;
  }
  return originalPrice;
}
