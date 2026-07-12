export function formatCurrency(amount: number) {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('ar-LY', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absAmount);
  
  return `${amount < 0 ? '-' : ''}${formatted} د.ل`;
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('ar-LY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateStr));
}
