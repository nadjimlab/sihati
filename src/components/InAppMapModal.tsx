import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Car, 
  Footprints, 
  LocateFixed, 
  Compass, 
  Copy, 
  Check, 
  Maximize2, 
  Pill, 
  Stethoscope, 
  Building2, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HealthEntity } from '../types';
import { calculateDistanceKm, formatDistance, estimateTravelTimes, getBearing } from '../utils/geoUtils';
import { ARABIC_DAYS } from '../data/mockData';

interface InAppMapModalProps {
  entity: HealthEntity | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullMap: (entity: HealthEntity) => void;
  isOnDuty?: boolean;
}

// Controller to smoothly pan & fit bounds inside the modal map
const ModalMapController: React.FC<{
  entityPos: [number, number];
  userPos: [number, number] | null;
}> = ({ entityPos, userPos }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size in case modal just animated into view
    setTimeout(() => {
      map.invalidateSize();
      if (userPos) {
        const bounds = L.latLngBounds([entityPos, userPos]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView(entityPos, 16, { animate: true });
      }
    }, 150);
  }, [map, entityPos, userPos]);

  return null;
};

export const InAppMapModal: React.FC<InAppMapModalProps> = ({
  entity,
  isOpen,
  onClose,
  onOpenFullMap,
  isOnDuty = false,
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-fetch location if available silently or let user press button
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          },
          () => {
            // Ignore silent error
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen || !entity) return null;

  const lat = entity.latitude || 33.368;
  const lng = entity.longitude || 6.867;
  const entityPos: [number, number] = [lat, lng];

  const handleGetLocation = () => {
    setIsLocating(true);
    setLocError(null);

    if (!navigator.geolocation) {
      setLocError('خدمة تحديد الموقع غير متوفرة في المتصفح');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setLocError('يرجى تفعيل صلاحية الموقع (GPS) في المتصفح لرؤية المسار المباشر.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCopyDetails = () => {
    const textToCopy = `${entity.name}\n${entity.address} - بلدية ${entity.commune}\nهاتف: ${entity.phone}\nالإحداثيات: ${lat}, ${lng}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Distance & route estimations
  let distanceInfo = null;
  if (userLocation) {
    const distKm = calculateDistanceKm(userLocation[0], userLocation[1], lat, lng);
    const times = estimateTravelTimes(distKm);
    const bearing = getBearing(userLocation[0], userLocation[1], lat, lng);
    distanceInfo = {
      distKm,
      formattedDistance: formatDistance(distKm),
      ...times,
      bearing,
    };
  }

  // Icons
  const facilityIcon = L.divIcon({
    className: 'custom-inapp-facility-icon',
    html: `
      <div style="
        background-color: ${entity.type === 'صيدلية' ? '#059669' : entity.type === 'طبيب' ? '#2563eb' : entity.type === 'مستشفى' ? '#dc2626' : '#7c3aed'};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${entity.type === 'صيدلية' 
            ? '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>' 
            : entity.type === 'طبيب'
            ? '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>'
            : '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>'}
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });

  const userIcon = L.divIcon({
    className: 'custom-inapp-user-icon',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="position: absolute; inset: 0; background-color: #3b82f6; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></div>
        <div style="position: relative; width: 24px; height: 24px; background-color: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-xs overflow-y-auto font-['Tajawal'] dir-rtl">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto text-right flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white ${
              entity.type === 'صيدلية' ? 'bg-emerald-600' :
              entity.type === 'طبيب' ? 'bg-blue-600' :
              entity.type === 'مستشفى' ? 'bg-red-600' : 'bg-purple-600'
            }`}>
              {entity.type === 'صيدلية' ? <Pill className="w-5 h-5" /> :
               entity.type === 'طبيب' ? <Stethoscope className="w-5 h-5" /> :
               <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-slate-300">
                  {entity.type} {entity.specialty ? `• ${entity.specialty}` : ''}
                </span>
                {isOnDuty && (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                    مناوبة اليوم
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">
                {entity.name}
              </h2>
            </div>
          </div>

          <button
            id="close-inapp-map-modal"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* In-App Live Interactive Map */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-100 shrink-0 border-b border-slate-200">
          <MapContainer
            center={entityPos}
            zoom={15}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <ModalMapController entityPos={entityPos} userPos={userLocation} />

            {/* Destination Facility Marker */}
            <Marker position={entityPos} icon={facilityIcon}>
              <Popup>
                <div className="text-right p-1 font-['Tajawal'] dir-rtl">
                  <p className="font-bold text-slate-900 text-xs">{entity.name}</p>
                  <p className="text-[11px] text-slate-500">{entity.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* User Marker and Route Polyline */}
            {userLocation && (
              <>
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>
                    <div className="text-right p-1 font-['Tajawal'] dir-rtl">
                      <p className="font-bold text-blue-600 text-xs">موقعك الحالي</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Direct Navigation Line inside app */}
                <Polyline
                  positions={[userLocation, entityPos]}
                  pathOptions={{
                    color: '#2563eb',
                    weight: 4,
                    opacity: 0.85,
                    dashArray: '8, 8',
                  }}
                />
              </>
            )}
          </MapContainer>

          {/* Map floating controls */}
          <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
            <button
              onClick={handleGetLocation}
              disabled={isLocating}
              className="p-2 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors"
              title="تحديد موقعي لحساب المسار الداخلي"
            >
              <LocateFixed className={`w-4 h-4 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{userLocation ? 'تحديث موقعي' : 'احسب المسار من موقعي'}</span>
            </button>
          </div>

          <div className="absolute bottom-3 right-3 z-[400]">
            <div className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700 shadow-md flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>{entity.commune} • {lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* In-App Route & Distance Details */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {locError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{locError}</span>
            </div>
          )}

          {/* Live In-App Navigation Metrics if user location is available */}
          {distanceInfo ? (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>بيانات المسار الداخلي من موقعك الحالي:</span>
                </span>
                <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  الاتجاه: {distanceInfo.bearing}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-center">
                  <span className="block text-[10px] text-slate-500 font-medium">المسافة المباشرة</span>
                  <span className="text-sm sm:text-base font-extrabold text-blue-600">
                    {distanceInfo.formattedDistance}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Car className="w-3 h-3 text-slate-600" />
                    <span>بالسيارة تقريباً</span>
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-slate-800">
                    ~ {distanceInfo.drivingMinutes} دقيقة
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-blue-100 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Footprints className="w-3 h-3 text-slate-600" />
                    <span>مشياً على الأقدام</span>
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-slate-800">
                    ~ {distanceInfo.walkingMinutes} دقيقة
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <LocateFixed className="w-4 h-4 text-blue-600 shrink-0" />
                <span>حدد موقعك لمعرفة المسافة والوقت التقديري للوصول مباشرة داخل التطبيق.</span>
              </div>
              <button
                onClick={handleGetLocation}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                تحديد موقعي
              </button>
            </div>
          )}

          {/* Facility Detailed Address & Working hours */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">العنوان: </span>
                <span>{entity.address} (بلدية {entity.commune})</span>
              </div>
            </div>

            {entity.workingHours && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">ساعات العمل: </span>
                  <span>{entity.workingHours}</span>
                </div>
              </div>
            )}

            {entity.type === 'صيدلية' && entity.garde_days && entity.garde_days.length > 0 && (
              <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">أيام المناوبة الدورية: </span>
                  <span>{entity.garde_days.map(d => ARABIC_DAYS[d]).join(' • ')}</span>
                </div>
              </div>
            )}

            {entity.notes && (
              <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-bold">ملاحظات: </span>
                <span>{entity.notes}</span>
              </div>
            )}
          </div>

          {/* Actions: In-App Full Map, Phone, Copy */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleCopyDetails}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">تم نسخ البيانات</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ الإحداثيات والعنوان</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                id="modal-open-full-map-btn"
                onClick={() => {
                  onClose();
                  onOpenFullMap(entity);
                }}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <span>الخريطة التفاعلية الكاملة</span>
              </button>

              <a
                id="modal-direct-call-btn"
                href={`tel:${entity.phone.split('/')[0].trim().replace(/\s+/g, '')}`}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>اتصال ({entity.phone})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
