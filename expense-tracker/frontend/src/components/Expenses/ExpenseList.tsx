import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Expense } from '../../types';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExpenseList = ({ expenses, isLoading, onEdit, onDelete }: ExpenseListProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

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

  if (expenses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No expenses found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded ${
              viewMode === 'table'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                    {expense.is_recurring && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        Recurring
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-x-4">
                    <span>{formatDate(expense.date)}</span>
                    <span>{expense.payment_method}</span>
                    {expense.location && <span>📍 {expense.location}</span>}
                  </div>
                  {expense.tags && expense.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {expense.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-gray-800">
                    {formatCurrency(expense.amount, expense.currency)}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => onEdit(expense.id)}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {expense.description}
                      {expense.is_recurring && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          🔄
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{expense.payment_method}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(expense.id)}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
