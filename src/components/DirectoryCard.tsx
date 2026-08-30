import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Navigation, 
  Check, 
  Copy, 
  ShieldAlert, 
  Calendar,
  Building2,
  Pill,
  Stethoscope
} from 'lucide-react';
import { HealthEntity } from '../types';
import { ARABIC_DAYS } from '../data/mockData';

interface DirectoryCardProps {
  item: HealthEntity;
  isOnDuty?: boolean;
  onViewOnMap?: (item: HealthEntity) => void;
}

export const DirectoryCard: React.FC<DirectoryCardProps> = ({ 
  item, 
  isOnDuty = false,
  onViewOnMap 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(item.phone.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMap = (e: React.MouseEvent) => {
    if (onViewOnMap) {
      e.preventDefault();
      onViewOnMap(item);
    }
  };

  const getMapsUrl = () => {
    if (item.latitude && item.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${item.name} ${item.commune} الوادي الجزائر`
    )}`;
  };

  const getTypeBadge = () => {
    switch (item.type) {
      case 'صيدلية':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            صيدلية
          </span>
        );
      case 'طبيب':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            {item.specialty || 'طبيب مختص'}
          </span>
        );
      case 'مستشفى':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            مستشفى عمومي
          </span>
        );
      case 'عيادة':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            عيادة صحية
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id={`card-${item.id}`} 
      className={`bg-white rounded-xl border transition-all duration-200 p-5 flex flex-col justify-between relative group ${
        isOnDuty 
          ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-200/60' 
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top badges & Commune */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {getTypeBadge()}
            
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <MapPin className="w-3 h-3 ml-1 text-slate-500" />
              {item.commune}
            </span>

            {item.isEmergency && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                <ShieldAlert className="w-3 h-3" />
                استعجالات 24/24
              </span>
            )}
          </div>

          {/* On-Duty Highlight */}
          {isOnDuty && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
              مناوبة اليوم
            </div>
          )}
        </div>

        {/* Title / Name */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
          {item.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{item.address}</span>
        </div>

        {/* Working hours / shift */}
        {item.workingHours && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{item.workingHours}</span>
          </div>
        )}

        {/* Garde Days info for pharmacies */}
        {item.type === 'صيدلية' && item.garde_days && item.garde_days.length > 0 && (
          <div className="text-xs text-slate-600 mb-3 flex items-start gap-1.5 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-900">أيام المناوبة الدورية: </span>
              <span className="text-emerald-800">
                {item.garde_days.length === 7 
                  ? 'مناوبة يومية مستمرة' 
                  : item.garde_days.map(d => ARABIC_DAYS[d]).join(' • ')}
              </span>
              {item.garde_shift && (
                <span className="block text-[11px] text-emerald-700 font-medium mt-0.5">
                  الفترة: {item.garde_shift}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Medical notes/Specialties details */}
        {item.notes && (
          <p className="text-xs text-slate-600 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100 mb-3">
            {item.notes}
          </p>
        )}
      </div>

      {/* Action buttons (Direct Call, Copy, Map) */}
      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {/* Phone display and copy */}
        <div className="flex items-center gap-1.5">
          <button
            id={`copy-phone-${item.id}`}
            onClick={handleCopyPhone}
            title="نسخ رقم الهاتف"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-xs flex items-center gap-1.5 border border-slate-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold text-xs">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono font-medium text-slate-700 dir-ltr">{item.phone}</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Map & Direct Call */}
        <div className="flex items-center gap-2">
          {onViewOnMap ? (
            <button
              id={`map-btn-${item.id}`}
              onClick={handleOpenMap}
              type="button"
              title="عرض الموقع والمسار التفاعلي داخل التطبيق"
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors inline-flex items-center justify-center border border-blue-200"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span className="sr-only">عرض الموقع والمسار داخل التطبيق</span>
            </button>
          ) : (
            <a
              id={`map-btn-${item.id}`}
              href={getMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              title="الاتجاهات على الخريطة"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center justify-center border border-slate-200"
            >
              <Navigation className="w-4 h-4 text-slate-600" />
              <span className="sr-only">الاتجاهات على الخريطة</span>
            </a>
          )}

          <a
            id={`call-btn-${item.id}`}
            href={`tel:${item.phone.replace(/\s+/g, '')}`}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 ml-0.5" />
            <span>اتصال مباشر</span>
          </a>
        </div>
      </div>
    </div>
  );
};
