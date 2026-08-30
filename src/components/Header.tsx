import React from 'react';
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
  ShieldCheck,
  Plus
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenEmergencyModal: () => void;
  onOpenAddModal: () => void;
  onOpenDrawer: () => void;
  onOpenInstallModal: () => void;
  onDutyCountToday: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergencyModal,
  onOpenAddModal,
  onOpenDrawer,
  onOpenInstallModal,
  onDutyCountToday,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner with branding & Quick actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Mobile Menu Hamburger Button */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Mobile Drawer Trigger Button */}
            <button
              id="mobile-drawer-trigger-btn"
              onClick={onOpenDrawer}
              className="p-2 -mr-1 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 md:hidden transition-colors border border-slate-200/80 active:scale-95"
              aria-label="فتح القائمة الجانبية"
              title="القائمة والتنقل"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo & Title */}
            <button 
              id="brand-logo-btn"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 sm:gap-3.5 text-right focus:outline-hidden group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-all">
                <HeartPulse className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight">
                    دليل الصحة <span className="text-blue-600">الوادي</span>
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 hidden sm:inline-block">
                    ولاية 39
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  المنصة الرقمية الموحدة للصيدليات، الأطباء والمرافق الصحية
                </p>
              </div>
            </button>
          </div>

          {/* Quick Actions & Emergency */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Install App CTA Button */}
            <button
              id="header-install-pwa-btn"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 font-extrabold text-xs sm:text-sm transition-all shadow-2xs active:scale-95"
              title="تثبيت التطبيق على الشاشة الرئيسية للهاتف"
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">تثبيت التطبيق</span>
              <span className="md:hidden">تثبيت</span>
            </button>

            {/* Add Facility Button */}
            <button
              id="header-add-entity-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-xs group active:scale-95"
              title="إضافة طبيب، صيدلية أو مستشفى"
            >
              <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline">إضافة مرفق</span>
              <span className="sm:hidden">إضافة</span>
            </button>

            {onDutyCountToday > 0 && (
              <button
                id="header-garde-badge"
                onClick={() => setActiveTab('garde')}
                className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs font-bold hover:bg-emerald-100 transition-all active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>المناوبة اليوم: <strong>{onDutyCountToday} صيدليات</strong></span>
              </button>
            )}

            <button
              id="emergency-modal-trigger"
              onClick={onOpenEmergencyModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs sm:text-sm transition-all shadow-2xs group active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">أرقام الطوارئ</span>
              <span className="sm:hidden">الطوارئ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar (Visible on desktop & scrollable) */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-reverse space-x-1 sm:space-x-2 py-2">
            {/* الرئيسية */}
            <button
              id="tab-btn-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>

            {/* الخريطة والمسار التفاعلي */}
            <button
              id="tab-btn-map"
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/70'
              }`}
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>الخريطة والمسار</span>
            </button>

            {/* الصيدليات المناوبة */}
            <button
              id="tab-btn-garde"
              onClick={() => setActiveTab('garde')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'garde'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>الصيدليات المناوبة (Garde)</span>
              {onDutyCountToday > 0 && (
                <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ${
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'pharmacies'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>الصيدليات</span>
            </button>

            {/* الأطباء */}
            <button
              id="tab-btn-doctors"
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'doctors'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>الأطباء والعيادات</span>
            </button>

            {/* المستشفيات والعيادات */}
            <button
              id="tab-btn-hospitals"
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'hospitals'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>المستشفيات والمرافق العمومية</span>
            </button>

            {/* لوحة الإدارة */}
            <button
              id="tab-btn-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap mr-auto ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 bg-slate-200/70 hover:bg-slate-300/80 border border-slate-300/60'
              }`}
              title="لوحة تحكم المشرف وإدارة البيانات"
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>لوحة التحكم</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};


