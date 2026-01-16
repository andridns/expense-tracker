import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TrendData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data?: TrendData;
}

const TrendChart = ({ data }: TrendChartProps) => {
  if (!data || !data.trends || data.trends.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.trends.map((item) => item.period),
    datasets: [
      {
        label: 'Total Spending',
        data: data.trends.map((item) => item.total),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y || 0;
            return `Total: ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;
