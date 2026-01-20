import type { RentExpenseCategory } from '../../types';

interface RentExpenseFiltersProps {
  periodType: 'monthly' | 'yearly';
  selectedCategories: RentExpenseCategory[];
  onPeriodTypeChange: (type: 'monthly' | 'yearly') => void;
  onCategoryToggle: (category: RentExpenseCategory) => void;
  onClearCategories: () => void;
}

const RentExpenseFilters = ({
  periodType,
  selectedCategories,
  onPeriodTypeChange,
  onCategoryToggle,
  onClearCategories,
}: RentExpenseFiltersProps) => {
  const categories: { id: RentExpenseCategory; label: string; icon: string }[] = [
    { id: 'electricity', label: 'Electricity', icon: '⚡' },
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'service_charge', label: 'Service Charge', icon: '🏢' },
    { id: 'sinking_fund', label: 'Sinking Fund', icon: '💰' },
    { id: 'fitout', label: 'Fitout', icon: '🔧' },
  ];

  return (
    <div className="glass rounded-2xl shadow-modern border border-modern-border/50 overflow-hidden">
      <div className="p-4 md:p-5 space-y-4">
        {/* Period Toggle */}
        <div>
          <label className="block text-sm font-semibold text-warm-gray-700 mb-3">Period</label>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <button
              onClick={() => onPeriodTypeChange('monthly')}
              className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 ${
                periodType === 'monthly'
                  ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                  : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => onPeriodTypeChange('yearly')}
              className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 ${
                periodType === 'yearly'
                  ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                  : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div>
          <label className="block text-sm font-semibold text-warm-gray-700 mb-3">Category</label>
          <div className="flex gap-2 md:gap-3 flex-wrap">
            <button
              onClick={onClearCategories}
              className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-1.5 ${
                selectedCategories.length === 0
                  ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                  : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
              }`}
            >
              <span>All Categories</span>
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryToggle(cat.id)}
                  className={`px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-apple hover:bg-primary-700 hover:shadow-apple-lg'
                      : 'bg-warm-gray-100 text-warm-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-warm-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentExpenseFilters;
