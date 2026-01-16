import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import BudgetList from '../components/Budgets/BudgetList';
import BudgetForm from '../components/Budgets/BudgetForm';

const Budgets = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted');
    },
    onError: () => {
      toast.error('Failed to delete budget');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (id: string) => {
    setEditingBudget(id);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-warm-gray-800">Budgets</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-400 text-white px-6 py-3 rounded-xl hover:bg-primary-500 transition-all shadow-apple hover:shadow-apple-lg font-medium"
        >
          + Add Budget
        </button>
      </div>

      {showForm && (
        <BudgetForm
          budgetId={editingBudget}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose();
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
          }}
        />
      )}

      <BudgetList
        budgets={budgets || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Budgets;
