import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { CategoryBreakdown } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data?: CategoryBreakdown;
}

const CategoryChart = ({ data }: CategoryChartProps) => {
  if (!data || !data.breakdown || data.breakdown.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.breakdown.map((item) => item.category_name),
    datasets: [
      {
        data: data.breakdown.map((item) => item.total),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#9C27B0',
          '#F44336',
          '#00BCD4',
          '#FFEB3B',
          '#795548',
          '#607D8B',
          '#E91E63',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CategoryChart;
