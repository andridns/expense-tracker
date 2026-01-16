export const CURRENCIES = [
  { code: 'IDR', name: 'Rupiah', symbol: 'Rp' },
  { code: 'JPY', name: 'Yen', symbol: '¥' },
  { code: 'USD', name: 'Dollar', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Ringgit', symbol: 'RM' },
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'GoPay',
  'OVO',
  'DANA',
  'LinkAja',
  'ShopeePay',
] as const;
