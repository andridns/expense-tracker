export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPeriodLabel = (period: string): string => {
  if (!period) return '';

  if (/^\d{4}$/.test(period)) {
    return period;
  }

  if (/^\d{4}-Q[1-4]$/.test(period)) {
    const [year, quarter] = period.split('-Q');
    return `Q${quarter} ${year}`;
  }

  if (/^\d{4}-S[1-2]$/.test(period)) {
    const [year, semester] = period.split('-S');
    return `Semester ${semester} ${year}`;
  }

  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-');
    const monthIndex = Number(month) - 1;
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    if (monthIndex >= 0 && monthIndex < monthNames.length) {
      return `${monthNames[monthIndex]} ${year}`;
    }
  }

  return period;
};
