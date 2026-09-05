import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Stethoscope,
  Pill,
  Clock,
  ShieldAlert,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Compass,
  Phone,
  Navigation,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { HealthEntity, HealthEntityType } from '../types';
import { COMMUNES, SPECIALTIES } from '../data/mockData';
import {
  AdvancedFilterState,
  getAvailableNeighborhoods,
  getActiveFiltersCount,
  HEALTH_SERVICE_TYPES
} from '../utils/filterUtils';

interface AdvancedFilterBarProps {
  filters: AdvancedFilterState;
  onFilterChange: (filters: AdvancedFilterState) => void;
  onResetFilters: () => void;
  entities: HealthEntity[];
  resultCount?: number;
  totalCount?: number;

  // Customization flags per view
  hideTypeFilter?: boolean;
  hideSpecialtyFilter?: boolean;
  hideGardeToggle?: boolean;
  hideEmergencyToggle?: boolean;
  searchPlaceholder?: string;
  title?: string;
  subtitle?: string;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  entities,
  resultCount,
  totalCount = entities.length,
  hideTypeFilter = false,
  hideSpecialtyFilter = false,
  hideGardeToggle = false,
  hideEmergencyToggle = false,
  searchPlaceholder = 'ابحث بالاسم، التخصص، الحي، أو العنوان...',
  title,
  subtitle,
}) => {
  // Mobile / Desktop Expandable advanced panel state
  const [isExpanded, setIsExpanded] = useState(false);

  // Available neighborhoods based on current commune
  const availableNeighborhoods = useMemo(() => {
    return getAvailableNeighborhoods(entities, filters.commune);
  }, [entities, filters.commune]);

  // Active filters count
  const activeCount = useMemo(() => {
    return getActiveFiltersCount(filters);
  }, [filters]);

  // Commune facility count calculation
  const communeCounts = useMemo(() => {
    const counts: Record<string, number> = { 'الكل': entities.length };
    COMMUNES.forEach(c => {
      if (c !== 'الكل') {
        counts[c] = entities.filter(e => e.commune === c).length;
      }
    });
    return counts;
  }, [entities]);

  // Popular communes list for quick pills
  const popularCommunes = useMemo(() => {
    return ['الكل', 'الوادي', 'قمار', 'البياضة', 'المقرن', 'الرباح', 'الدبيلة', 'الرقيبة', 'حاسي خليفة'];
  }, []);

  // Update a single filter field helper
  const updateField = <K extends keyof AdvancedFilterState>(field: K, value: AdvancedFilterState[K]) => {
    const updated = { ...filters, [field]: value };
    // If commune changed, reset neighborhood if it is no longer relevant
    if (field === 'commune' && value !== 'الكل' && filters.neighborhood !== 'الكل') {
      const validInNewCommune = getAvailableNeighborhoods(entities, value as string).includes(filters.neighborhood);
      if (!validInNewCommune) {
        updated.neighborhood = 'الكل';
      }
    }
    onFilterChange(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4 font-['Tajawal'] dir-rtl transition-all">

      {/* Optional Custom Header Banner if title provided */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {resultCount !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                {resultCount} من أصل {totalCount} منشأة
              </span>
            </div>
          )}
        </div>
      )}

      {/* Row 1: Primary Search Input & Key Selects & Advanced Filter Button */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">

        {/* Search Input Box */}
        <div className={`relative ${hideTypeFilter ? 'sm:col-span-6' : 'sm:col-span-5'}`}>
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="filter-search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => updateField('searchQuery', e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pr-10 pl-9 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateField('searchQuery', '')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* City / Municipality (البلدية / المدينة) Filter */}
        <div className="sm:col-span-3">
          <div className="relative">
            <select
              id="filter-commune-select"
              value={filters.commune}
              onChange={(e) => updateField('commune', e.target.value)}
              className="w-full py-2.5 pr-8 pl-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none transition-all"
            >
              {COMMUNES.map(c => {
                const count = communeCounts[c] || 0;
                return (
                  <option key={c} value={c}>
                    {c === 'الكل' ? `🏛️ جميع البلديات (${totalCount})` : `📍 بلدية ${c} (${count})`}
                  </option>
                );
              })}
            </select>
            <MapPin className="w-4 h-4 text-blue-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Neighborhood / District Filter (الحي / المنطقة) */}
        <div className={`relative ${hideTypeFilter ? 'sm:col-span-3' : 'sm:col-span-2'}`}>
          <select
            id="filter-neighborhood-select"
            value={filters.neighborhood}
            onChange={(e) => updateField('neighborhood', e.target.value)}
            className="w-full py-2.5 pr-7 pl-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none transition-all"
          >
            <option value="الكل">🏘️ جميع الأحياء والمناطق</option>
            {availableNeighborhoods.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Building2 className="w-3.5 h-3.5 text-amber-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Health Service Type (if not hidden) */}
        {!hideTypeFilter && (
          <div className="sm:col-span-2 relative">
            <select
              id="filter-type-select"
              value={filters.type}
              onChange={(e) => updateField('type', e.target.value)}
              className="w-full py-2.5 pr-7 pl-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer appearance-none transition-all"
            >
              <option value="الكل">🏥 كل المنشآت</option>
              <option value="صيدلية">💊 صيدليات</option>
              <option value="طبيب">🩺 عيادات أطباء</option>
              <option value="مستشفى">🏥 مستشفيات عمومية</option>
              <option value="عيادة">🏢 عيادات متخصصة</option>
            </select>
            <Stethoscope className="w-3.5 h-3.5 text-indigo-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Toggle Advanced Button */}
        <div className="sm:col-span-12 md:col-span-auto flex items-center gap-2">
          <button
            id="filter-toggle-advanced-btn"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all whitespace-nowrap ${
              isExpanded || activeCount > 0
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تصفية متقدمة</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                {activeCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Row 2: Quick Communes Horizontal Scrolling Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100 scrollbar-none">
        <span className="text-slate-400 shrink-0 font-bold flex items-center gap-1 text-[11px]">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>البلدية:</span>
        </span>
        {popularCommunes.map(c => {
          const isSelected = filters.commune === c;
          const count = communeCounts[c] || 0;
          return (
            <button
              key={c}
              onClick={() => updateField('commune', c)}
              className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap text-xs flex items-center gap-1 font-bold ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{c}</span>
              {c !== 'الكل' && count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Expandable Advanced Filtering Drawer / Panel */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-200/90 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-slate-50/70 p-4 rounded-xl border">

          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/70 pb-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>خيارات التصفية والتصنيف المتقدمة</span>
            </div>
            {activeCount > 0 && (
              <button
                onClick={onResetFilters}
                className="text-red-600 hover:text-red-700 flex items-center gap-1 font-bold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط الفلاتر ({activeCount})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Specialty / Medical Service Filter */}
            {!hideSpecialtyFilter && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  التخصص الطبي أو نوع الخدمة
                </label>
                <select
                  id="filter-specialty-select"
                  value={filters.specialty}
                  onChange={(e) => updateField('specialty', e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {SPECIALTIES.map(s => (
                    <option key={s} value={s}>
                      {s === 'الكل' ? 'جميع التخصصات الطبية' : `🩺 ${s}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Neighborhood / District Deep Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                تحديد الحي أو الشارع في {filters.commune === 'الكل' ? 'الولاية' : `بلدية ${filters.commune}`}
              </label>
              <select
                id="filter-neighborhood-deep-select"
                value={filters.neighborhood}
                onChange={(e) => updateField('neighborhood', e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="الكل">كل أحياء {filters.commune === 'الكل' ? 'الولاية' : filters.commune}</option>
                {availableNeighborhoods.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                ترتيب النتائج حسب
              </label>
              <select
                id="filter-sortby-select"
                value={filters.sortBy}
                onChange={(e) => updateField('sortBy', e.target.value as any)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="name">أبجدياً بالاسم (أ - ي)</option>
                <option value="commune">حسب البلدية</option>
                <option value="neighborhood">حسب العنوان والحي</option>
              </select>
            </div>

            {/* Quick Status Checkboxes */}
            <div className="sm:col-span-2 lg:col-span-4 pt-1">
              <span className="block text-[11px] font-bold text-slate-600 mb-2">
                محددات وخدمات إضافية سريعة:
              </span>
              <div className="flex flex-wrap gap-2">

                {/* On-Duty Toggle */}
                {!hideGardeToggle && (
                  <button
                    type="button"
                    onClick={() => updateField('onlyOnDuty', !filters.onlyOnDuty)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      filters.onlyOnDuty
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>صيدليات المناوبة فقط</span>
                  </button>
                )}

                {/* Emergency 24/24 Toggle */}
                {!hideEmergencyToggle && (
                  <button
                    type="button"
                    onClick={() => updateField('onlyEmergency', !filters.onlyEmergency)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      filters.onlyEmergency
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>استعجالات 24/24</span>
                  </button>
                )}

                {/* With GPS Toggle */}
                <button
                  type="button"
                  onClick={() => updateField('onlyWithGps', !filters.onlyWithGps)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    filters.onlyWithGps
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>موقع GPS محدد على الخريطة</span>
                </button>

                {/* With Phone Toggle */}
                <button
                  type="button"
                  onClick={() => updateField('onlyWithPhone', !filters.onlyWithPhone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    filters.onlyWithPhone
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>تتوفر على هاتف للتواصل</span>
                </button>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Row 3: Active Filters Tags Bar with 1-Click Clear */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>الفلاتر النشطة ({activeCount}):</span>
          </span>

          {/* Search tag */}
          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200">
              <span>بحث: "{filters.searchQuery}"</span>
              <button onClick={() => updateField('searchQuery', '')} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Commune tag */}
          {filters.commune !== 'الكل' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
              <span>بلدية: {filters.commune}</span>
              <button onClick={() => updateField('commune', 'الكل')} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Neighborhood tag */}
          {filters.neighborhood !== 'الكل' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold border border-amber-200">
              <span>حي: {filters.neighborhood}</span>
              <button onClick={() => updateField('neighborhood', 'الكل')} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Type tag */}
          {filters.type !== 'الكل' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              <span>النوع: {filters.type}</span>
              <button onClick={() => updateField('type', 'الكل')} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Specialty tag */}
          {filters.specialty !== 'الكل' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
              <span>التخصص: {filters.specialty}</span>
              <button onClick={() => updateField('specialty', 'الكل')} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Garde tag */}
          {filters.onlyOnDuty && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              <span>مناوبة اليوم فقط</span>
              <button onClick={() => updateField('onlyOnDuty', false)} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Emergency tag */}
          {filters.onlyEmergency && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 font-bold border border-red-200">
              <span>استعجالات 24/24</span>
              <button onClick={() => updateField('onlyEmergency', false)} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* GPS tag */}
          {filters.onlyWithGps && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-bold border border-cyan-200">
              <span>مزود بموقع GPS</span>
              <button onClick={() => updateField('onlyWithGps', false)} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Phone tag */}
          {filters.onlyWithPhone && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold border border-teal-200">
              <span>يتوفر على هاتف</span>
              <button onClick={() => updateField('onlyWithPhone', false)} className="hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Clear all button */}
          <button
            onClick={onResetFilters}
            className="text-red-600 hover:text-red-800 font-extrabold mr-auto hover:underline px-2 py-0.5"
          >
            مسح الكل
          </button>
        </div>
      )}

    </div>
  );
};
