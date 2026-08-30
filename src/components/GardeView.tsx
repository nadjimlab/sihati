import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  MapPin, 
  Info,
  CalendarDays,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { HealthEntity } from '../types';
import { COMMUNES, ARABIC_DAYS } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';

interface GardeViewProps {
  pharmacies: HealthEntity[];
  onViewOnMap?: (entity: HealthEntity) => void;
}

export const GardeView: React.FC<GardeViewProps> = ({ pharmacies, onViewOnMap }) => {
  const [selectedCommune, setSelectedCommune] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  // 0 = today, 1 = tomorrow, 2 = day after tomorrow, etc.
  const [dateOffset, setDateOffset] = useState<number>(0);

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset);
    return d;
  }, [dateOffset]);

  const dayOfWeekIndex = selectedDate.getDay();
  const dayName = ARABIC_DAYS[dayOfWeekIndex];
  const dateFormatted = selectedDate.toLocaleDateString('ar-DZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const isToday = dateOffset === 0;

  // Filter pharmacies on duty for the selected date/day
  const onDutyPharmacies = useMemo(() => {
    const formattedYMD = selectedDate.toISOString().split('T')[0];

    return pharmacies.filter(pharmacy => {
      // Check if on-duty on this day of week or specific date
      const matchDay = pharmacy.garde_days?.includes(dayOfWeekIndex);
      const matchSpecificDate = pharmacy.garde_dates && pharmacy.garde_dates.includes(formattedYMD);
      const isOnDutyOnDate = Boolean(matchDay || matchSpecificDate);

      if (!isOnDutyOnDate) return false;

      // Filter by commune
      const matchCommune = selectedCommune === 'الكل' || pharmacy.commune === selectedCommune;

      // Filter by query
      const matchQuery = !searchQuery.trim() || 
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCommune && matchQuery;
    });
  }, [pharmacies, dayOfWeekIndex, selectedDate, selectedCommune, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  الصيدليات المناوبة (Pharmacies de Garde)
                </h1>
                {isToday && (
                  <span className="text-[11px] font-bold bg-emerald-500 text-slate-900 px-2 py-0.5 rounded-md">
                    مباشر اليوم
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                جدول المناوبة الليلية وعطل نهاية الأسبوع عبر بلديات ولاية الوادي
              </p>
            </div>
          </div>

          <div className="text-xs bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 font-medium text-slate-200">
            <span>التاريخ المحدد: </span>
            <strong className="text-emerald-400">{dayName}</strong> ({dateFormatted})
          </div>
        </div>

        {/* Date Selector Pills */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <button
            id="garde-btn-today"
            onClick={() => setDateOffset(0)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isToday 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            اليوم ({ARABIC_DAYS[new Date().getDay()]})
          </button>
          
          <button
            id="garde-btn-tomorrow"
            onClick={() => setDateOffset(1)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateOffset === 1
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            غداً ({ARABIC_DAYS[(new Date().getDay() + 1) % 7]})
          </button>

          <button
            id="garde-btn-after-tomorrow"
            onClick={() => setDateOffset(2)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dateOffset === 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            بعد غد ({ARABIC_DAYS[(new Date().getDay() + 2) % 7]})
          </button>

          {/* Quick next/prev offset */}
          <div className="mr-auto flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setDateOffset(prev => Math.max(0, prev - 1))}
              disabled={dateOffset <= 0}
              className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-30"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs px-2 text-slate-300 font-mono">+{dateOffset} يوم</span>
            <button
              onClick={() => setDateOffset(prev => prev + 1)}
              className="p-1 rounded text-slate-300 hover:text-white"
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              صيدليات مناوبة ليوم {dayName} ({onDutyPharmacies.length} صيدلية متوفرة)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الحي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Commune Filter */}
            <select
              id="garde-commune-select"
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer"
            >
              {COMMUNES.map(c => (
                <option key={c} value={c}>
                  {c === 'الكل' ? 'جميع البلديات' : `بلدية ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notice on shifts in El Oued */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">ملاحظة تنظيمية: </span>
            تبدأ المناوبة الليلية من الساعة <strong>20:00 ليلاً حتى 08:00 صباحاً</strong>، بينما تبدأ مناوبة العطل والأعياد من <strong>08:00 صباحاً حتى 20:00 مساءً</strong> وفق تنظيم نقابة الصيادلة الخواص لولاية الوادي.
          </div>
        </div>
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
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد صيدليات مناوبة مسجلة في هذا النطاق</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يرجى اختيار بلدية أخرى أو تغيير تاريخ البحث للاطلاع على الصيدليات المناوبة.
          </p>
          <button
            onClick={() => {
              setSelectedCommune('الكل');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}
    </div>
  );
};
