import React, { useState, useMemo } from 'react';
import { Building2, Search, MapPin, ShieldAlert, Filter, Activity, Plus } from 'lucide-react';
import { HealthEntity } from '../types';
import { COMMUNES } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';

interface HospitalsViewProps {
  facilities: HealthEntity[];
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({ facilities, onOpenAddModal, onViewOnMap }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('الكل');
  const [selectedCommune, setSelectedCommune] = useState('الكل');
  const [onlyEmergency, setOnlyEmergency] = useState(false);

  const filteredFacilities = useMemo(() => {
    return facilities.filter(item => {
      // Type
      const matchType = selectedType === 'الكل' || item.type === selectedType;

      // Commune
      const matchCommune = selectedCommune === 'الكل' || item.commune === selectedCommune;

      // Emergency 24/24
      if (onlyEmergency && !item.isEmergency) return false;

      // Search query
      const matchQuery = 
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchType && matchCommune && matchQuery;
    });
  }, [facilities, selectedType, selectedCommune, onlyEmergency, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                المستشفيات والعيادات الصحية بولاية الوادي
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                دليل المؤسسات العمومية الاستشفائية، العيادات متعددة الخدمات ومصالح الاستعجالات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="hospitals-add-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مرفق / مستشفى</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
              {filteredFacilities.length} مرفق صحي
            </span>
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث باسم المستشفى أو العيادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800"
            />
          </div>

          {/* Type */}
          <div className="sm:col-span-3">
            <select
              id="hospitals-type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer text-slate-800"
            >
              <option value="الكل">جميع المرافق</option>
              <option value="مستشفى">مستشفيات عمومية</option>
              <option value="عيادة">عيادات متعددة الخدمات وخاصة</option>
            </select>
          </div>

          {/* Commune */}
          <div className="sm:col-span-4">
            <select
              id="hospitals-commune-filter"
              value={selectedCommune}
              onChange={(e) => setSelectedCommune(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer text-slate-800"
            >
              {COMMUNES.map(c => (
                <option key={c} value={c}>
                  {c === 'الكل' ? 'جميع البلديات' : `بلدية ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <button
            id="filter-emergency-toggle"
            onClick={() => setOnlyEmergency(!onlyEmergency)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
              onlyEmergency
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>عرض مصالح الاستعجالات والمداومة 24/24 فقط</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>استعجالات مستشفى 8 ماي 1945 ومستشفى الشط تعمل على مدار الساعة</span>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {filteredFacilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map(facility => (
            <DirectoryCard
              key={facility.id}
              item={facility}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد مرافق صحية مطابقة للبحث</h3>
          <p className="text-xs text-slate-500">جرب تغيير البلدية أو إلغاء فلاتر التصفية.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('الكل');
              setSelectedCommune('الكل');
              setOnlyEmergency(false);
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
