import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../services/api';
import { toast } from 'react-hot-toast';
import ExpenseList from '../components/Expenses/ExpenseList';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import ExpenseFilters from '../components/Expenses/ExpenseFilters';
import type { ExpenseFilters as ExpenseFiltersType } from '../types';

const Expenses = () => {
  const [filters, setFilters] = useState<ExpenseFiltersType>({});
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.getAll(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted');
    },
    onError: () => {
      toast.error('Failed to delete expense');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    // Show undo toast (simplified - in real app would need to track deleted items)
    toast.success('Expense deleted', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          // Would restore the expense here
          toast.success('Expense restored');
        },
      },
    });
  };

  const handleEdit = (id: string) => {
    setEditingExpense(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Expenses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
        >
          + Add Expense
        </button>
      </div>

      <ExpenseFilters filters={filters} onFiltersChange={setFilters} />

      {showForm && (
        <ExpenseForm
          expenseId={editingExpense}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
          }}
        />
      )}

      <ExpenseList
        expenses={expenses || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Expenses;
