import React, { useState, useMemo, useEffect } from 'react';
import { ActiveTab, HealthEntity } from './types';
import { HEALTH_DATA } from './data/mockData';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MapView } from './components/MapView';
import { PharmaciesView } from './components/PharmaciesView';
import { GardeView } from './components/GardeView';
import { DoctorsView } from './components/DoctorsView';
import { HospitalsView } from './components/HospitalsView';
import { EmergencyModal } from './components/EmergencyModal';
import { AddEntityModal } from './components/AddEntityModal';
import { InAppMapModal } from './components/InAppMapModal';
import { HeartPulse, ShieldAlert, MapPin, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'eloued_health_custom_entities_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-app interactive map modal state for browsing inside the website
  const [inAppMapEntity, setInAppMapEntity] = useState<HealthEntity | null>(null);
  const [isInAppMapOpen, setIsInAppMapOpen] = useState<boolean>(false);
  const [focusedMapEntity, setFocusedMapEntity] = useState<HealthEntity | null>(null);

  // Initialize entities with mock data plus any saved custom entities
  const [entities, setEntities] = useState<HealthEntity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: HealthEntity[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom items at beginning
          return [...parsed, ...HEALTH_DATA];
        }
      }
    } catch (e) {
      console.error('Failed to load custom entities from storage', e);
    }
    return HEALTH_DATA;
  });

  const handleAddEntity = (newEntity: HealthEntity) => {
    setEntities((prev) => {
      const updated = [newEntity, ...prev];
      try {
        // Only store custom entities in localStorage
        const customOnly = updated.filter(e => e.id.startsWith('custom-'));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
      } catch (e) {
        console.error('Failed to save entity to localStorage', e);
      }
      return updated;
    });

    // Show toast notification
    setToastMessage(`تمت إضافة "${newEntity.name}" (${newEntity.type}) بنجاح!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleViewOnMap = (entity: HealthEntity) => {
    setInAppMapEntity(entity);
    setIsInAppMapOpen(true);
  };

  const handleOpenFullMapFromModal = (entity: HealthEntity) => {
    setFocusedMapEntity(entity);
    setActiveTab('map');
    setIsInAppMapOpen(false);
  };

  // Filter entities by category
  const pharmacies = useMemo(
    () => entities.filter((item) => item.type === 'صيدلية'),
    [entities]
  );

  const doctors = useMemo(
    () => entities.filter((item) => item.type === 'طبيب'),
    [entities]
  );

  const facilities = useMemo(
    () => entities.filter((item) => item.type === 'مستشفى' || item.type === 'عيادة'),
    [entities]
  );

  // Compute on-duty pharmacies for today
  const todayDayOfWeek = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const todayOnDutyPharmacies = useMemo(() => {
    return pharmacies.filter(
      (p) => p.garde_days && p.garde_days.includes(todayDayOfWeek)
    );
  }, [pharmacies, todayDayOfWeek]);

  const todayOnDutyIds = useMemo(() => {
    return todayOnDutyPharmacies.map((p) => p.id);
  }, [todayOnDutyPharmacies]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white font-['Tajawal',sans-serif]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          <button 
            onClick={() => setActiveTab('map')} 
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg font-bold mr-2"
          >
            عرض بالخريطة
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onDutyCountToday={todayOnDutyPharmacies.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === 'home' && (
          <HomeView
            entities={entities}
            todayOnDutyPharmacies={todayOnDutyPharmacies}
            setActiveTab={setActiveTab}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            entities={entities}
            todayOnDutyIds={todayOnDutyIds}
            focusedEntity={focusedMapEntity}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'pharmacies' && (
          <PharmaciesView
            pharmacies={pharmacies}
            todayOnDutyIds={todayOnDutyIds}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activeTab === 'garde' && (
          <GardeView 
            pharmacies={pharmacies} 
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorsView 
            doctors={doctors} 
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalsView 
            facilities={facilities} 
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onViewOnMap={handleViewOnMap}
          />
        )}
      </main>

      {/* In-App Map Navigation Modal (Browse without leaving to Google Maps) */}
      <InAppMapModal
        entity={inAppMapEntity}
        isOpen={isInAppMapOpen}
        onClose={() => setIsInAppMapOpen(false)}
        onOpenFullMap={handleOpenFullMapFromModal}
        isOnDuty={inAppMapEntity ? todayOnDutyIds.includes(inAppMapEntity.id) : false}
      />

      {/* Add Entity Modal */}
      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEntity={handleAddEntity}
      />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">دليل الصحة - ولاية الوادي 39</p>
              <p className="text-slate-500 text-xs">خدمة مجانية موثوقة للبحث عن الخدمات الصحية والصيدليات المناوبة</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
            <button onClick={() => setActiveTab('home')} className="text-slate-600 hover:text-blue-600 transition-colors">
              الرئيسية
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setActiveTab('map')} className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
              الخريطة التفاعلية
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setActiveTab('garde')} className="text-emerald-700 hover:text-emerald-800 transition-colors">
              الصيدليات المناوبة
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setActiveTab('pharmacies')} className="text-slate-600 hover:text-blue-600 transition-colors">
              الصيدليات
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setActiveTab('doctors')} className="text-slate-600 hover:text-blue-600 transition-colors">
              الأطباء
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setActiveTab('hospitals')} className="text-slate-600 hover:text-blue-600 transition-colors">
              المستشفيات
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setIsAddModalOpen(true)} className="text-blue-700 hover:text-blue-800 font-bold transition-colors">
              + إضافة منشأة
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => setIsEmergencyModalOpen(true)} className="text-red-600 hover:text-red-700 font-bold transition-colors">
              أرقام الطوارئ (14 / 17 / 1055)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
