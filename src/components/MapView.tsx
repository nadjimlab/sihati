import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  Circle,
  Polyline
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Crosshair, 
  Search, 
  Filter, 
  Building2, 
  Stethoscope, 
  Pill, 
  ShieldAlert, 
  ExternalLink,
  RotateCcw,
  Check,
  Copy,
  Info,
  ChevronRight,
  Sparkles,
  LocateFixed,
  Plus,
  Car,
  Footprints,
  Compass
} from 'lucide-react';
import { HealthEntity, HealthEntityType } from '../types';
import { calculateDistanceKm, formatDistance, estimateTravelTimes, getBearing } from '../utils/geoUtils';
import { AdvancedFilterBar } from './AdvancedFilterBar';
import { AdvancedFilterState, INITIAL_FILTER_STATE, filterEntities } from '../utils/filterUtils';

// Coordinates of El Oued City (ولاية الوادي)
const EL_OUED_CENTER: [number, number] = [33.368, 6.867];
const DEFAULT_ZOOM = 13;

// Fix standard Leaflet default icon issues by using custom SVG DivIcons
const createCustomIcon = (type: HealthEntityType, isOnDuty: boolean = false, isEmergency: boolean = false) => {
  let bgColor = '#2563eb'; // blue for doctors
  let iconSvg = '';
  let badgeText = '';

  if (type === 'صيدلية') {
    if (isOnDuty) {
      bgColor = '#059669'; // vibrant emerald
      badgeText = 'مناوبة';
    } else {
      bgColor = '#10b981'; // emerald green
    }
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`;
  } else if (type === 'طبيب') {
    bgColor = '#2563eb'; // royal blue
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`;
  } else if (type === 'مستشفى') {
    bgColor = '#dc2626'; // red for hospital
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12"/><path d="M6 12h12"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
  } else {
    // عيادة (Clinic)
    bgColor = '#7c3aed'; // purple/indigo
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`;
  }

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      ${isOnDuty ? `
        <div style="position: absolute; top: -14px; background: #059669; color: white; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 9999px; border: 1.5px solid white; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2); animation: pulse 2s infinite;">
          مناوبة اليوم
        </div>
      ` : ''}
      <div style="
        background: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
      <div style="
        width: 8px;
        height: 4px;
        background: rgba(0,0,0,0.25);
        border-radius: 50%;
        margin-top: 2px;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [34, 42],
    iconAnchor: [17, 38],
    popupAnchor: [0, -36]
  });
};

// User Location Icon
const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 18px; height: 18px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
    </div>
  `,
  className: 'custom-user-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Map Controller for programmatically flying to locations
interface MapControllerProps {
  centerTarget: [number, number] | null;
  zoomTarget?: number;
  triggerReset: number;
}

const MapController: React.FC<MapControllerProps> = ({ centerTarget, zoomTarget, triggerReset }) => {
  const map = useMap();

  useEffect(() => {
    if (centerTarget) {
      map.flyTo(centerTarget, zoomTarget || 15, { duration: 1.2 });
    }
  }, [centerTarget, zoomTarget, map]);

  useEffect(() => {
    if (triggerReset > 0) {
      map.flyTo(EL_OUED_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
    }
  }, [triggerReset, map]);

  return null;
};

interface MapViewProps {
  entities: HealthEntity[];
  todayOnDutyIds: string[];
  focusedEntity?: HealthEntity | null;
  onOpenAddModal?: () => void;
}

export const MapView: React.FC<MapViewProps> = ({ 
  entities, 
  todayOnDutyIds, 
  focusedEntity,
  onOpenAddModal 
}) => {
  const [filters, setFilters] = useState<AdvancedFilterState>(INITIAL_FILTER_STATE);
  const [selectedEntity, setSelectedEntity] = useState<HealthEntity | null>(null);

  // Auto-focus on passed entity
  useEffect(() => {
    if (focusedEntity && focusedEntity.latitude && focusedEntity.longitude) {
      setSelectedEntity(focusedEntity);
      setFlyTarget([focusedEntity.latitude, focusedEntity.longitude]);
      setFlyZoom(16);
    }
  }, [focusedEntity]);

  // User location state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Map Navigation targets
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [flyZoom, setFlyZoom] = useState<number>(15);
  const [resetCount, setResetCount] = useState<number>(0);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Filter entities that have valid coordinates
  const validEntities = useMemo(() => {
    return entities.filter(e => typeof e.latitude === 'number' && typeof e.longitude === 'number');
  }, [entities]);

  const filteredEntities = useMemo(() => {
    return filterEntities(validEntities, filters, {
      todayOnDutyIds,
    });
  }, [validEntities, filters, todayOnDutyIds]);

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTER_STATE);
  };

  // Request user's current GPS position
  const handleLocateUser = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('متصفحك لا يدعم خدمة تحديد الموقع الجغرافي.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setUserLocation([lat, lng]);
        setLocationAccuracy(accuracy);
        setIsLocating(false);

        // Fly to user position
        setFlyTarget([lat, lng]);
        setFlyZoom(15);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('تم رفض إذن الوصول إلى الموقع الجغرافي من المتصفح.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('تعذر تحديد موقعك الحالي بدقة.');
        } else {
          setLocationError('حدث خطأ أثناء محاولة جلب موقعك.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleResetToElOued = () => {
    setResetCount(prev => prev + 1);
    setSelectedEntity(null);
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => {
      setCopiedPhoneId(null);
    }, 2000);
  };

  const handleSelectEntity = (item: HealthEntity) => {
    setSelectedEntity(item);
    if (item.latitude && item.longitude) {
      setFlyTarget([item.latitude, item.longitude]);
      setFlyZoom(16);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner with Stats & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  الخريطة التفاعلية للمرافق الصحية
                </h1>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
                  ولاية الوادي
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                استعرض مواقع الصيدليات، الأطباء والمستشفيات جغرافياً وتحديد أقرب مرفق صحي إليك
              </p>
            </div>
          </div>

          {/* Action buttons: Locate User & Reset Center */}
          <div className="flex items-center gap-2">
            {onOpenAddModal && (
              <button
                id="map-open-add-modal-btn"
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 shadow-xs transition-colors"
                title="إضافة طبيب، صيدلية أو مستشفى جديد"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>إضافة مرفق للخريطة</span>
              </button>
            )}

            <button
              id="map-locate-user-btn"
              onClick={handleLocateUser}
              disabled={isLocating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs shadow-xs transition-colors"
              title="تحديد موقعي الحالي"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'جارٍ تحديد الموقع...' : 'تحديد موقعي'}</span>
            </button>

            <button
              id="map-reset-center-btn"
              onClick={handleResetToElOued}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
              title="إعادة التمركز على مدينة الوادي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تمركز (الوادي)</span>
            </button>
          </div>
        </div>

        {/* Location Error alert if any */}
        {locationError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              onClick={() => setLocationError(null)}
              className="text-amber-800 hover:text-amber-950 font-bold text-xs"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Advanced Filters Bar */}
        <AdvancedFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          entities={validEntities}
          resultCount={filteredEntities.length}
          totalCount={validEntities.length}
          searchPlaceholder="ابحث بالاسم، التخصص، البلدية، الحي، أو الشارع..."
        />

        {/* Legend pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 font-medium">دليل الألوان:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span className="text-slate-700">صيدلية</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-700">طبيب / عيادة خاصة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span className="text-slate-700">مستشفى عمومي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <span className="text-slate-700">عيادة متعددة الخدمات</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-1.5 font-bold text-blue-600">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
                <span>موقعك الحالي</span>
              </div>
            )}
          </div>

          <div className="text-slate-500 font-medium">
            عرض <strong>{filteredEntities.length}</strong> من أصل {validEntities.length} مرفق
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-md h-[560px] sm:h-[620px]">
        <MapContainer
          center={EL_OUED_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', zIndex: 10 }}
        >
          {/* OpenStreetMap Standard Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Map Controller for programmatically flying */}
          <MapController
            centerTarget={flyTarget}
            zoomTarget={flyZoom}
            triggerReset={resetCount}
          />

          {/* User Location Marker & Accuracy Circle */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="text-right p-1 font-['Tajawal'] dir-rtl">
                    <p className="font-bold text-blue-700 text-xs">أنت هنا</p>
                    <p className="text-[11px] text-slate-500">الموقع الجغرافي الحالي لجهازك</p>
                  </div>
                </Popup>
              </Marker>
              {locationAccuracy && (
                <Circle
                  center={userLocation}
                  radius={locationAccuracy}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                />
              )}
            </>
          )}

          {/* In-App Direct Route Line connecting User to Selected Facility */}
          {userLocation && selectedEntity && selectedEntity.latitude && selectedEntity.longitude && (
            <Polyline
              positions={[userLocation, [selectedEntity.latitude, selectedEntity.longitude]]}
              pathOptions={{
                color: '#2563eb',
                weight: 4,
                opacity: 0.85,
                dashArray: '8, 8',
              }}
            />
          )}

          {/* Medical Facilities Markers */}
          {filteredEntities.map((item) => {
            if (!item.latitude || !item.longitude) return null;

            const isOnDutyToday = todayOnDutyIds.includes(item.id);
            const icon = createCustomIcon(item.type, isOnDutyToday, Boolean(item.isEmergency));

            return (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    handleSelectEntity(item);
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 text-right font-['Tajawal'] dir-rtl min-w-[220px] space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.type} {item.specialty ? `• ${item.specialty}` : ''}
                      </span>
                      {isOnDutyToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                          مناوبة اليوم
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{item.address} (بلدية {item.commune})</span>
                      </p>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={`tel:${item.phone.split('/')[0].trim().replace(/\s+/g, '')}`}
                        className="flex-1 py-1.5 px-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>اتصال ({item.phone})</span>
                      </a>

                      <button
                        onClick={() => handleSelectEntity(item)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1"
                        title="المسار والتفاصيل داخل التطبيق"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>تفاصيل المسار</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Quick Drawer / Selected Entity Panel */}
        {selectedEntity && (() => {
          let selectedDistanceInfo = null;
          if (userLocation && selectedEntity.latitude && selectedEntity.longitude) {
            const distKm = calculateDistanceKm(
              userLocation[0],
              userLocation[1],
              selectedEntity.latitude,
              selectedEntity.longitude
            );
            const times = estimateTravelTimes(distKm);
            const bearing = getBearing(
              userLocation[0],
              userLocation[1],
              selectedEntity.latitude,
              selectedEntity.longitude
            );
            selectedDistanceInfo = {
              distKm,
              formattedDistance: formatDistance(distKm),
              ...times,
              bearing,
            };
          }

          return (
            <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[85%] overflow-y-auto">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedEntity.type}
                    </span>
                    {selectedEntity.specialty && (
                      <span className="text-[11px] font-medium text-slate-600">
                        {selectedEntity.specialty}
                      </span>
                    )}
                    {todayOnDutyIds.includes(selectedEntity.id) && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                        مناوبة اليوم
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1">
                    {selectedEntity.name}
                  </h3>
                </div>

                <button
                  id="close-selected-facility-card"
                  onClick={() => setSelectedEntity(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {/* In-App Live Distance & Travel Time info */}
              {selectedDistanceInfo ? (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>المسار الداخلي من موقعك:</span>
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {selectedDistanceInfo.bearing}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="bg-white p-1.5 rounded-lg border border-blue-100">
                      <span className="block text-[9px] text-slate-500">المسافة</span>
                      <span className="font-bold text-blue-600 text-xs">
                        {selectedDistanceInfo.formattedDistance}
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500">
                        <Car className="w-2.5 h-2.5 text-slate-600" />
                        <span>سيارة</span>
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        ~{selectedDistanceInfo.drivingMinutes} د
                      </span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500">
                        <Footprints className="w-2.5 h-2.5 text-slate-600" />
                        <span>مشياً</span>
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        ~{selectedDistanceInfo.walkingMinutes} د
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleLocateUser}
                  className="w-full py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>تحديد موقعي لحساب المسافة والوقت التقديري</span>
                </button>
              )}

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedEntity.address} • <strong>بلدية {selectedEntity.commune}</strong></span>
                </p>

                {selectedEntity.workingHours && (
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedEntity.workingHours}</span>
                  </p>
                )}

                {selectedEntity.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {selectedEntity.notes}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <a
                  id="map-call-btn"
                  href={`tel:${selectedEntity.phone.split('/')[0].trim().replace(/\s+/g, '')}`}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال ({selectedEntity.phone})</span>
                </a>

                <button
                  id="map-focus-target-btn"
                  onClick={() => {
                    if (selectedEntity.latitude && selectedEntity.longitude) {
                      setFlyTarget([selectedEntity.latitude, selectedEntity.longitude]);
                      setFlyZoom(17);
                    }
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
                  title="تكبير الموقع على الخريطة"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>تمركز</span>
                </button>

                <button
                  id="map-copy-phone-btn"
                  onClick={() => handleCopyPhone(selectedEntity.phone, selectedEntity.id)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs border border-slate-200 transition-colors"
                  title="نسخ رقم الهاتف"
                >
                  {copiedPhoneId === selectedEntity.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Facilities List below map for quick browsing */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span>قائمة المرافق الظاهرة على الخريطة</span>
            <span className="text-xs font-medium text-slate-500">({filteredEntities.length} مرفق)</span>
          </h2>
          <span className="text-xs text-slate-400">انقر على أي مرفق للانتقال لموقعه على الخريطة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredEntities.map((item) => {
            const isSelected = selectedEntity?.id === item.id;
            const isOnDutyToday = todayOnDutyIds.includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleSelectEntity(item)}
                className={`text-right p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.type}
                    </span>
                    {isOnDutyToday && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        مناوبة
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.address}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>بلدية {item.commune}</span>
                  <span className="text-blue-600 font-bold flex items-center gap-0.5">
                    <span>عرض</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
