import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/api';
import { format } from 'date-fns';
import SummaryCards from '../components/Dashboard/SummaryCards';
import CategoryChart from '../components/Dashboard/CategoryChart';
import TrendChart from '../components/Dashboard/TrendChart';
import BudgetCards from '../components/Dashboard/BudgetCards';

const Dashboard = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: summary } = useQuery({
    queryKey: ['summary', startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: () =>
      reportsApi.getSummary(
        format(startOfMonth, 'yyyy-MM-dd'),
        format(endOfMonth, 'yyyy-MM-dd'),
        'monthly'
      ),
  });

  const { data: categoryBreakdown } = useQuery({
    queryKey: ['category-breakdown', startOfMonth.toISOString(), endOfMonth.toISOString()],
    queryFn: () =>
      reportsApi.getCategoryBreakdown(
        format(startOfMonth, 'yyyy-MM-dd'),
        format(endOfMonth, 'yyyy-MM-dd')
      ),
  });

  const { data: trends } = useQuery({
    queryKey: ['trends', 'monthly'],
    queryFn: () => reportsApi.getTrends(undefined, undefined, 'monthly'),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-600">
          {format(startOfMonth, 'MMMM yyyy')}
        </p>
      </div>

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryBreakdown} />
        <TrendChart data={trends} />
      </div>

      <BudgetCards />
    </div>
  );
};

export default Dashboard;
