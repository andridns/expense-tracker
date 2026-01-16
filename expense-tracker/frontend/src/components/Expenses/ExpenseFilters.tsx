import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, tagsApi } from '../../services/api';
import type { ExpenseFilters } from '../../types';
import { PAYMENT_METHODS } from '../../utils/constants';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
}

const ExpenseFiltersComponent = ({ filters, onFiltersChange }: ExpenseFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<ExpenseFilters>(filters);
  const [tagQuery, setTagQuery] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: tagSuggestions } = useQuery({
    queryKey: ['tag-suggestions', tagQuery],
    queryFn: () => tagsApi.getSuggestions(tagQuery),
    enabled: tagQuery.length > 0,
  });

  useEffect(() => {
    onFiltersChange(localFilters);
  }, [localFilters, onFiltersChange]);

  const handleChange = (key: keyof ExpenseFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const clearFilters = () => {
    setLocalFilters({});
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-apple">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search expenses..."
            className="w-full px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">Category</label>
          <select
            value={localFilters.category_id || ''}
            onChange={(e) => handleChange('category_id', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">Payment Method</label>
          <select
            value={localFilters.payment_method || ''}
            onChange={(e) => handleChange('payment_method', e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
          >
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">Date Range</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={localFilters.start_date || ''}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
            />
            <input
              type="date"
              value={localFilters.end_date || ''}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">Amount Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={localFilters.min_amount || ''}
              onChange={(e) => handleChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Min"
              className="flex-1 px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
            />
            <input
              type="number"
              value={localFilters.max_amount || ''}
              onChange={(e) => handleChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Max"
              className="flex-1 px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
            />
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-warm-gray-700 mb-2">Tags</label>
          <div className="relative">
            <input
              type="text"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              onBlur={(e) => {
                // Delay to allow click on suggestions
                setTimeout(() => {
                  if (tagQuery) {
                    handleChange('tags', tagQuery);
                  }
                }, 200);
              }}
              placeholder="Enter tags..."
              className="w-full px-4 py-2.5 border-2 border-warm-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white text-warm-gray-800 transition-all"
            />
            {tagSuggestions && tagSuggestions.length > 0 && tagQuery && (
              <div className="absolute z-20 mt-1 w-full bg-white border-2 border-warm-gray-200 rounded-xl shadow-apple-lg p-2 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-1.5">
                  {tagSuggestions.slice(0, 5).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        setTagQuery(tag);
                        handleChange('tags', tag);
                        setTagQuery('');
                      }}
                      className="px-2.5 py-1 bg-beige-100 text-warm-gray-700 text-xs rounded-lg hover:bg-beige-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={clearFilters}
          className="px-5 py-2.5 text-warm-gray-700 bg-beige-100 rounded-xl hover:bg-beige-200 transition-colors font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ExpenseFiltersComponent;
