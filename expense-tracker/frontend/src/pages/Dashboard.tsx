import QuickExpenseForm from '../components/Dashboard/QuickExpenseForm';

const Dashboard = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add Expense</h1>
        <p className="text-gray-600">Quickly add your expenses. Just type the amount and description.</p>
      </div>

      <QuickExpenseForm />
    </div>
  );
};

export default Dashboard;
