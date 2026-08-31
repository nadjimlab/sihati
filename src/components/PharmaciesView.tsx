import React, { useState, useMemo } from 'react';
import { Pill, Plus } from 'lucide-react';
import { HealthEntity } from '../types';
import { DirectoryCard } from './DirectoryCard';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { AdvancedFilterState, INITIAL_FILTER_STATE, filterEntities } from '../utils/filterUtils';

interface PharmaciesViewProps {
  pharmacies: HealthEntity[];
  todayOnDutyIds: string[];
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
  onSuggestEdit?: (entity: HealthEntity) => void;
}

export const PharmaciesView: React.FC<PharmaciesViewProps> = ({
  pharmacies,
  todayOnDutyIds,
  onOpenAddModal,
  onViewOnMap,
  onSuggestEdit,
}) => {
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTER_STATE);

  const filteredPharmacies = useMemo(() => {
    return filterEntities(pharmacies, filters, {
      todayOnDutyIds,
      enforceType: 'صيدلية',
    });
  }, [pharmacies, filters, todayOnDutyIds]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-xs">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                صيدليات ولاية الوادي
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                دليل الصيدليات المعتمدة وعناوينها، أوقات العمل وجداول المناوبة الليلية والنهارية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="pharmacies-add-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صيدلية</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl shrink-0">
              {filteredPharmacies.length} صيدلية معروضة
            </span>
          </div>
        </div>

        {/* Advanced Filter Component */}
        <AdvancedFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          entities={pharmacies}
          resultCount={filteredPharmacies.length}
          totalCount={pharmacies.length}
          hideTypeFilter={true}
          hideSpecialtyFilter={true}
          searchPlaceholder="ابحث باسم الصيدلية، اسم الدكتور، الحي، أو الشارع..."
        />
      </div>

      {/* Grid results */}
      {filteredPharmacies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPharmacies.map(pharmacy => (
            <DirectoryCard
              key={pharmacy.id}
              item={pharmacy}
              isOnDuty={todayOnDutyIds.includes(pharmacy.id)}
              onViewOnMap={onViewOnMap}
              onSuggestEdit={onSuggestEdit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد صيدليات مطابقة لمعايير البحث</h3>
          <p className="text-xs text-slate-500">جرب توسيع نطاق البحث باختيار "جميع البلديات" أو إزالة الفلاتر المحددة.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            إعادة تعيين جميع الفلاتر
          </button>
        </div>
      )}
    </div>
  );
};
