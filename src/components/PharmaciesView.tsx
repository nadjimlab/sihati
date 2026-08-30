import React, { useState, useMemo } from 'react';
import { Pill, Search, MapPin, Clock, Filter, CheckCircle2, Plus } from 'lucide-react';
import { HealthEntity } from '../types';
import { COMMUNES } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';

interface PharmaciesViewProps {
  pharmacies: HealthEntity[];
  todayOnDutyIds: string[];
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
}

export const PharmaciesView: React.FC<PharmaciesViewProps> = ({
  pharmacies,
  todayOnDutyIds,
  onOpenAddModal,
  onViewOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('الكل');
  const [onlyOnDuty, setOnlyOnDuty] = useState(false);

  const filteredPharmacies = useMemo(() => {
    return pharmacies.filter(pharmacy => {
      // Commune filter
      const matchCommune = selectedCommune === 'الكل' || pharmacy.commune === selectedCommune;

      // On-duty filter
      const isOnDutyToday = todayOnDutyIds.includes(pharmacy.id);
      if (onlyOnDuty && !isOnDutyToday) return false;

      // Search query
      const matchQuery = 
        !searchQuery.trim() ||
        pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pharmacy.notes && pharmacy.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCommune && matchQuery;
    });
  }, [pharmacies, selectedCommune, onlyOnDuty, searchQuery, todayOnDutyIds]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                صيدليات ولاية الوادي
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                دليل الصيدليات المعتمدة وعناوينها وأرقام هواتفها عبر مختلف البلديات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="pharmacies-add-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صيدلية</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              {filteredPharmacies.length} صيدلية معروضة
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث باسم الصيدلية أو العنوان..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Commune Select */}
          <div className="sm:col-span-3">
            <select
              id="pharmacy-commune-filter"
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer font-medium text-slate-800"
            >
              {COMMUNES.map(c => (
                <option key={c} value={c}>
                  {c === 'الكل' ? 'جميع البلديات' : `بلدية ${c}`}
                </option>
              ))}
            </select>
          </div>

          {/* On-Duty Only Toggle */}
          <div className="sm:col-span-3">
            <button
              id="filter-only-garde-toggle"
              onClick={() => setOnlyOnDuty(!onlyOnDuty)}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                onlyOnDuty
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyOnDuty ? 'bg-white' : 'bg-emerald-600'}`}></span>
              <span>مناوبة اليوم فقط ({todayOnDutyIds.length})</span>
            </button>
          </div>
        </div>

        {/* Quick Commune Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100 scrollbar-none">
          <span className="text-slate-400 shrink-0 font-medium">البلدية:</span>
          {COMMUNES.slice(0, 10).map(c => (
            <button
              key={c}
              onClick={() => setSelectedCommune(c)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedCommune === c
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
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
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد صيدليات مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو اختر "جميع البلديات".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCommune('الكل');
              setOnlyOnDuty(false);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}
    </div>
  );
};
