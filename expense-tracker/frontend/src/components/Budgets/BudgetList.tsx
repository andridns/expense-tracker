import { formatCurrency } from '../../utils/format';
import type { Budget } from '../../types';

interface BudgetListProps {
  budgets: Budget[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const BudgetList = ({ budgets, isLoading, onEdit, onDelete }: BudgetListProps) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No budgets found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          {budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'}
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {budgets.map((budget) => (
          <div key={budget.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800">
                    {budget.category_id ? 'Category Budget' : 'Total Budget'}
                  </h4>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded capitalize">
                    {budget.period}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    {new Date(budget.start_date).toLocaleDateString()} -{' '}
                    {new Date(budget.end_date).toLocaleDateString()}
                  </p>
                  <p className="mt-1">
                    Amount: {formatCurrency(budget.amount, budget.currency)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(budget.id)}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(budget.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetList;
