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
import type { RentExpenseTrend } from '../../types';
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

interface RentExpenseTrendChartProps {
  data?: RentExpenseTrend;
  title?: string;
  usageView?: 'cost' | 'electricity_usage' | 'water_usage';
  view?: 'chart' | 'table';
  onViewChange?: (view: 'chart' | 'table') => void;
  onDataPointClick?: (period: string) => void;
  canEdit?: boolean;
  onEditPeriod?: (period: string) => void;
}

const RentExpenseTrendChart = ({
  data,
  title = "Rent Expense Trends",
  usageView = 'cost',
  view = 'chart',
  onViewChange,
  onDataPointClick,
  canEdit = false,
  onEditPeriod,
}: RentExpenseTrendChartProps) => {
  const chartRef = useRef<ChartJS<'line', number[], string>>(null);
  const trendItems = data?.trends ?? [];
  const hasData = trendItems.length > 0;
  const isCostView = usageView === 'cost';

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

  // Determine label and unit based on usage view
  const getLabel = () => {
    if (usageView === 'electricity_usage') return 'Electricity Usage (kWh)';
    if (usageView === 'water_usage') return 'Water Usage (m³)';
    return 'Total Rent Expense';
  };

  const chartData = {
    labels: trendItems.map((item) => item.period),
    datasets: [
      {
        label: getLabel(),
        data: trendItems.map((item) => item.total),
        borderColor: '#10b981', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)', // Light green
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

  const formatUsageValue = (value: number) =>
    value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const totalHeader =
    usageView === 'cost' ? 'Total (IDR)' : usageView === 'electricity_usage' ? 'Usage (kWh)' : 'Usage (m³)';

  const isMonthlyPeriodKey = (period: string) => /^\d{4}-\d{2}$/.test(period);
  const showActions = isCostView && trendItems.some((item) => isMonthlyPeriodKey(item.period));

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    onClick: (_event, elements) => {
      // Only allow clicking when in cost view
      if (usageView === 'cost' && elements && elements.length > 0 && onDataPointClick) {
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
            if (usageView === 'electricity_usage') {
              return `Usage: ${value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`;
            } else if (usageView === 'water_usage') {
              return `Usage: ${value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³`;
            } else {
              return `Total: ${new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(value)}`;
            }
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
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
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
            if (usageView === 'electricity_usage') {
              return `${value.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} kWh`;
            } else if (usageView === 'water_usage') {
              return `${value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} m³`;
            } else {
              return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
              }).format(value);
            }
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
                  {totalHeader}
                </th>
                {showActions && (
                  <th className="px-4 py-3 text-right text-xs font-bold text-modern-text-light uppercase tracking-wider">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-modern-border/30">
              {sortedTrendItems.map((item) => (
                <tr key={item.period} className="hover:bg-primary-50/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-modern-text">
                    {formatPeriodLabel(item.period)}
                  </td>
                  <td className="px-4 py-3 text-sm text-modern-text text-right font-semibold">
                    {isCostView
                      ? currencyFormatter.format(item.total)
                      : usageView === 'electricity_usage'
                      ? `${formatUsageValue(item.total)} kWh`
                      : `${formatUsageValue(item.total)} m³`}
                  </td>
                  {showActions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEdit && onEditPeriod && isMonthlyPeriodKey(item.period) && (
                          <button
                            type="button"
                            onClick={() => onEditPeriod(item.period)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white shadow-apple hover:bg-red-700"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDataPointClick?.(item.period)}
                          disabled={!onDataPointClick || !isMonthlyPeriodKey(item.period)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 text-white shadow-apple hover:bg-primary-700 disabled:bg-warm-gray-200 disabled:text-warm-gray-500 disabled:shadow-none"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RentExpenseTrendChart;
