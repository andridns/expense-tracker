import { useQuery } from '@tanstack/react-query';
import { budgetsApi, expensesApi } from '../../services/api';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/format';

const BudgetCards = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll('monthly'),
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: () =>
      expensesApi.getAll({
        start_date: format(startOfMonth, 'yyyy-MM-dd'),
        end_date: format(endOfMonth, 'yyyy-MM-dd'),
      }),
  });

  const currentBudgets = budgets?.filter(
    (budget) =>
      new Date(budget.start_date) <= today && new Date(budget.end_date) >= today
  ) || [];

  const calculateSpent = (budget: typeof currentBudgets[0]) => {
    if (!expenses) return 0;
    if (budget.category_id) {
      return expenses
        .filter((exp) => exp.category_id === budget.category_id)
        .reduce((sum, exp) => sum + exp.amount, 0);
    } else {
      // Total budget
      return expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }
  };

  if (currentBudgets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Budgets</h3>
        <p className="text-gray-500">No budgets set for this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Budgets</h3>
      <div className="space-y-4">
        {currentBudgets.map((budget) => {
          const spent = calculateSpent(budget);
          const percentage = (spent / budget.amount) * 100;
          const remaining = budget.amount - spent;
          const isOverBudget = spent > budget.amount;

          return (
            <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {budget.category_id ? 'Category Budget' : 'Total Budget'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(budget.amount, budget.currency)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOverBudget
                      ? 'bg-red-100 text-red-800'
                      : percentage > 80
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isOverBudget
                      ? 'bg-red-500'
                      : percentage > 80
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Spent: {formatCurrency(spent, budget.currency)}</span>
                <span>
                  {isOverBudget ? 'Over by ' : 'Remaining: '}
                  {formatCurrency(Math.abs(remaining), budget.currency)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetCards;
