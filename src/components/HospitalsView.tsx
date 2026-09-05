import React, { useState, useMemo } from 'react';
import { Building2, Plus, ShieldAlert, Activity } from 'lucide-react';
import { HealthEntity } from '../types';
import { DirectoryCard } from './DirectoryCard';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { AdvancedFilterState, INITIAL_FILTER_STATE, filterEntities } from '../utils/filterUtils';

interface HospitalsViewProps {
  facilities: HealthEntity[];
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
  onShare?: (entity: HealthEntity) => void;
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({ facilities, onOpenAddModal, onViewOnMap, onShare }) => {
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTER_STATE);

  const filteredFacilities = useMemo(() => {
    return filterEntities(facilities, filters, {
      // Allow only hospital and clinic types by default if no specific type chosen
    }).filter(item => {
      if (filters.type === 'الكل') {
        return item.type === 'مستشفى' || item.type === 'عيادة';
      }
      return item.type === filters.type;
    });
  }, [facilities, filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                المستشفيات والعيادات الصحية بولاية الوادي
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                دليل المؤسسات العمومية الاستشفائية، العيادات متعددة الخدمات ومصالح الاستعجالات 24/24
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="hospitals-add-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مرفق / مستشفى</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl shrink-0">
              {filteredFacilities.length} مرفق صحي
            </span>
          </div>
        </div>

        {/* Advanced Filter Component */}
        <AdvancedFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          entities={facilities}
          resultCount={filteredFacilities.length}
          totalCount={facilities.length}
          hideSpecialtyFilter={true}
          hideGardeToggle={true}
          searchPlaceholder="ابحث باسم المستشفى أو العيادة، الحي، أو الشارع..."
        />
      </div>

      {/* Facilities Grid */}
      {filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map(facility => (
            <DirectoryCard
              key={facility.id}
              item={facility}
              onViewOnMap={onViewOnMap}
              onShare={onShare}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد مرافق صحية مطابقة لمعايير البحث</h3>
          <p className="text-xs text-slate-500">جرب تغيير البلدية أو الحي أو إلغاء فلاتر الاستعجالات المحددة.</p>
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
