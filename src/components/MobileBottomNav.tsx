import React from 'react';
import { 
  Home, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Menu,
  Pill,
  ShieldAlert
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  onDutyCountToday: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenDrawer,
  onDutyCountToday,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] pb-[env(safe-area-inset-bottom,0.25rem)] font-['Tajawal',sans-serif]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        
        {/* 1. الرئيسية (Home) */}
        <button
          id="mobile-bottom-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative select-none ${
            activeTab === 'home'
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-blue-50 text-blue-600 scale-110 shadow-2xs' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold">الرئيسية</span>
          {activeTab === 'home' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          )}
        </button>

        {/* 2. الخريطة (Map) */}
        <button
          id="mobile-bottom-map"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative select-none ${
            activeTab === 'map'
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'map' ? 'bg-blue-50 text-blue-600 scale-110 shadow-2xs' : ''}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold">الخريطة</span>
          {activeTab === 'map' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          )}
        </button>

        {/* 3. المناوبة (Garde) - Highlighted Feature */}
        <button
          id="mobile-bottom-garde"
          onClick={() => setActiveTab('garde')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative select-none ${
            activeTab === 'garde'
              ? 'text-emerald-700 font-black'
              : 'text-emerald-700 font-bold'
          }`}
        >
          <div className="relative">
            <div className={`p-1.5 rounded-2xl transition-all shadow-xs ${
              activeTab === 'garde' 
                ? 'bg-emerald-600 text-white scale-110 shadow-emerald-600/30' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            {onDutyCountToday > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-4.5 h-4.5 px-1 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {onDutyCountToday}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 font-black text-emerald-800">المناوبة</span>
          {activeTab === 'garde' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          )}
        </button>

        {/* 4. الأطباء (Doctors) */}
        <button
          id="mobile-bottom-doctors"
          onClick={() => setActiveTab('doctors')}
          className={`flex flex-col items-center justify-center py-1 transition-all relative select-none ${
            activeTab === 'doctors'
              ? 'text-blue-600 font-black'
              : 'text-slate-500 hover:text-slate-800 font-semibold'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'doctors' ? 'bg-blue-50 text-blue-600 scale-110 shadow-2xs' : ''}`}>
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold">الأطباء</span>
          {activeTab === 'doctors' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          )}
        </button>

        {/* 5. القائمة / المزيد (Drawer) */}
        <button
          id="mobile-bottom-menu"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-800 transition-all select-none"
        >
          <div className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold">القائمة</span>
        </button>

      </div>
    </div>
  );
};
