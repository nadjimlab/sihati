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
  PhoneCall, 
  Activity,
  Plus,
  Navigation,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Compass,
  HeartHandshake
} from 'lucide-react';
import { HealthEntity, ActiveTab } from '../types';
import { ARABIC_DAYS, COMMUNES } from '../data/mockData';
import { DirectoryCard } from './DirectoryCard';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { AdvancedFilterState, INITIAL_FILTER_STATE, filterEntities, countActiveFilters } from '../utils/filterUtils';

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
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTER_STATE);

  const todayDayIndex = new Date().getDay();
  const todayDayName = ARABIC_DAYS[todayDayIndex];
  const todayOnDutyIds = useMemo(() => todayOnDutyPharmacies.map(p => p.id), [todayOnDutyPharmacies]);

  // Stats calculation
  const pharmacyCount = useMemo(() => entities.filter(e => e.type === 'صيدلية').length, [entities]);
  const doctorCount = useMemo(() => entities.filter(e => e.type === 'طبيب').length, [entities]);
  const facilityCount = useMemo(() => entities.filter(e => e.type === 'مستشفى' || e.type === 'عيادة').length, [entities]);
  const emergencyCount = useMemo(() => entities.filter(e => e.isEmergency).length, [entities]);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const isFiltering = activeFilterCount > 0;

  // Instant search & filter results
  const searchResults = useMemo(() => {
    if (!isFiltering) {
      return [];
    }
    return filterEntities(entities, filters, {
      todayOnDutyIds,
    });
  }, [entities, filters, isFiltering, todayOnDutyIds]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  const handleCommuneQuickFilter = (commune: string) => {
    setFilters(prev => ({
      ...prev,
      commune: prev.commune === commune ? 'الكل' : commune,
      neighborhood: 'الكل'
    }));
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Section with Professional Design & Mobile-First Quick Access */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xl border border-slate-800">
        {/* Subtle decorative glow elements */}
        <div className="absolute -top-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Top Status Badges Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-800/90 text-[11px] sm:text-xs font-bold text-blue-300 border border-slate-700 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>المنصة الصحية المعتمدة لولاية الوادي (39)</span>
            </div>

            {/* Quick Emergency Dial Pill for Phones */}
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-300 text-[11px] sm:text-xs font-bold">
              <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-bounce" />
              <span>طوارئ:</span>
              <a href="tel:14" className="hover:text-white underline font-black">14</a>
              <span className="text-red-600">•</span>
              <a href="tel:17" className="hover:text-white underline font-black">17</a>
              <span className="text-red-600">•</span>
              <a href="tel:1055" className="hover:text-white underline font-black">1055</a>
            </div>
          </div>

          {/* Main Title & Subtitle */}
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-snug sm:leading-tight">
              دليلك الطبي الشامل <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-teal-300">بولاية الوادي</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              جدول الصيدليات المناوبة ليلاً ونهاراً، أفضل الأطباء بمختلف التخصصات، والمستشفيات والعيادات مع خاصية المسار والاتجاهات.
            </p>
          </div>

          {/* Mobile-Optimized Quick Action & Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto pt-1">
            {/* Garde Card */}
            <div 
              id="home-hero-garde-btn"
              onClick={() => setActiveTab('garde')}
              className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all hover:scale-102 active:scale-95 text-right flex items-center gap-2.5 sm:gap-3 group shadow-xs"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-emerald-300/80 font-bold block truncate">صيدليات المناوبة</span>
                <span className="text-sm sm:text-base font-black text-emerald-300">{todayOnDutyPharmacies.length} مناوبة</span>
              </div>
            </div>

            {/* Pharmacies Card */}
            <div 
              id="home-hero-pharmacies-btn"
              onClick={() => setActiveTab('pharmacies')}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all hover:scale-102 active:scale-95 text-right flex items-center gap-2.5 sm:gap-3 group shadow-xs"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium block truncate">كل الصيدليات</span>
                <span className="text-sm sm:text-base font-black text-white">{pharmacyCount} صيدلية</span>
              </div>
            </div>

            {/* Doctors Card */}
            <div 
              id="home-hero-doctors-btn"
              onClick={() => setActiveTab('doctors')}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all hover:scale-102 active:scale-95 text-right flex items-center gap-2.5 sm:gap-3 group shadow-xs"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium block truncate">الأطباء والعيادات</span>
                <span className="text-sm sm:text-base font-black text-white">{doctorCount} طبيب</span>
              </div>
            </div>

            {/* Hospitals & Facilities Card */}
            <div 
              id="home-hero-hospitals-btn"
              onClick={() => setActiveTab('hospitals')}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all hover:scale-102 active:scale-95 text-right flex items-center gap-2.5 sm:gap-3 group shadow-xs"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium block truncate">المستشفيات 24/24</span>
                <span className="text-sm sm:text-base font-black text-white">{facilityCount} مرافق</span>
              </div>
            </div>
          </div>

          {/* Advanced Filter Component Container */}
          <div className="pt-1 sm:pt-2 text-right">
            <div className="bg-white/95 backdrop-blur-md p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/60">
              <AdvancedFilterBar
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
                entities={entities}
                resultCount={searchResults.length}
                totalCount={entities.length}
                searchPlaceholder="ابحث بالاسم، الطبيب، التخصص، البلدية، الحي، أو الشارع..."
              />
            </div>
          </div>

          {/* Quick Municipality Filter Tags (Horizontal swipeable on mobile) */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none pb-1 text-xs">
            <span className="text-slate-400 font-bold ml-1 shrink-0 text-[11px] sm:text-xs">البلديات:</span>
            {['الوادي', 'قمار', 'البياضة', 'المقرن', 'حاسي خليفة', 'الدبيلة', 'الرباح', 'كوينين', 'الرقيبة', 'جامعة', 'المغير', 'حاسـي عبد الله'].map((commune) => {
              const isSelected = filters.commune === commune;
              return (
                <button
                  key={commune}
                  onClick={() => handleCommuneQuickFilter(commune)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 active:scale-95 text-[11px] sm:text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs scale-105'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {commune}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Instant Search & Filter Results Panel (If Filtering) */}
      {isFiltering && (
        <section id="instant-search-section" className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  نتائج البحث المتقدم ({searchResults.length} مرفق مطابق)
                </h2>
                <span className="text-xs text-slate-500">تم تطبيق المعايير المحددة في شريط التصفية</span>
              </div>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all active:scale-95"
            >
              مسح جميع الفلاتر ({activeFilterCount})
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <p className="text-slate-800 font-extrabold text-base">لم نتمكن من العثور على نتائج تطابق هذا البحث</p>
                <p className="text-xs text-slate-500">
                  يرجى التأكد من كتابة الكلمات بشكل صحيح أو تجربة تغيير البلدية أو الحي المختار في الفلتر.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                إعادة ضبط جميع خيارات البحث
              </button>
            </div>
          )}
        </section>
      )}

      {/* 3. Core Platform Services Showcase (إبراز خدمات الموقع الرئيسية) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>خدمات المنصة الرئيسية</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              استكشف جميع الخدمات الصحية المتاحة
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              كل ما تحتاجه للوصول السريع إلى الرعاية الصحية في مكان واحد وبنقرة زر
            </p>
          </div>

          {onOpenAddModal && (
            <button
              id="home-open-add-modal-btn"
              onClick={onOpenAddModal}
              className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs active:scale-95 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>إضافة مرفق طبي جديد</span>
            </button>
          )}
        </div>

        {/* 4 Feature Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Service 1: Garde Pharmacies */}
          <div
            id="home-btn-garde"
            onClick={() => setActiveTab('garde')}
            className="p-6 rounded-3xl bg-gradient-to-b from-emerald-700 to-emerald-800 text-white shadow-md hover:shadow-xl transition-all duration-200 text-right flex flex-col justify-between group cursor-pointer border border-emerald-600 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/80 flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-black text-emerald-100 bg-emerald-900/80 px-3 py-1 rounded-xl border border-emerald-500/50">
                {todayOnDutyPharmacies.length} مناوبة اليوم
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-black text-white group-hover:text-emerald-200 transition-colors">
                الصيدليات المناوبة (Garde)
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed font-normal">
                جدول صيدليات المداومة الليلية والنهارية في جميع البلديات المحدث أسبوعياً بدقة.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-emerald-600/60 flex items-center justify-between text-xs font-extrabold text-emerald-100">
              <span>عرض جدول المناوبة الكامل</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Service 2: All Pharmacies */}
          <div
            id="home-btn-pharmacies"
            onClick={() => setActiveTab('pharmacies')}
            className="p-6 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-lg transition-all duration-200 text-right flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:scale-110">
                <Pill className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/80">
                {pharmacyCount} صيدلية
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                دليل الصيدليات الشامل
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                عناوين، أرقام هواتف، وأوقات عمل صيدليات الولاية مع إمكانية الاتصال المباشر والمسار.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-blue-600">
              <span>تصفح الصيدليات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Service 3: Doctors */}
          <div
            id="home-btn-doctors"
            onClick={() => setActiveTab('doctors')}
            className="p-6 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-lg transition-all duration-200 text-right flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-2xs group-hover:bg-teal-600 group-hover:text-white transition-all group-hover:scale-110">
                <Stethoscope className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/80">
                {doctorCount} طبيب مختص
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                الأطباء والعيادات الخاصة
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                أطباء مختصون في أمراض القلب، العيون، الأطفال، العظام، النساء والتوليد، وطب الأسنان.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-teal-600">
              <span>تصفح الأطباء والعيادات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Service 4: Hospitals & Facilities */}
          <div
            id="home-btn-hospitals"
            onClick={() => setActiveTab('hospitals')}
            className="p-6 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-purple-300 shadow-2xs hover:shadow-lg transition-all duration-200 text-right flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs group-hover:bg-purple-600 group-hover:text-white transition-all group-hover:scale-110">
                <Building2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200/80">
                {facilityCount} مرافق
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                المستشفيات والاستعجالات
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                المؤسسات العمومية الاستشفائية، العيادات متعددة الخدمات، ومصالح الاستعجالات 24/24 ساعة.
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-purple-600">
              <span>تصفح المرافق الصحية</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Map & GPS Routing Spotlight Banner */}
      <section className="bg-gradient-to-l from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 text-right">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl text-white shadow-lg shadow-blue-600/30 shrink-0">
            <Compass className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white">الخريطة التفاعلية وحساب المسار المباشر</h3>
              <span className="text-[11px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-lg">
                GPS مدمج
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              حدد موقعك الجغرافي واستكشف أقرب صيدلية أو طبيب، مع تقدير مسافة القيادة والمشي، ورسم خط المسار مباشرة داخل التطبيق.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <button
            id="home-open-map-btn"
            onClick={() => setActiveTab('map')}
            className="w-full lg:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/25 active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>فتح الخريطة التفاعلية والمسار</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. Highlighted Section: Today's On-Duty Pharmacies */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <Clock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  الصيدليات المناوبة اليوم
                </h2>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                  يوم {todayDayName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                الصيدليات المفتوحة للحراسة الليلية والنهارية في بلديات ولاية الوادي
              </p>
            </div>
          </div>

          <button
            id="view-all-garde-btn"
            onClick={() => setActiveTab('garde')}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 rounded-xl border border-emerald-200/80 flex items-center gap-2 transition-all self-start sm:self-auto active:scale-95"
          >
            <span>عرض كل مناوبات الأسبوع</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Today's On-Duty Pharmacies */}
        {todayOnDutyPharmacies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
          <div className="text-center py-10 text-slate-500 text-xs space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-sm text-slate-700">لا توجد صيدليات مسجلة في المناوبة لهذا اليوم.</p>
            <p className="text-slate-400">يمكنك مراجعة جدول باقي أيام الأسبوع من تبويب الصيدليات المناوبة.</p>
          </div>
        )}
      </section>

      {/* 6. Why Use The Directory? (مزايا وموثوقية المنصة) */}
      <section className="bg-slate-100/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            لماذا دليل الصحة بولاية الوادي؟
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            صُممت المنصة لتوفير وصول موثوق وسلس للمعلومة الطبية والصيدلانية في أسرع وقت.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 text-right">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">بيانات موثوقة ومحدثة</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              تحديث دوري لجداول المناوبة وعناوين وأرقام هواتف الأطباء والصيدليات في كافة البلديات.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 text-right">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">تحديد الموقع والمسار</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              إمكانية معرفة المسافة والاتجاهات الدقيقة للمرفق الصحي مباشرة دون مغادرة التطبيق.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2 text-right">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">تطبيق سريع وخفيف (PWA)</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              يمكن تثبيت المنصة على هاتفك كتطبيق رئيسي يعمل بسلاسة وسرعة فائقة في أي وقت.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Emergency Strip Callout */}
      <section className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5 border border-red-500/50">
        <div className="flex items-center gap-4 text-right">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldAlert className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg sm:text-xl text-white">هل تحتاج إلى مساعدة طبية طارئة؟</h3>
              <span className="text-[10px] font-extrabold bg-white text-red-700 px-2 py-0.5 rounded-md">24/24 ساعة</span>
            </div>
            <p className="text-xs sm:text-sm text-red-100 mt-1 leading-relaxed">
              اتصل مباشرة بالحماية المدنية على الرقم <strong>14</strong> أو الاستعجالات الطبية <strong>3030</strong> أو الدرك الوطني <strong>1055</strong>
            </p>
          </div>
        </div>

        <button
          id="home-emergency-btn"
          onClick={onOpenEmergencyModal}
          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-red-50 text-red-700 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all shrink-0 flex items-center justify-center gap-2 active:scale-95"
        >
          <PhoneCall className="w-4 h-4" />
          <span>عرض جميع أرقام النجدة والإسعاف</span>
        </button>
      </section>
    </div>
  );
};
