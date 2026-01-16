import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, categoriesApi, uploadApi, tagsApi } from '../../services/api';
import { toast } from 'react-hot-toast';
import type { ExpenseCreate, ExpenseUpdate } from '../../types';

interface ExpenseFormProps {
  expenseId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'GoPay',
  'OVO',
  'DANA',
  'LinkAja',
  'ShopeePay',
];

const ExpenseForm = ({ expenseId, onClose, onSuccess }: ExpenseFormProps) => {
  const [formData, setFormData] = useState<ExpenseCreate>({
    amount: 0,
    currency: 'IDR',
    description: '',
    category_id: null,
    date: new Date().toISOString().split('T')[0],
    tags: [],
    payment_method: 'Cash',
    receipt_url: null,
    location: null,
    notes: null,
    is_recurring: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: expense } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn: () => expensesApi.getById(expenseId!),
    enabled: !!expenseId,
  });

  const { data: tagSuggestions } = useQuery({
    queryKey: ['tag-suggestions', tagInput],
    queryFn: () => tagsApi.getSuggestions(tagInput),
    enabled: tagInput.length > 0,
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description,
        category_id: expense.category_id,
        date: expense.date,
        tags: expense.tags || [],
        payment_method: expense.payment_method,
        receipt_url: expense.receipt_url,
        location: expense.location || null,
        notes: expense.notes || null,
        is_recurring: expense.is_recurring,
      });
    }
  }, [expense]);

  const createMutation = useMutation({
    mutationFn: (data: ExpenseCreate) => expensesApi.create(data),
    onSuccess: () => {
      toast.success('Expense created successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to create expense');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseUpdate }) =>
      expensesApi.update(id, data),
    onSuccess: () => {
      toast.success('Expense updated successfully');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update expense');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.payment_method) {
      newErrors.payment_method = 'Payment method is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (expenseId) {
      updateMutation.mutate({ id: expenseId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadApi.uploadReceipt(file);
      setFormData({ ...formData, receipt_url: result.url });
      toast.success('Receipt uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload receipt');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {expenseId ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
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
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
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
                  <option value="">Select category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.payment_method ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                {errors.payment_method && (
                  <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value || null })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagAdd();
                      }
                    }}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                {tagSuggestions && tagSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tagSuggestions.slice(0, 5).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setTagInput(tag);
                          handleTagAdd();
                        }}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-100 text-primary-800 text-sm rounded flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value || null })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                {formData.receipt_url && (
                  <p className="text-sm text-gray-600 mt-1">
                    Receipt uploaded: {formData.receipt_url}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) =>
                      setFormData({ ...formData, is_recurring: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Recurring expense
                  </span>
                </label>
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
                  : expenseId
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

export default ExpenseForm;
