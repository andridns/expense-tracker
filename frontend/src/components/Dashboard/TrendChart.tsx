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
  ChartOptions,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import type { TrendData } from '../../types';
import { useRef } from 'react';
import { formatPeriodLabel } from '../../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface TrendChartProps {
  data?: TrendData;
  title?: string;
  view?: 'chart' | 'table';
  onViewChange?: (view: 'chart' | 'table') => void;
  onZoomChange?: (startPeriod: string, endPeriod: string) => void;
  onDataPointClick?: (period: string) => void;
}

const TrendChart = ({
  data,
  title = "Spending Trends",
  view = 'chart',
  onViewChange,
  onZoomChange,
  onDataPointClick,
}: TrendChartProps) => {
  const chartRef = useRef<ChartJS<'line', number[], string>>(null);
  const trendItems = data?.trends ?? [];
  const hasData = trendItems.length > 0;

  const getPeriodSortKey = (period: string): number => {
    if (/^\d{4}-\d{2}$/.test(period)) {
      const [year, month] = period.split('-');
      return Number(year) * 100 + Number(month);
    }
    if (/^\d{4}-Q[1-4]$/.test(period)) {
      const [year, quarter] = period.split('-Q');
      return Number(year) * 100 + Number(quarter) * 3;
    }
    if (/^\d{4}-S[1-2]$/.test(period)) {
      const [year, semester] = period.split('-S');
      return Number(year) * 100 + Number(semester) * 6;
    }
    if (/^\d{4}$/.test(period)) {
      return Number(period) * 100;
    }
    return 0;
  };

  const sortedTrendItems = [...trendItems].sort(
    (a, b) => getPeriodSortKey(b.period) - getPeriodSortKey(a.period)
  );

  const chartData = {
    labels: trendItems.map((item) => item.period),
    datasets: [
      {
        label: 'Total Spending',
        data: trendItems.map((item) => item.total),
        borderColor: '#60a5fa', // Sky blue
        backgroundColor: 'rgba(96, 165, 250, 0.1)', // Light sky blue
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const handleResetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  });

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onClick: (_event, elements) => {
      if (elements && elements.length > 0 && onDataPointClick) {
        const element = elements[0];
        const index = element.index;
        const labels = chartData.labels;
        if (labels && labels[index]) {
          onDataPointClick(labels[index]);
        }
      }
    },
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
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
          onZoom: (context: { chart: ChartJS }) => {
            const xScale = context.chart.scales.x;
            if (xScale && onZoomChange) {
              const minIndex = Math.floor(xScale.min);
              const maxIndex = Math.ceil(xScale.max);
              const labels = context.chart.data.labels as string[];
              if (labels && labels.length > 0) {
                const startPeriod = labels[Math.max(0, minIndex)] || labels[0];
                const endPeriod = labels[Math.min(labels.length - 1, maxIndex)] || labels[labels.length - 1];
                onZoomChange(startPeriod, endPeriod);
              }
            }
          },
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
          onPan: (context: { chart: ChartJS }) => {
            const xScale = context.chart.scales.x;
            if (xScale && onZoomChange) {
              const minIndex = Math.floor(xScale.min);
              const maxIndex = Math.ceil(xScale.max);
              const labels = context.chart.data.labels as string[];
              if (labels && labels.length > 0) {
                const startPeriod = labels[Math.max(0, minIndex)] || labels[0];
                const endPeriod = labels[Math.min(labels.length - 1, maxIndex)] || labels[labels.length - 1];
                onZoomChange(startPeriod, endPeriod);
              }
            }
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
      },
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-warm-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-xl border border-warm-gray-200 bg-warm-gray-100 p-1">
            <button
              type="button"
              onClick={() => onViewChange?.('chart')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === 'chart'
                  ? 'bg-white text-primary-600 shadow-apple'
                  : 'text-warm-gray-600 hover:text-warm-gray-800'
              }`}
            >
              Chart
            </button>
            <button
              type="button"
              onClick={() => onViewChange?.('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                view === 'table'
                  ? 'bg-white text-primary-600 shadow-apple'
                  : 'text-warm-gray-600 hover:text-warm-gray-800'
              }`}
            >
              Table
            </button>
          </div>
          {view === 'chart' && hasData && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-3 py-1.5 text-xs font-medium text-warm-gray-700 bg-warm-gray-100 hover:bg-warm-gray-200 rounded-lg transition-colors"
            >
              Reset Zoom
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-warm-gray-500">No data available</p>
        </div>
      ) : view === 'chart' ? (
        <>
          <div className="h-64">
            <Line ref={chartRef} data={chartData} options={options} />
          </div>
          <p className="text-xs text-warm-gray-500 mt-2">
            💡 Drag to pan • Scroll or pinch to zoom • Double-click to reset
          </p>
        </>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-modern-border/10 to-transparent">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-modern-text-light uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-modern-text-light uppercase tracking-wider">
                  Total (IDR)
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-modern-text-light uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-modern-border/30">
              {sortedTrendItems.map((item) => (
                <tr key={item.period} className="hover:bg-primary-50/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-modern-text">
                    {formatPeriodLabel(item.period)}
                  </td>
                  <td className="px-4 py-3 text-sm text-modern-text text-right font-semibold">
                    {currencyFormatter.format(item.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDataPointClick?.(item.period)}
                      disabled={!onDataPointClick}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white shadow-apple hover:bg-primary-700 disabled:bg-warm-gray-200 disabled:text-warm-gray-500 disabled:shadow-none"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
