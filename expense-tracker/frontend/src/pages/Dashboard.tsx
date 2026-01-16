import QuickExpenseForm from '../components/Dashboard/QuickExpenseForm';

const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-semibold text-warm-gray-800 mb-3">Add Expense</h1>
        <p className="text-lg text-warm-gray-600">Quickly add your expenses. Just type the amount and description.</p>
      </div>

      <QuickExpenseForm />
    </div>
  );
};

export default Dashboard;
