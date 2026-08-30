import React, { useState, useMemo } from 'react';
import { Stethoscope, Search, MapPin, Filter, User, Plus } from 'lucide-react';
import { HealthEntity } from '../types';
import { COMMUNES, SPECIALTIES } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';

interface DoctorsViewProps {
  doctors: HealthEntity[];
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({ doctors, onOpenAddModal, onViewOnMap }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('الكل');
  const [selectedCommune, setSelectedCommune] = useState('الكل');

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      // Specialty filter
      const matchSpecialty = selectedSpecialty === 'الكل' || doctor.specialty === selectedSpecialty;

      // Commune filter
      const matchCommune = selectedCommune === 'الكل' || doctor.commune === selectedCommune;

      // Search query
      const matchQuery = 
        !searchQuery.trim() ||
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.specialty && doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doctor.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doctor.notes && doctor.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSpecialty && matchCommune && matchQuery;
    });
  }, [doctors, selectedSpecialty, selectedCommune, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                دليل الأطباء والعيادات التخصصية
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                فهرس الأطباء الأخصائيين والعيادات الخاصة بولاية الوادي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="doctors-add-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طبيب</span>
              </button>
            )}
            <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shrink-0">
              {filteredDoctors.length} طبيب معروض
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          {/* Search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث باسم الطبيب أو التخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-800"
            />
          </div>

          {/* Specialty */}
          <div className="sm:col-span-4">
            <select
              id="doctors-specialty-filter"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full py-2.5 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium cursor-pointer text-slate-800"
            >
              {SPECIALTIES.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === 'الكل' ? 'جميع التخصصات الطبية' : specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Commune */}
          <div className="sm:col-span-4">
            <select
              id="doctors-commune-filter"
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

        {/* Quick Specialty Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100 scrollbar-none">
          <span className="text-slate-400 shrink-0 font-medium">تخصصات شائعة:</span>
          {['الكل', 'طب عام', 'أمراض القلب والشرايين', 'طب وجراحة العيون', 'طب وجراحة الأسنان', 'أمراض النساء والتوليد', 'طب الأطفال وحديثي الولادة'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                selectedSpecialty === s
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
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
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لم يتم العثور على أطباء يطابقون خياراتك</h3>
          <p className="text-xs text-slate-500">جرب اختيار تخصص مختلف أو تحديد "جميع البلديات".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('الكل');
              setSelectedCommune('الكل');
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
