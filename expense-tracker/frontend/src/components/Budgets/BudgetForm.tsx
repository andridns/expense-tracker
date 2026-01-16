import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import type { BudgetCreate } from '../../types';
import { CURRENCIES } from '../../utils/constants';

interface BudgetFormProps {
  budgetId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BudgetForm = ({ budgetId, onClose, onSuccess }: BudgetFormProps) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [formData, setFormData] = useState<BudgetCreate>({
    category_id: null,
    amount: 0,
    currency: 'IDR',
    period: 'monthly',
    start_date: startOfMonth.toISOString().split('T')[0],
    end_date: endOfMonth.toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: budget } = useQuery({
    queryKey: ['budget', budgetId],
    queryFn: () => budgetsApi.getById(budgetId!),
    enabled: !!budgetId,
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount,
        currency: budget.currency,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date,
      });
    }
  }, [budget]);

  const createMutation = useMutation({
    mutationFn: (data: BudgetCreate) => budgetsApi.create(data),
    onSuccess: () => {
      toast.success('Budget created successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create budget');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetCreate> }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      toast.success('Budget updated successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update budget');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (budgetId) {
      updateMutation.mutate({ id: budgetId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePeriodChange = (period: 'monthly' | 'yearly') => {
    setFormData({ ...formData, period });
    const start = new Date(formData.start_date);
    let end: Date;

    if (period === 'yearly') {
      end = new Date(start.getFullYear(), 11, 31);
    } else {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    }

    setFormData({
      ...formData,
      period,
      end_date: end.toISOString().split('T')[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {budgetId ? 'Edit Budget' : 'Add Budget'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Type
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Total Budget</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} Budget
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handlePeriodChange('monthly')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    formData.period === 'monthly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange('yearly')}
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    formData.period === 'yearly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.end_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.end_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : budgetId
                  ? 'Update'
                  : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;
