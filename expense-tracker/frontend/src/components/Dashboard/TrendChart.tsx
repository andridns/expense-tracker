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
      <div className="bg-white p-6 rounded-2xl shadow-apple">
        <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Spending Trends</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-warm-gray-500">No data available</p>
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
        borderColor: '#60a5fa', // Sky blue
        backgroundColor: 'rgba(96, 165, 250, 0.1)', // Light sky blue
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
    <div className="bg-white p-6 rounded-2xl shadow-apple">
      <h3 className="text-lg font-semibold text-warm-gray-800 mb-4">Spending Trends</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default TrendChart;
