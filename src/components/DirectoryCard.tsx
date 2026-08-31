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
  Stethoscope,
  Sparkles,
  ExternalLink,
  Pencil
} from 'lucide-react';
import { HealthEntity } from '../types';
import { ARABIC_DAYS } from '../data/mockData';

interface DirectoryCardProps {
  item: HealthEntity;
  isOnDuty?: boolean;
  onViewOnMap?: (item: HealthEntity) => void;
  onSuggestEdit?: (item: HealthEntity) => void;
}

export const DirectoryCard: React.FC<DirectoryCardProps> = ({ 
  item, 
  isOnDuty = false,
  onViewOnMap,
  onSuggestEdit
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            صيدلية
          </span>
        );
      case 'طبيب':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            {item.specialty || 'طبيب مختص'}
          </span>
        );
      case 'مستشفى':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200/80 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            مستشفى عمومي
          </span>
        );
      case 'عيادة':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/80 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
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
      className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between relative group hover:shadow-lg ${
        isOnDuty 
          ? 'border-emerald-400/80 shadow-xs ring-2 ring-emerald-500/20 bg-gradient-to-b from-emerald-50/20 to-white' 
          : 'border-slate-200/90 hover:border-blue-300 shadow-2xs'
      }`}
    >
      {/* Top badges & Commune */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {getTypeBadge()}
            
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100/90 text-slate-700 border border-slate-200/80">
              <MapPin className="w-3 h-3 ml-1 text-slate-500 shrink-0" />
              {item.commune}
            </span>

            {item.isEmergency && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-red-50 text-red-700 border border-red-200 animate-pulse">
                <ShieldAlert className="w-3 h-3 text-red-600 shrink-0" />
                استعجالات 24/24
              </span>
            )}
          </div>

          {/* On-Duty Highlight */}
          {isOnDuty && (
            <div className="bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
              مناوبة اليوم
            </div>
          )}
        </div>

        {/* Title / Name */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mb-2">
          {item.name}
        </h3>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-600 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
          <span className="leading-relaxed font-medium">{item.address}</span>
        </div>

        {/* Working hours / shift */}
        {item.workingHours && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5 bg-slate-50/90 px-3 py-1.5 rounded-xl border border-slate-200/70 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{item.workingHours}</span>
          </div>
        )}

        {/* Garde Days info for pharmacies */}
        {item.type === 'صيدلية' && (
          (item.garde_days && item.garde_days.length > 0) || (item.garde_dates && item.garde_dates.length > 0)
        ) && (
          <div className="text-xs text-slate-600 mb-3 flex items-start gap-2 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100/90">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              {item.garde_dates && item.garde_dates.length > 0 ? (
                <div>
                  <span className="font-bold text-emerald-900">أيام المناوبة الرسمية: </span>
                  <span className="text-emerald-800 font-medium font-mono text-[11px]">
                    {item.garde_dates.map(d => d.split('-')[2]).join('، ')} سبتمبر
                  </span>
                </div>
              ) : item.garde_days && item.garde_days.length > 0 ? (
                <div>
                  <span className="font-bold text-emerald-900">أيام المناوبة الدورية: </span>
                  <span className="text-emerald-800 font-medium">
                    {item.garde_days.length === 7 
                      ? 'مناوبة يومية مستمرة' 
                      : item.garde_days.map(d => ARABIC_DAYS[d]).join(' • ')}
                  </span>
                </div>
              ) : null}
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
          <p className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 mb-3 leading-relaxed">
            {item.notes}
          </p>
        )}
      </div>

      {/* Action buttons (Direct Call, Copy, Map) */}
      <div className="pt-3.5 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        {/* Phone display and copy */}
        <div className="flex items-center gap-1.5">
          <button
            id={`copy-phone-${item.id}`}
            onClick={handleCopyPhone}
            title="نسخ رقم الهاتف"
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors text-xs flex items-center gap-1.5 border border-slate-200/80 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold text-xs">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono font-bold text-slate-800 dir-ltr">{item.phone}</span>
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
              className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all inline-flex items-center justify-center border border-blue-200/70 active:scale-95 shadow-2xs"
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
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all inline-flex items-center justify-center border border-slate-200/80 active:scale-95"
            >
              <Navigation className="w-4 h-4 text-slate-600" />
              <span className="sr-only">الاتجاهات على الخريطة</span>
            </a>
          )}

          <a
            id={`call-btn-${item.id}`}
            href={`tel:${item.phone.replace(/\s+/g, '')}`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 active:scale-95 transition-all border border-emerald-500/40"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 text-white" />
            </div>
            <span>اتصال فوري</span>
          </a>
        </div>
      </div>

      {/* Suggest an edit to this entity's info */}
      {onSuggestEdit && (
        <button
          id={`suggest-edit-${item.id}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSuggestEdit(item);
          }}
          title="اقتراح تعديل على هذه المعلومات"
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>هل المعلومات غير صحيحة؟ اقترح تعديلاً</span>
        </button>
      )}
    </div>
  );
};

