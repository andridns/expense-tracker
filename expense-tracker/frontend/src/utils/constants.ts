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

export const MIN_AMOUNT_OPTIONS = [
  { label: 'All Amounts', value: undefined },
  { label: 'Rp 100.000', value: 100000 },
  { label: 'Rp 500.000', value: 500000 },
  { label: 'Rp 1.000.000', value: 1000000 },
  { label: 'Rp 4.000.000', value: 4000000 },
  { label: 'Rp 5.000.000', value: 5000000 },
  { label: 'Rp 8.000.000', value: 8000000 },
  { label: 'Rp 10.000.000', value: 10000000 },
] as const;
