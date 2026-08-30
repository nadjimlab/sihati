import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  MapPin, 
  Phone, 
  Stethoscope, 
  Pill, 
  Building2, 
  LocateFixed, 
  Check, 
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { HealthEntity, HealthEntityType } from '../types';
import { COMMUNES, SPECIALTIES } from '../data/mockData';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntity: (newEntity: HealthEntity) => void;
}

export const AddEntityModal: React.FC<AddEntityModalProps> = ({
  isOpen,
  onClose,
  onAddEntity,
}) => {
  const [type, setType] = useState<HealthEntityType>('طبيب');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('طب عام');
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [commune, setCommune] = useState('الوادي');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [latitude, setLatitude] = useState<string>('33.368');
  const [longitude, setLongitude] = useState<string>('6.867');
  const [workingHours, setWorkingHours] = useState('08:00 - 17:00');
  const [isEmergency, setIsEmergency] = useState(false);
  const [isOnDutyToday, setIsOnDutyToday] = useState(false);
  const [notes, setNotes] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage('خدمة تحديد الموقع غير مدعومة في المتصفح.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setErrorMessage('تعذر جلب موقعك الحالي. يمكنك إدخال الإحداثيات يدوياً.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('يرجى كتابة اسم الطبيب أو المرفق الطبي.');
      return;
    }

    if (!address.trim()) {
      setErrorMessage('يرجى تحديد العنوان أو اسم الشارع/الحي.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف.');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMessage('يرجى إدخال إحداثيات جغرافية صحيحة (أرقام).');
      return;
    }

    const finalSpecialty = type === 'طبيب' 
      ? (specialty === 'أخرى' && customSpecialty.trim() ? customSpecialty.trim() : specialty)
      : undefined;

    const todayDayOfWeek = new Date().getDay();

    const newEntity: HealthEntity = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      type,
      specialty: finalSpecialty,
      commune,
      address: address.trim(),
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim() ? secondaryPhone.trim() : undefined,
      latitude: latNum,
      longitude: lngNum,
      workingHours: workingHours.trim() ? workingHours.trim() : undefined,
      isEmergency: (type === 'مستشفى' || type === 'عيادة') ? isEmergency : undefined,
      garde_days: type === 'صيدلية' && isOnDutyToday ? [todayDayOfWeek] : undefined,
      garde_shift: type === 'صيدلية' && isOnDutyToday ? 'ليلية (20:00 - 08:00)' : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    onAddEntity(newEntity);
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
      onClose();
      // Reset form
      setName('');
      setAddress('');
      setPhone('');
      setSecondaryPhone('');
      setNotes('');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 text-right font-['Tajawal'] dir-rtl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">إضافة مرفق طبي جديد</h2>
              <p className="text-xs text-blue-100">إضافة طبيب، صيدلية أو مرفق استشفائي مع الإحداثيات</p>
            </div>
          </div>
          <button
            id="close-add-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-bold">تمت إضافة المرفق الطبي بنجاح وحفظه في الدليل والخريطة!</span>
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع المرفق الطبي *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'طبيب', label: 'طبيب / عيادة', icon: Stethoscope },
                { id: 'صيدلية', label: 'صيدلية', icon: Pill },
                { id: 'مستشفى', label: 'مستشفى عمومي', icon: Building2 },
                { id: 'عيادة', label: 'عيادة خاصة/متعددة', icon: Building2 }
              ].map(t => {
                const Icon = t.icon;
                const isSelected实施 = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as HealthEntityType)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      isSelected实施 
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected实施 ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              الاسم الكامل / اسم المرفق *
            </label>
            <input
              id="new-entity-name"
              type="text"
              required
              placeholder={
                type === 'طبيب' ? 'مثال: د. محمد التواتي' :
                type === 'صيدلية' ? 'مثال: صيدلية النور - د. أحمد' :
                'مثال: مستشفى 8 ماي 1945'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Specialty (If Doctor) */}
          {type === 'طبيب' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التخصص الطبي *
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {SPECIALTIES.filter(s => s !== 'الكل').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="أخرى">تخصص آخر...</option>
                </select>
              </div>

              {specialty === 'أخرى' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    حدد التخصص *
                  </label>
                  <input
                    type="text"
                    placeholder="اكتب التخصص الطبي..."
                    value={customSpecialty}
                    onChange={(e) => setCustomSpecialty(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Commune & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                البلدية (ولاية الوادي) *
              </label>
              <select
                id="new-entity-commune"
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {COMMUNES.filter(c => c !== 'الكل').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                العنوان الدقيق / الحي *
              </label>
              <input
                id="new-entity-address"
                type="text"
                required
                placeholder="مثال: شارع الاستقلال، قرب ساحة النصر"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Phone & Secondary Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الهاتف الرئيسي *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  id="new-entity-phone"
                  type="tel"
                  required
                  placeholder="032 21 00 00 / 0661 XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم هاتف إضافي (اختياري)
              </label>
              <input
                type="tel"
                placeholder="0770 XX XX XX"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono dir-ltr text-right"
              />
            </div>
          </div>

          {/* GPS Coordinates Section */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  الإحداثيات الجغرافية (Coordinates) *
                </span>
              </div>

              <button
                type="button"
                id="fetch-current-gps-btn"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs transition-colors"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'جارٍ الجلب...' : 'استخدام موقعي الحالي'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  خط العرض (Latitude)
                </label>
                <input
                  id="new-entity-lat"
                  type="text"
                  required
                  placeholder="33.368000"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono dir-ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  خط الطول (Longitude)
                </label>
                <input
                  id="new-entity-lng"
                  type="text"
                  required
                  placeholder="6.867000"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-mono dir-ltr"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              * ستظهر المنشأة مباشرة على الخريطة التفاعلية بناءً على هذه الإحداثيات.
            </p>
          </div>

          {/* Extra options based on type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ساعات العمل
              </label>
              <input
                type="text"
                placeholder="مثال: 08:00 - 17:00 / 24/24"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center pt-5">
              {type === 'صيدلية' ? (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isOnDutyToday}
                    onChange={(e) => setIsOnDutyToday(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>صيدلية مناوبة اليوم (Garde)</span>
                </label>
              ) : (type === 'مستشفى' || type === 'عيادة') ? (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span>مصلحة استعجالات 24/24 ساعة</span>
                </label>
              ) : null}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات أو توجيهات إضافية (اختياري)
            </label>
            <textarea
              rows={2}
              placeholder="مثال: المواعيد بالهاتف مسبقاً، تتوفر أشعة سينية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              id="submit-new-entity-btn"
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة وحفظ المرفق</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
