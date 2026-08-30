import React, { useState, useMemo } from 'react';
import { Stethoscope, Plus } from 'lucide-react';
import { HealthEntity } from '../types';
import { DirectoryCard } from './DirectoryCard';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { AdvancedFilterState, INITIAL_FILTER_STATE, filterEntities } from '../utils/filterUtils';

interface DoctorsViewProps {
  doctors: HealthEntity[];
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({ doctors, onOpenAddModal, onViewOnMap }) => {
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTER_STATE);

  const filteredDoctors = useMemo(() => {
    return filterEntities(doctors, filters, {
      enforceType: 'طبيب',
    });
  }, [doctors, filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                دليل الأطباء والعيادات التخصصية
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                فهرس الأطباء الأخصائيين والعيادات الخاصة، العناوين، الأحياء وأرقام الحجز المباشر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="doctors-add-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طبيب</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl shrink-0">
              {filteredDoctors.length} طبيب معروض
            </span>
          </div>
        </div>

        {/* Advanced Filter Component */}
        <AdvancedFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          entities={doctors}
          resultCount={filteredDoctors.length}
          totalCount={doctors.length}
          hideTypeFilter={true}
          hideGardeToggle={true}
          hideEmergencyToggle={true}
          searchPlaceholder="ابحث باسم الطبيب، التخصص الطبي (قلب، عيون، أطفال...)، الحي، أو الشارع..."
        />
      </div>

      {/* Grid of doctors */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map(doctor => (
            <DirectoryCard
              key={doctor.id}
              item={doctor}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لم يتم العثور على أطباء يطابقون خياراتك</h3>
          <p className="text-xs text-slate-500">جرب اختيار تخصص طبي مختلف أو تحديد "جميع البلديات" و"جميع الأحياء".</p>
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
