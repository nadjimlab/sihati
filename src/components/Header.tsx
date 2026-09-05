import React, { useRef, useEffect, useState } from 'react';
import {
  HeartPulse,
  Pill,
  Stethoscope,
  Building2,
  Clock,
  Home,
  ShieldAlert,
  Menu,
  Smartphone,
  Navigation,
  Plus,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenEmergencyModal: () => void;
  onOpenAddModal: () => void;
  onOpenDrawer: () => void;
  onOpenInstallModal: () => void;
  onOpenShare?: () => void;
  onDutyCountToday: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergencyModal,
  onOpenAddModal,
  onOpenDrawer,
  onOpenInstallModal,
  onOpenShare,
  onDutyCountToday,
}) => {
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      // In RTL, scrollLeft is usually 0 or negative
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = Math.abs(scrollLeft);
      setCanScrollRight(currentScroll > 10);
      setCanScrollLeft(currentScroll < maxScroll - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const amount = direction === 'left' ? -150 : 150;
      tabsContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-['Tajawal',sans-serif]">
      {/* Top Banner with branding & Quick actions */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2">

          {/* Logo & Site Title (Always clear and never overlapping) */}
          <div className="flex items-center gap-2 min-w-0 shrink">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 sm:gap-3 text-right focus:outline-hidden group min-w-0"
            >
              <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-600/20 group-hover:scale-105 transition-all shrink-0">
                <HeartPulse className="w-4.5 h-4.5 sm:w-6 sm:h-6 md:w-7 md:h-7 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className="font-black text-sm sm:text-lg md:text-xl text-slate-900 tracking-tight whitespace-nowrap">
                  دليل الصحة <span className="text-blue-600">الوادي</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0">
                  39
                </span>
              </div>
            </button>
          </div>

          {/* Quick Actions (Sized with safe gaps so it NEVER overlaps on any screen) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share App Button */}
            {onOpenShare && (
              <button
                id="header-share-app-btn"
                onClick={onOpenShare}
                className="flex items-center justify-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/90 font-bold text-xs sm:text-sm transition-all shadow-2xs group active:scale-95 shrink-0"
                title="نشر ومشاركة التطبيق عبر واتساب، فيسبوك، إنستغرام..."
              >
                <Share2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline font-extrabold text-xs">نشر التطبيق</span>
              </button>
            )}

            {/* Install App CTA Pill Button (Matching user screenshot: pill container, smartphone icon & clear label) */}
            <button
              id="header-install-pwa-btn"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-full bg-slate-100/90 hover:bg-slate-200/90 text-indigo-950 border border-slate-300/80 font-black text-xs sm:text-sm transition-all shadow-2xs hover:shadow-xs active:scale-95 shrink-0"
              title="تثبيت التطبيق على الشاشة الرئيسية للهاتف"
            >
              <Smartphone className="w-4 h-4 text-indigo-900 stroke-[2.2] shrink-0" />
              <span className="font-extrabold tracking-tight">تثبيت</span>
            </button>

            {/* Add Facility Button */}
            <button
              id="header-add-entity-btn"
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs group active:scale-95 shrink-0"
              title="إضافة طبيب، صيدلية أو مستشفى"
            >
              <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline">إضافة مرفق</span>
            </button>

            {/* Garde status pill on large screens */}
            {onDutyCountToday > 0 && (
              <button
                id="header-garde-badge"
                onClick={() => setActiveTab('garde')}
                className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold hover:bg-emerald-100 transition-all active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>المناوبة: <strong>{onDutyCountToday} صيدليات</strong></span>
              </button>
            )}

            {/* Emergency Button */}
            <button
              id="emergency-modal-trigger"
              onClick={onOpenEmergencyModal}
              className="flex items-center justify-center gap-1 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs sm:text-sm transition-all shadow-2xs group active:scale-95 shrink-0"
              title="أرقام الطوارئ والإسعاف"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black">طوارئ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar (Visible ONLY on md+ desktop screens; hidden on mobile in favor of the bottom bar) */}
      <div className="hidden md:block bg-slate-50/95 border-t border-slate-200/80 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div
            ref={tabsContainerRef}
            onScroll={checkScroll}
            className="flex items-center space-x-reverse space-x-2 py-2 overflow-x-auto scrollbar-none"
          >
            {/* الرئيسية */}
            <button
              id="tab-btn-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            {/* الخريطة والمسار التفاعلي */}
            <button
              id="tab-btn-map"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/70'
              }`}
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>الخريطة والمسار</span>
            </button>

            {/* الصيدليات المناوبة */}
            <button
              id="tab-btn-garde"
              onClick={() => setActiveTab('garde')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative shrink-0 active:scale-95 ${
                activeTab === 'garde'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>الصيدليات المناوبة</span>
              {onDutyCountToday > 0 && (
                <span className={`text-[11px] font-black px-1.5 py-0.2 rounded-md ${
                  activeTab === 'garde' ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                }`}>
                  {onDutyCountToday}
                </span>
              )}
            </button>

            {/* الصيدليات */}
            <button
              id="tab-btn-pharmacies"
              onClick={() => setActiveTab('pharmacies')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                activeTab === 'pharmacies'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>الصيدليات</span>
            </button>

            {/* الأطباء */}
            <button
              id="tab-btn-doctors"
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                activeTab === 'doctors'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>الأطباء والعيادات</span>
            </button>

            {/* المستشفيات والعيادات */}
            <button
              id="tab-btn-hospitals"
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                activeTab === 'hospitals'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>المستشفيات والمرافق</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};



