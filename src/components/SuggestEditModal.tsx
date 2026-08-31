import React, { useEffect, useState } from 'react';
import {
  X,
  Pencil,
  MapPin,
  Phone,
  Clock,
  Check,
  AlertCircle,
  ShieldAlert,
  FileText,
  Send,
} from 'lucide-react';
import { EditableEntityField, EditSuggestion, HealthEntity } from '../types';
import { COMMUNES, SPECIALTIES } from '../data/mockData';

interface SuggestEditModalProps {
  isOpen: boolean;
  entity: HealthEntity | null;
  onClose: () => void;
  onSubmitSuggestion: (suggestion: EditSuggestion) => void;
}

// Field definitions shared across entity types (some are conditionally shown below)
const ARABIC_DAYS_SHORT = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const SuggestEditModal: React.FC<SuggestEditModalProps> = ({
  isOpen,
  entity,
  onClose,
  onSubmitSuggestion,
}) => {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [gardeDays, setGardeDays] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [reporterNote, setReporterNote] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  // Pre-fill the form with the entity's current values whenever a new entity is opened
  useEffect(() => {
    if (entity) {
      setName(entity.name || '');
      setSpecialty(entity.specialty || '');
      setCommune(entity.commune || '');
      setAddress(entity.address || '');
      setPhone(entity.phone || '');
      setSecondaryPhone(entity.secondaryPhone || '');
      setWorkingHours(entity.workingHours || '');
      setIsEmergency(Boolean(entity.isEmergency));
      setGardeDays(entity.garde_days || []);
      setNotes(entity.notes || '');
      setReporterNote('');
      setReporterContact('');
      setErrorMessage(null);
      setSuccessMessage(false);
    }
  }, [entity]);

  if (!isOpen || !entity) return null;

  const toggleGardeDay = (dayId: number) => {
    setGardeDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('يرجى كتابة الاسم.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('يرجى كتابة العنوان.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('يرجى كتابة رقم الهاتف.');
      return;
    }

    // Build a diff: only include fields whose value actually changed
    const changes: Partial<Record<EditableEntityField, any>> = {};
    const originalValues: Partial<Record<EditableEntityField, any>> = {};

    const compareAndSet = (
      field: EditableEntityField,
      newVal: any,
      oldVal: any
    ) => {
      const normalize = (v: any) => (v === undefined || v === null ? '' : v);
      const normalizedNew = typeof newVal === 'string' ? newVal.trim() : newVal;
      if (JSON.stringify(normalize(normalizedNew)) !== JSON.stringify(normalize(oldVal))) {
        changes[field] = normalizedNew;
        originalValues[field] = oldVal ?? '';
      }
    };

    compareAndSet('name', name, entity.name);
    if (entity.type === 'طبيب') compareAndSet('specialty', specialty, entity.specialty);
    compareAndSet('commune', commune, entity.commune);
    compareAndSet('address', address, entity.address);
    compareAndSet('phone', phone, entity.phone);
    compareAndSet('secondaryPhone', secondaryPhone, entity.secondaryPhone);
    compareAndSet('workingHours', workingHours, entity.workingHours);
    compareAndSet('notes', notes, entity.notes);
    if (entity.type === 'مستشفى' || entity.type === 'عيادة') {
      compareAndSet('isEmergency', isEmergency, Boolean(entity.isEmergency));
    }
    if (entity.type === 'صيدلية') {
      compareAndSet('garde_days', gardeDays, entity.garde_days || []);
    }

    if (Object.keys(changes).length === 0) {
      setErrorMessage('لم تقم بتعديل أي بيانات. يرجى تغيير حقل واحد على الأقل قبل الإرسال.');
      return;
    }

    const suggestion: EditSuggestion = {
      id: `suggestion-${Date.now()}`,
      entityId: entity.id,
      entityName: entity.name,
      entityType: entity.type,
      changes,
      originalValues,
      reporterNote: reporterNote.trim() ? reporterNote.trim() : undefined,
      reporterContact: reporterContact.trim() ? reporterContact.trim() : undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    onSubmitSuggestion(suggestion);
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 text-right font-['Tajawal'] dir-rtl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">اقتراح تعديل على المعلومات</h2>
              <p className="text-xs text-indigo-100">{entity.name}</p>
            </div>
          </div>
          <button
            id="close-suggest-edit-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold block">شكراً لك! تم إرسال اقتراحك بنجاح.</span>
                <span className="text-[11px] text-emerald-700">
                  سيقوم المشرف بمراجعة التعديل المقترح، ولن يظهر في الدليل إلا بعد الموافقة عليه.
                </span>
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-2.5 leading-relaxed">
            عدّل فقط الحقول التي تريد تصحيحها، واترك الباقي كما هو. سيتم إرسال اقتراحك إلى المشرف
            لمراجعته وتأكيده قبل تحديث الدليل العام.
          </p>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الاسم *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Specialty (doctors only) */}
          {entity.type === 'طبيب' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التخصص</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                {SPECIALTIES.filter((s) => s !== 'الكل').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                {specialty && !SPECIALTIES.includes(specialty) && (
                  <option value={specialty}>{specialty}</option>
                )}
              </select>
            </div>
          )}

          {/* Commune & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البلدية</label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                {COMMUNES.filter((c) => c !== 'الكل').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان الدقيق / الحي *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Phones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الرئيسي *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 font-mono dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف إضافي</label>
              <input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 font-mono dir-ltr text-right"
              />
            </div>
          </div>

          {/* Working hours */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>ساعات العمل</span>
            </label>
            <input
              type="text"
              placeholder="مثال: 08:00 - 17:00 / 24/24"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Emergency toggle for hospitals/clinics */}
          {(entity.type === 'مستشفى' || entity.type === 'عيادة') && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>مصلحة استعجالات 24/24 ساعة</span>
            </label>
          )}

          {/* Garde days for pharmacies */}
          {entity.type === 'صيدلية' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">أيام المناوبة الدورية</label>
              <div className="flex flex-wrap gap-1.5">
                {ARABIC_DAYS_SHORT.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleGardeDay(idx)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                      gardeDays.includes(idx)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 resize-none"
            />
          </div>

          {/* Reporter note & contact */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>ما الذي تريد تصحيحه؟ ولماذا؟ (اختياري)</span>
              </label>
              <textarea
                rows={2}
                placeholder="مثال: رقم الهاتف القديم لم يعد يعمل، العنوان الصحيح هو..."
                value={reporterNote}
                onChange={(e) => setReporterNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم هاتفك أو بريدك الإلكتروني (اختياري، في حال احتاج المشرف للتواصل معك)
              </label>
              <input
                type="text"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-600 dir-ltr text-right"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              id="submit-edit-suggestion-btn"
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الاقتراح للمراجعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
