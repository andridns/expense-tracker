import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi, categoriesApi } from '../services/api';
import TrendChart from '../components/Dashboard/TrendChart';

type PeriodType = 'monthly' | 'quarterly' | 'yearly';

const Reports = () => {
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: trends } = useQuery({
    queryKey: ['trends', period, selectedCategoryIds],
    queryFn: () => reportsApi.getTrends(period, undefined, selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined),
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        // Remove category from selection
        return prev.filter(id => id !== categoryId);
      } else {
        // Add category to selection
        return [...prev, categoryId];
      }
    });
  };

  const handleClearAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  const getCategoryNames = (): string => {
    if (selectedCategoryIds.length === 0) return '';
    const names = selectedCategoryIds
      .map(id => categories?.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
    return names;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold text-warm-gray-800">Reports</h2>

      {/* Period Toggle */}
      <div className="glass p-4 md:p-5 rounded-2xl shadow-modern border border-modern-border/50">
        <label className="block text-sm font-semibold text-warm-gray-700 mb-3">Period</label>
        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 ${
              period === 'monthly'
                ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 ${
              period === 'quarterly'
                ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 ${
              period === 'yearly'
                ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="glass p-4 md:p-5 rounded-2xl shadow-modern border border-modern-border/50">
        <label className="block text-sm font-semibold text-warm-gray-700 mb-3">Category</label>
        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button
            onClick={handleClearAllCategories}
            className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-1.5 ${
              selectedCategoryIds.length === 0
                ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories?.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                    : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
                }`}
              >
                <span>{cat.icon || '📁'}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trend Chart */}
      <TrendChart 
        data={trends} 
        title={`Expense Trends${getCategoryNames() ? ` - ${getCategoryNames()}` : ''}`}
      />
    </div>
  );
};

export default Reports;
