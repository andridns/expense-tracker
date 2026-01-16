import { formatCurrency } from '../../utils/format';
import type { SummaryReport } from '../../types';

interface SummaryCardsProps {
  summary?: SummaryReport;
}

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Expenses</h3>
        <p className="text-3xl font-bold text-gray-800">
          {formatCurrency(summary.total_amount, summary.currency || 'IDR')}
        </p>
        <p className="text-sm text-gray-500 mt-1">{summary.total_expenses} transactions</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Average Expense</h3>
        <p className="text-3xl font-bold text-gray-800">
          {formatCurrency(summary.average_amount, summary.currency || 'IDR')}
        </p>
        <p className="text-sm text-gray-500 mt-1">Per transaction</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Period</h3>
        <p className="text-2xl font-bold text-gray-800 capitalize">{summary.period}</p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(summary.start_date).toLocaleDateString()} - {new Date(summary.end_date).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
