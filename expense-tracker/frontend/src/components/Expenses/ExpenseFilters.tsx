import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi, tagsApi } from '../../services/api';
import type { ExpenseFilters } from '../../types';

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange: (filters: ExpenseFilters) => void;
}

const PAYMENT_METHODS = [
  'Cash',
  'Debit Card',
  'Credit Card',
  'GoPay',
  'OVO',
  'DANA',
  'LinkAja',
  'ShopeePay',
];

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
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search expenses..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={localFilters.category_id || ''}
            onChange={(e) => handleChange('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            value={localFilters.payment_method || ''}
            onChange={(e) => handleChange('payment_method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={localFilters.start_date || ''}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="date"
              value={localFilters.end_date || ''}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={localFilters.min_amount || ''}
              onChange={(e) => handleChange('min_amount', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Min"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <input
              type="number"
              value={localFilters.max_amount || ''}
              onChange={(e) => handleChange('max_amount', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Max"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            onBlur={() => {
              if (tagQuery) {
                handleChange('tags', tagQuery);
              }
            }}
            placeholder="Enter tags..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {tagSuggestions && tagSuggestions.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {tagSuggestions.slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setTagQuery(tag);
                    handleChange('tags', tag);
                  }}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ExpenseFiltersComponent;
