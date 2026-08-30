import React, { useEffect } from 'react';
import { 
  X, 
  Home, 
  MapPin, 
  Clock, 
  Pill, 
  Stethoscope, 
  Building2, 
  ShieldAlert, 
  Plus, 
  Smartphone, 
  HeartPulse, 
  ChevronLeft,
  Navigation,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenEmergencyModal: () => void;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
  onDutyCountToday: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenEmergencyModal,
  onOpenAddModal,
  onOpenInstallModal,
  onDutyCountToday,
}) => {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'الصفحة الرئيسية',
      icon: Home,
      badge: null,
      desc: 'البحث والاستكشاف السريع',
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white',
      inactiveBg: 'hover:bg-slate-100 text-slate-800',
    },
    {
      id: 'map' as ActiveTab,
      label: 'الخريطة التفاعلية والمسار',
      icon: MapPin,
      badge: 'مباشر',
      badgeBg: 'bg-blue-100 text-blue-800',
      desc: 'تصفح وتحديد المسافات والمواقع',
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white',
      inactiveBg: 'hover:bg-slate-100 text-slate-800',
    },
    {
      id: 'garde' as ActiveTab,
      label: 'الصيدليات المناوبة (Garde)',
      icon: Clock,
      badge: onDutyCountToday > 0 ? `${onDutyCountToday} صيدليات` : null,
      badgeBg: 'bg-emerald-100 text-emerald-800',
      desc: 'جدول مناوبات اليوم والأيام القادمة',
      color: 'text-emerald-600',
      activeBg: 'bg-emerald-600 text-white',
      inactiveBg: 'hover:bg-emerald-50/70 text-slate-800',
    },
    {
      id: 'pharmacies' as ActiveTab,
      label: 'دليل الصيدليات',
      icon: Pill,
      badge: null,
      desc: 'جميع صيدليات بلديات الوادي',
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white',
      inactiveBg: 'hover:bg-slate-100 text-slate-800',
    },
    {
      id: 'doctors' as ActiveTab,
      label: 'الأطباء والعيادات',
      icon: Stethoscope,
      badge: null,
      desc: 'حسب التخصص والبلدية',
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white',
      inactiveBg: 'hover:bg-slate-100 text-slate-800',
    },
    {
      id: 'hospitals' as ActiveTab,
      label: 'المستشفيات والمراكز الصحية',
      icon: Building2,
      badge: null,
      desc: 'المستشفيات، العيادات متعددة الخدمات والمصحات',
      color: 'text-blue-600',
      activeBg: 'bg-blue-600 text-white',
      inactiveBg: 'hover:bg-slate-100 text-slate-800',
    },
    {
      id: 'admin' as ActiveTab,
      label: 'لوحة تحكم المشرف (Admin)',
      icon: ShieldCheck,
      badge: 'إدارة',
      badgeBg: 'bg-amber-100 text-amber-900',
      desc: 'إدارة وتعديل البيانات وحفظ النسخ الاحتياطية',
      color: 'text-amber-600',
      activeBg: 'bg-slate-900 text-white',
      inactiveBg: 'hover:bg-slate-100 text-slate-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-['Tajawal'] dir-rtl">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Slides in from Right in RTL) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
          
          {/* Drawer Top / Header */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <HeartPulse className="w-6 h-6 text-white stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>دليل الصحة</span>
                    <span className="text-blue-300">الوادي</span>
                  </h2>
                  <p className="text-[11px] text-blue-100">ولاية 39 • جميع البلديات</p>
                </div>
              </div>

              <button
                id="close-mobile-drawer-btn"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action in Drawer Header */}
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
              <button
                id="drawer-add-entity-btn"
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-white text-blue-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-700" />
                <span>إضافة مرفق طبي</span>
              </button>

              <button
                id="drawer-emergency-btn"
                onClick={() => {
                  onClose();
                  onOpenEmergencyModal();
                }}
                className="py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>الطوارئ</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 overflow-y-auto space-y-1.5 grow">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
              أقسام الدليل الطبي
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`drawer-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between text-right transition-all group ${
                    isActive ? item.activeBg : item.inactiveBg
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold block">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isActive ? 'bg-white text-slate-900' : item.badgeBg
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] block line-clamp-1 ${
                        isActive ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  <ChevronLeft className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:-translate-x-0.5 transition-transform'}`} />
                </button>
              );
            })}
          </div>

          {/* Drawer Bottom / Install as App CTA & Version */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
            {/* Install PWA Button */}
            <button
              id="drawer-pwa-install-btn"
              onClick={() => {
                onClose();
                onOpenInstallModal();
              }}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-between shadow-xs transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/20 text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold block">تثبيت التطبيق على هاتفك</span>
                  <span className="text-[10px] text-blue-100 block">إضافة أيقونة للشاشة الرئيسية</span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>دليل الصحة • ولاية الوادي</span>
              <span>الإصدار 2.0</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
