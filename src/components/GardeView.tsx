import React, { useState, useMemo } from 'react';
import {
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { HealthEntity } from '../types';
import { ARABIC_DAYS } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { NotificationModal } from './NotificationModal';
import { AdvancedFilterState, INITIAL_FILTER_STATE, filterEntities } from '../utils/filterUtils';
import {
  isNotificationSupported,
  isGardeNotificationEnabled,
  setGardeNotificationPref,
} from '../utils/notificationManager';

interface GardeViewProps {
  pharmacies: HealthEntity[];
  onViewOnMap?: (entity: HealthEntity) => void;
  onShare?: (entity: HealthEntity) => void;
}

export const GardeView: React.FC<GardeViewProps> = ({ pharmacies, onViewOnMap, onShare }) => {
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTER_STATE);

  // Custom selected date in YYYY-MM-DD or null (defaults to today)
  const [customDateStr, setCustomDateStr] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => isGardeNotificationEnabled());
  const [notifSuccessMessage, setNotifSuccessMessage] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  const selectedDate = useMemo(() => {
    if (!customDateStr) return new Date();
    const [y, m, d] = customDateStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  }, [customDateStr]);

  const dayOfWeekIndex = selectedDate.getDay();
  const dayName = ARABIC_DAYS[dayOfWeekIndex];
  const dateFormatted = selectedDate.toLocaleDateString('ar-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const isToday = customDateStr === todayStr;

  const handleStepDay = (step: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + step);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setCustomDateStr(`${year}-${month}-${day}`);
  };

  const handleSetToday = () => {
    setCustomDateStr(todayStr);
  };

  // Base list of pharmacies on duty for this specific date/day
  const dateSpecificOnDutyPharmacies = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedYMD = `${year}-${month}-${day}`;

    return pharmacies.filter(pharmacy => {
      const matchDay = pharmacy.garde_days?.includes(dayOfWeekIndex);
      const matchSpecificDate = pharmacy.garde_dates && pharmacy.garde_dates.includes(formattedYMD);
      return Boolean(matchDay || matchSpecificDate);
    });
  }, [pharmacies, dayOfWeekIndex, selectedDate]);

  // Apply advanced filters (commune, neighborhood, query, etc.)
  const onDutyPharmacies = useMemo(() => {
    return filterEntities(dateSpecificOnDutyPharmacies, filters, {
      enforceType: 'صيدلية',
    });
  }, [dateSpecificOnDutyPharmacies, filters]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  const handleToggleNotifications = () => {
    setIsNotificationModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-2xl shadow-xs shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  الصيدليات المناوبة
                </h1>
                <span dir="ltr" className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  Pharmacies de Garde
                </span>
                {isToday && (
                  <span className="text-[11px] font-extrabold bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                    مباشر اليوم
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                جدول المناوبة الليلية وعطل نهاية الأسبوع عبر بلديات وأحياء ولاية الوادي
              </p>
            </div>
          </div>

          <div className="text-xs bg-slate-800/80 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-slate-700 font-medium text-slate-200 shadow-xs">
            <span>التاريخ المحدد: </span>
            <strong className="text-emerald-400 font-bold">{dayName}</strong> ({dateFormatted})
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="garde-btn-today"
              onClick={handleSetToday}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isToday
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              اليوم ({ARABIC_DAYS[new Date().getDay()]})
            </button>

            {/* Direct date picker */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                id="garde-custom-date-picker"
                type="date"
                value={customDateStr}
                onChange={(e) => {
                  if (e.target.value) {
                    setCustomDateStr(e.target.value);
                  }
                }}
                className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer"
                title="اختر تاريخاً محددًا للمناوبة"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Optional Notification Bell Toggle */}
            <button
              id="garde-notification-toggle-btn"
              onClick={handleToggleNotifications}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs active:scale-95 ${
                notificationsEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 hover:bg-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={notificationsEnabled ? 'التنبيهات مفعلة عند تغيير المناوبة' : 'تفعيل إشعارات تغيير صيدليات المناوبة'}
            >
              {notificationsEnabled ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  <span>تنبيهات المناوبة مفعّلة</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-slate-400" />
                  <span>تفعيل تنبيهات المناوبة</span>
                </>
              )}
            </button>

            {/* Quick next/prev offset */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                id="garde-btn-prev-day"
                onClick={() => handleStepDay(-1)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="اليوم السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs px-2 text-slate-300 font-mono">اليوم المحدد</span>
              <button
                id="garde-btn-next-day"
                onClick={() => handleStepDay(1)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
                title="اليوم التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast/Feedback if triggered */}
      {notifSuccessMessage && (
        <div className="bg-emerald-900/90 border border-emerald-500/50 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md animate-in fade-in duration-200 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="font-medium">{notifSuccessMessage}</span>
        </div>
      )}

      {/* Filter and Search Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Notice on shifts in El Oued */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">ملاحظة تنظيمية: </span>
            تبدأ المناوبة الليلية من الساعة <strong>20:00 ليلاً حتى 08:00 صباحاً</strong>، بينما تبدأ مناوبة العطل والأعياد من <strong>08:00 صباحاً حتى 20:00 مساءً</strong> وفق تنظيم نقابة الصيادلة الخواص لولاية الوادي.
          </div>
        </div>

        {/* Advanced Filter Bar */}
        <AdvancedFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          entities={dateSpecificOnDutyPharmacies}
          resultCount={onDutyPharmacies.length}
          totalCount={dateSpecificOnDutyPharmacies.length}
          hideTypeFilter={true}
          hideSpecialtyFilter={true}
          hideGardeToggle={true}
          hideEmergencyToggle={true}
          searchPlaceholder="ابحث باسم الصيدلية المناوبة، الحي، أو الشارع..."
        />
      </div>

      {/* Pharmacies Grid */}
      {onDutyPharmacies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onDutyPharmacies.map(item => (
            <DirectoryCard
              key={item.id}
              item={item}
              isOnDuty={true}
              onViewOnMap={onViewOnMap}
              onShare={onShare}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد صيدليات مناوبة مسجلة في هذا النطاق</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يرجى اختيار بلدية أو حي آخر أو تغيير تاريخ البحث للاطلاع على الصيدليات المناوبة.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            إعادة ضبط جميع الفلاتر
          </button>
        </div>
      )}
      {/* Notification Configuration and Guide Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setNotificationsEnabled(isGardeNotificationEnabled());
        }}
        onStateChange={(enabled) => {
          setNotificationsEnabled(enabled);
        }}
      />
    </div>
  );
};

