import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ActiveTab, HealthEntity, EditSuggestion } from './types';
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
import { SuggestEditModal } from './components/SuggestEditModal';
import { InAppMapModal } from './components/InAppMapModal';
import { MobileDrawer } from './components/MobileDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PwaInstallModal } from './components/PwaInstallModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HeartPulse, CheckCircle2, WifiOff } from 'lucide-react';
import {
  subscribeToHealthEntities,
  addEntityToFirestore,
  updateEntityInFirestore,
  deleteEntityFromFirestore,
  submitEditSuggestionToFirestore
} from './services/firebaseService';
import {
  loadCachedEntities,
  saveCachedEntities,
  initStorageLifecycle,
  resetStorageToDefaults
} from './utils/storageManager';
import { swManager } from './utils/serviceWorkerRegistration';
import { checkAndNotifyGardeChanges } from './utils/notificationManager';
import { recordSiteVisit } from './utils/analyticsManager';

// Inner component to encapsulate routing & state
function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // Track site visits per activeTab
  useEffect(() => {
    recordSiteVisit(activeTab).catch(console.warn);
  }, [activeTab]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuggestEditModalOpen, setIsSuggestEditModalOpen] = useState(false);
  const [suggestEditEntity, setSuggestEditEntity] = useState<HealthEntity | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => swManager.getOnlineStatus());

  // PWA install prompt event state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Initialize auto-cleanup & storage lifecycle for localStorage
    const cleanupStorage = initStorageLifecycle();

    // Subscribe to online/offline network changes
    const unsubscribeNetwork = swManager.subscribeNetworkStatus((online) => {
      setIsOnline(online);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      cleanupStorage();
      unsubscribeNetwork();
    };
  }, []);

  // In-app interactive map modal state for browsing inside the website
  const [inAppMapEntity, setInAppMapEntity] = useState<HealthEntity | null>(null);
  const [isInAppMapOpen, setIsInAppMapOpen] = useState<boolean>(false);
  const [focusedMapEntity, setFocusedMapEntity] = useState<HealthEntity | null>(null);

  // Initialize entities safely with cached data & auto-cleaned storage
  const [entities, setEntities] = useState<HealthEntity[]>(() => {
    return loadCachedEntities();
  });

  // Subscribe to real-time Firestore database
  useEffect(() => {
    const unsubscribe = subscribeToHealthEntities(
      (firestoreEntities) => {
        if (firestoreEntities && firestoreEntities.length > 0) {
          setEntities(firestoreEntities);
          saveCachedEntities(firestoreEntities);
          setIsFirebaseSynced(true);

          // Check if today's on-duty pharmacies changed and alert user if subscribed
          const currentDayOfWeek = new Date().getDay();
          const todayYear = new Date().getFullYear();
          const todayMonth = String(new Date().getMonth() + 1).padStart(2, '0');
          const todayDateNum = String(new Date().getDate()).padStart(2, '0');
          const todayFormattedYMD = `${todayYear}-${todayMonth}-${todayDateNum}`;

          const todayGardeList = firestoreEntities.filter(e => {
            if (e.type !== 'صيدلية') return false;
            const matchDay = e.garde_days?.includes(currentDayOfWeek);
            const matchSpecific = e.garde_dates?.includes(todayFormattedYMD);
            return Boolean(matchDay || matchSpecific);
          });

          checkAndNotifyGardeChanges(todayGardeList);
        }
      },
      (error) => {
        console.warn('Firestore subscription using offline cache fallback:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const saveEntitiesToStorage = (updatedEntities: HealthEntity[]) => {
    saveCachedEntities(updatedEntities);
  };

  const handleAddEntity = (newEntity: HealthEntity) => {
    setEntities((prev) => {
      const updated = [newEntity, ...prev];
      saveEntitiesToStorage(updated);
      return updated;
    });

    // Sync to Firestore
    addEntityToFirestore(newEntity).catch((err) => {
      console.warn('Failed to sync added entity to Firestore:', err);
    });

    // Show toast notification
    if (newEntity.status === 'pending') {
      setToastMessage(`شكراً لك! تم إرسال "${newEntity.name}" وسيتم تدقيقها ونشرها بعد مراجعة المشرف.`);
    } else {
      setToastMessage(`تمت إضافة "${newEntity.name}" (${newEntity.type}) وحفظها بنجاح!`);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleEditEntity = (updatedEntity: HealthEntity) => {
    setEntities((prev) => {
      const updated = prev.map(item => item.id === updatedEntity.id ? updatedEntity : item);
      saveEntitiesToStorage(updated);
      return updated;
    });

    // Sync to Firestore
    updateEntityInFirestore(updatedEntity).catch((err) => {
      console.warn('Failed to sync updated entity to Firestore:', err);
    });

    setToastMessage(`تم تحديث بيانات "${updatedEntity.name}" بنجاح!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleDeleteEntity = (id: string) => {
    setEntities((prev) => {
      const target = prev.find(e => e.id === id);
      const updated = prev.filter(item => item.id !== id);
      saveEntitiesToStorage(updated);
      if (target) {
        setToastMessage(`تم حذف "${target.name}" من الدليل.`);
        setTimeout(() => {
          setToastMessage(null);
        }, 3000);
      }
      return updated;
    });

    // Sync to Firestore
    deleteEntityFromFirestore(id).catch((err) => {
      console.warn('Failed to sync delete to Firestore:', err);
    });
  };

  const handleUpdateEntities = (newEntities: HealthEntity[]) => {
    setEntities(newEntities);
    saveEntitiesToStorage(newEntities);
    setToastMessage(`تم تحديث قاعدة البيانات (${newEntities.length} منشأة) بنجاح!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleResetToDefaults = () => {
    resetStorageToDefaults();
    setEntities(HEALTH_DATA);
    setToastMessage('تمت استعادة البيانات الافتراضية بنجاح.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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

  const handleOpenSuggestEditModal = (entity: HealthEntity) => {
    setSuggestEditEntity(entity);
    setIsSuggestEditModalOpen(true);
  };

  const handleSubmitEditSuggestion = (suggestion: EditSuggestion) => {
    submitEditSuggestionToFirestore(suggestion).catch((err) => {
      console.warn('Failed to sync edit suggestion to Firestore:', err);
    });

    setToastMessage('شكراً لك! تم إرسال اقتراح التعديل وسيتم مراجعته من قبل المشرف قبل نشره.');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Only approved entities are visible to the public site
  const approvedEntities = useMemo(
    () => entities.filter((item) => item.status !== 'pending'),
    [entities]
  );

  // Filter approved entities by category
  const pharmacies = useMemo(
    () => approvedEntities.filter((item) => item.type === 'صيدلية'),
    [approvedEntities]
  );

  const doctors = useMemo(
    () => approvedEntities.filter((item) => item.type === 'طبيب'),
    [approvedEntities]
  );

  const facilities = useMemo(
    () => approvedEntities.filter((item) => item.type === 'مستشفى' || item.type === 'عيادة'),
    [approvedEntities]
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
    <Routes>
      {/* Route 1: Dedicated Admin Dashboard Route */}
      <Route
        path="/admin"
        element={
          <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 font-['Tajawal',sans-serif]">
            <div className="max-w-7xl mx-auto">
              <AdminDashboard
                entities={entities}
                onUpdateEntities={handleUpdateEntities}
                onAddEntity={handleAddEntity}
                onDeleteEntity={handleDeleteEntity}
                onEditEntity={handleEditEntity}
                onResetToDefaults={handleResetToDefaults}
                onViewOnMap={handleViewOnMap}
              />
            </div>
          </div>
        }
      />

      {/* Route 2: Public App Main Route */}
      <Route
        path="/*"
        element={
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
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onDutyCountToday={todayOnDutyPharmacies.length}
            />

            {/* Offline Mode Alert Banner */}
            {!isOnline && (
              <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all animate-fadeIn">
                <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
                <span>أنت تتصفح الآن في وضع عدم الاتصال (Offline) - كافة الصيدليات والأطباء والبيانات متاحة ومحفوظة محلياً.</span>
              </div>
            )}

            {/* Mobile Navigation Drawer */}
            <MobileDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenInstallModal={() => setIsInstallModalOpen(true)}
              onDutyCountToday={todayOnDutyPharmacies.length}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-20 md:pb-8">
              {activeTab === 'home' && (
                <HomeView
                  entities={approvedEntities}
                  todayOnDutyPharmacies={todayOnDutyPharmacies}
                  setActiveTab={setActiveTab}
                  onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onOpenInstallModal={() => setIsInstallModalOpen(true)}
                  onViewOnMap={handleViewOnMap}
                  onSuggestEdit={handleOpenSuggestEditModal}
                />
              )}

              {activeTab === 'map' && (
                <MapView
                  entities={approvedEntities}
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
                  onSuggestEdit={handleOpenSuggestEditModal}
                />
              )}

              {activeTab === 'garde' && (
                <GardeView
                  pharmacies={pharmacies}
                  onViewOnMap={handleViewOnMap}
                  onSuggestEdit={handleOpenSuggestEditModal}
                />
              )}

              {activeTab === 'doctors' && (
                <DoctorsView
                  doctors={doctors}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onViewOnMap={handleViewOnMap}
                  onSuggestEdit={handleOpenSuggestEditModal}
                />
              )}

              {activeTab === 'hospitals' && (
                <HospitalsView
                  facilities={facilities}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onViewOnMap={handleViewOnMap}
                  onSuggestEdit={handleOpenSuggestEditModal}
                />
              )}
            </main>

            {/* In-App Map Navigation Modal */}
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

            {/* Suggest Edit Modal */}
            <SuggestEditModal
              isOpen={isSuggestEditModalOpen}
              entity={suggestEditEntity}
              onClose={() => setIsSuggestEditModalOpen(false)}
              onSubmitSuggestion={handleSubmitEditSuggestion}
            />

            {/* Emergency Modal */}
            <EmergencyModal
              isOpen={isEmergencyModalOpen}
              onClose={() => setIsEmergencyModalOpen(false)}
            />

            {/* PWA Install Modal */}
            <PwaInstallModal
              isOpen={isInstallModalOpen}
              onClose={() => setIsInstallModalOpen(false)}
              deferredPrompt={deferredPrompt}
              onInstallSuccess={() => {
                setToastMessage('تم تثبيت التطبيق بنجاح!');
                setTimeout(() => setToastMessage(null), 3000);
              }}
            />

            {/* Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
            <MobileBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              onDutyCountToday={todayOnDutyPharmacies.length}
            />

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-8 sm:mt-12 py-8 text-xs text-slate-500 mb-16 md:mb-0">
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
                    الخريطة التفاعلية والمسار
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
                  <button onClick={() => setIsInstallModalOpen(true)} className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                    📱 تثبيت على الهاتف
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
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
