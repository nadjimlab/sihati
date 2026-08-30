import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Clock, 
  Pill, 
  Stethoscope, 
  Building2, 
  ArrowLeft, 
  MapPin, 
  ShieldAlert, 
  Sparkles,
  PhoneCall,
  CheckCircle2,
  CalendarDays,
  Activity
} from 'lucide-react';
import { HealthEntity, ActiveTab } from '../types';
import { COMMUNES, ARABIC_DAYS } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';
import { Plus } from 'lucide-react';

interface HomeViewProps {
  entities: HealthEntity[];
  todayOnDutyPharmacies: HealthEntity[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenEmergencyModal: () => void;
  onOpenAddModal?: () => void;
  onViewOnMap?: (entity: HealthEntity) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  entities,
  todayOnDutyPharmacies,
  setActiveTab,
  onOpenEmergencyModal,
  onOpenAddModal,
  onViewOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('الكل');
  const [selectedType, setSelectedType] = useState<string>('الكل');

  const todayDayIndex = new Date().getDay();
  const todayDayName = ARABIC_DAYS[todayDayIndex];

  // Stats calculation
  const pharmacyCount = useMemo(() => entities.filter(e => e.type === 'صيدلية').length, [entities]);
  const doctorCount = useMemo(() => entities.filter(e => e.type === 'طبيب').length, [entities]);
  const facilityCount = useMemo(() => entities.filter(e => e.type === 'مستشفى' || e.type === 'عيادة').length, [entities]);

  // Instant unified search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedCommune === 'الكل' && selectedType === 'الكل') {
      return [];
    }

    return entities.filter(item => {
      const matchQuery = 
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.specialty && item.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCommune = selectedCommune === 'الكل' || item.commune === selectedCommune;
      const matchType = selectedType === 'الكل' || item.type === selectedType;

      return matchQuery && matchCommune && matchType;
    });
  }, [entities, searchQuery, selectedCommune, selectedType]);

  const isFiltering = Boolean(searchQuery.trim() || selectedCommune !== 'الكل' || selectedType !== 'الكل');

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section with Integrated Search */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-blue-300 border border-slate-700">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>المنصة الموحدة للخدمات الصحية بولاية الوادي</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            دليلك الطبي الموثوق في ولاية الوادي
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            ابحث عن أقرب صيدلية، طبيب مختص، أو مستشفى بسهولة، مع متابعة لحظية لجدول الصيدليات المناوبة ليلاً ونهاراً.
          </p>

          {/* Unified Search Box */}
          <div className="pt-3">
            <div className="bg-white p-2.5 rounded-xl shadow-xl flex flex-col sm:flex-row gap-2 border border-slate-100">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="home-search-input"
                  type="text"
                  placeholder="ابحث بالاسم، التخصص، أو العنوان (مثال: منصوري، قلب، قمار...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-11 pl-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-slate-50 border border-slate-200"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    مسح
                  </button>
                )}
              </div>

              <div className="sm:w-44">
                <select
                  id="home-commune-select"
                  value={selectedCommune}
                  onChange={(e) => setSelectedCommune(e.target.value)}
                  className="w-full py-2.5 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c === 'الكل' ? 'جميع البلديات' : `بلدية ${c}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:w-36">
                <select
                  id="home-type-select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full py-2.5 px-3 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="الكل">كل التصنيفات</option>
                  <option value="صيدلية">صيدليات</option>
                  <option value="طبيب">أطباء وعيادات</option>
                  <option value="مستشفى">مستشفيات عمومية</option>
                  <option value="عيادة">عيادات متخصصة</option>
                </select>
              </div>
            </div>

            {/* Quick Tag Suggestion */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-300">
              <span className="text-slate-400">بحث سريع:</span>
              {['الوادي', 'قمار', 'البياضة', 'أمراض القلب', 'طب الأطفال', 'طب الأسنان'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (COMMUNES.includes(tag)) {
                      setSelectedCommune(tag);
                    } else {
                      setSearchQuery(tag);
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
              {isFiltering && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCommune('الكل');
                    setSelectedType('الكل');
                  }}
                  className="px-2.5 py-1 rounded-md bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 transition-colors font-bold"
                >
                  إلغاء التصفية
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Instant Search Results Panel (if user is searching) */}
      {isFiltering && (
        <section id="instant-search-section" className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">
                نتائج البحث ({searchResults.length} مرفق)
              </h2>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCommune('الكل');
                setSelectedType('الكل');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              مسح الفلتر
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((item) => (
                <DirectoryCard
                  key={item.id}
                  item={item}
                  isOnDuty={todayOnDutyPharmacies.some((p) => p.id === item.id)}
                  onViewOnMap={onViewOnMap}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-slate-600 font-medium">لم يتم العثور على نتائج تطابق معايير البحث.</p>
              <p className="text-xs text-slate-400">جرب تغيير اسم البلدية أو استخدام كلمات بحث مختلفة.</p>
            </div>
          )}
        </section>
      )}

      {/* Interactive Map Quick Access Banner */}
      <section className="bg-gradient-to-l from-blue-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/30 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white">الخريطة الطبية التفاعلية لولاية الوادي</h3>
              <span className="text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-md">
                جديد
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              استكشف مواقع الصيدليات، الأطباء والمستشفيات جغرافياً مع إمكانية تحديد موقعك الحالي وإيجاد أقرب نقطة صحية.
            </p>
          </div>
        </div>

        <button
          id="home-open-map-btn"
          onClick={() => setActiveTab('map')}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs"
        >
          <span>فتح الخريطة التفاعلية</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </section>

      {/* Main Categories Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              تصفح الأقسام الطبية
            </h2>
            <span className="text-xs text-slate-500">اختر القسم للبحث المفصل أو قم بإضافة منشأة صحية جديدة</span>
          </div>

          {onOpenAddModal && (
            <button
              id="home-open-add-modal-btn"
              onClick={onOpenAddModal}
              className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>إضافة طبيب / صيدلية / مرفق</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Garde */}
          <button
            id="home-btn-garde"
            onClick={() => setActiveTab('garde')}
            className="p-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between group relative overflow-hidden focus:outline-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-emerald-600/60 rounded-xl group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-100 bg-emerald-800/80 px-2.5 py-1 rounded-md border border-emerald-600">
                {todayOnDutyPharmacies.length} مناوبة اليوم
              </span>
            </div>

            <div className="mt-5 space-y-1">
              <h3 className="text-lg font-bold text-white">
                الصيدليات المناوبة (Garde)
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                جدول الصيدليات المداومة ليلاً وعطل نهاية الأسبوع في كافة البلديات.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-600/50 flex items-center justify-between text-xs font-bold text-emerald-100">
              <span>عرض جدول المناوبة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: All Pharmacies */}
          <button
            id="home-btn-pharmacies"
            onClick={() => setActiveTab('pharmacies')}
            className="p-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between group focus:outline-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Pill className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {pharmacyCount} صيدلية
              </span>
            </div>

            <div className="mt-5 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                دليل الصيدليات
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                عناوين وأرقام هواتف صيدليات الولاية مع تحديد أوقات العمل والموقع.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>تصفح الصيدليات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: Doctors */}
          <button
            id="home-btn-doctors"
            onClick={() => setActiveTab('doctors')}
            className="p-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between group focus:outline-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {doctorCount} طبيب مختص
              </span>
            </div>

            <div className="mt-5 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                الأطباء والعيادات
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                أطباء مختصون في أمراض القلب، العيون، الأطفال، النساء، والأسنان.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>تصفح الأطباء</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 4: Hospitals */}
          <button
            id="home-btn-hospitals"
            onClick={() => setActiveTab('hospitals')}
            className="p-5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 text-right flex flex-col justify-between group focus:outline-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {facilityCount} مرافق
              </span>
            </div>

            <div className="mt-5 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                المستشفيات والعيادات
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                المستشفيات العمومية ومصالح الاستعجالات الطبية 24/24 ساعة.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>تصفح المستشفيات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Highlighted Section: Today's On-Duty Pharmacies */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  الصيدليات المناوبة اليوم
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                  يوم {todayDayName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                الصيدليات المفتوحة للمداومة الليلية والنهارية في ولاية الوادي
              </p>
            </div>
          </div>

          <button
            id="view-all-garde-btn"
            onClick={() => setActiveTab('garde')}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>عرض كل مناوبات الأسبوع</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Today's On-Duty Pharmacies */}
        {todayOnDutyPharmacies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayOnDutyPharmacies.slice(0, 6).map((pharmacy) => (
              <DirectoryCard
                key={pharmacy.id}
                item={pharmacy}
                isOnDuty={true}
                onViewOnMap={onViewOnMap}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            لا توجد صيدليات مسجلة في المناوبة لهذا اليوم.
          </div>
        )}
      </section>

      {/* Emergency Strip Callout */}
      <section className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">هل تواجه حالة طوارئ طبية؟</h3>
            <p className="text-xs text-red-100 mt-0.5">
              اتصل مباشرة بالحماية المدنية على الرقم <strong>14</strong> أو الاستعجالات الطبية <strong>3030</strong>
            </p>
          </div>
        </div>

        <button
          id="home-emergency-btn"
          onClick={onOpenEmergencyModal}
          className="px-5 py-2.5 bg-white hover:bg-red-50 text-red-700 font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-2"
        >
          <PhoneCall className="w-4 h-4" />
          <span>عرض جميع أرقام النجدة</span>
        </button>
      </section>
    </div>
  );
};
