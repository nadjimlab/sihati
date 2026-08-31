import React from 'react';
import { ShieldAlert, Phone, X, AlertTriangle, Building2, ShieldCheck, HeartPulse } from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../data/mockData';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-red-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">أرقام الطوارئ والنجدة - ولاية الوادي</h2>
              <p className="text-xs text-red-100">خطوط مباشرة ومجانية متاحة 24/24 ساعة</p>
            </div>
          </div>
          <button
            id="close-emergency-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>في الحالات الحرجة، يرجى التوجه فوراً إلى أقرب مصلحة استعجالات أو الاتصال بالحماية المدنية (14).</span>
          </div>

          <div className="space-y-2 pt-1">
            {EMERGENCY_NUMBERS.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50/20 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>

                <a
                  id={`dial-emergency-${idx}`}
                  href={`tel:${item.number.split('/')[0].trim().replace(/\s+/g, '')}`}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-md shadow-red-600/30 active:scale-95 transition-all shrink-0 border border-red-500/50 group-hover:shadow-lg"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <span className="font-mono dir-ltr font-black tracking-wide">{item.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
            دليل الصحة - ولاية الوادي 39
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
