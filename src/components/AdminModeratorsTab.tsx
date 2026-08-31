import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Phone, 
  Mail, 
  Clock, 
  Eye, 
  EyeOff,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Send,
  FileCheck,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { ModeratorUser, ModeratorPermission } from '../types';
import { 
  getLocalModerators, 
  subscribeToModerators, 
  addModerator, 
  updateModerator, 
  deleteModerator,
  ALL_MODERATOR_PERMISSIONS 
} from '../utils/moderatorManager';

interface AdminModeratorsTabProps {
  isSuperAdmin: boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminModeratorsTab: React.FC<AdminModeratorsTabProps> = ({
  isSuperAdmin,
  onShowToast,
}) => {
  const [moderators, setModerators] = useState<ModeratorUser[]>(() => getLocalModerators());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMod, setEditingMod] = useState<ModeratorUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    password: string;
    email: string;
    phone: string;
    permissions: ModeratorPermission[];
    status: 'active' | 'suspended';
    notes: string;
  }>({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    permissions: ['can_edit_entities', 'can_publish_entities', 'can_manage_garde', 'can_add_entities'],
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    const unsub = subscribeToModerators((mods) => {
      setModerators(mods);
    });
    return () => unsub();
  }, []);

  const handleOpenAdd = () => {
    setEditingMod(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      permissions: ['can_edit_entities', 'can_publish_entities', 'can_manage_garde', 'can_add_entities'],
      status: 'active',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (mod: ModeratorUser) => {
    setEditingMod(mod);
    setFormData({
      name: mod.name,
      username: mod.username,
      password: mod.password || '',
      email: mod.email || '',
      phone: mod.phone || '',
      permissions: mod.permissions || ['can_edit_entities', 'can_publish_entities'],
      status: mod.status,
      notes: mod.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleTogglePermission = (permId: ModeratorPermission) => {
    const current = formData.permissions;
    if (current.includes(permId)) {
      setFormData({
        ...formData,
        permissions: current.filter(p => p !== permId),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...current, permId],
      });
    }
  };

  const handleSaveModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      onShowToast('يرجى ملء الاسم الكامل، اسم المستخدم وكلمة المرور/الرمز السري!', 'error');
      return;
    }

    if (formData.permissions.length === 0) {
      onShowToast('يرجى تحديد صلاحية واحدة على الأقل للمشرف!', 'error');
      return;
    }

    const cleanUsername = formData.username.trim().toLowerCase().replace(/\s+/g, '_');

    if (editingMod) {
      const updated: ModeratorUser = {
        ...editingMod,
        name: formData.name.trim(),
        username: cleanUsername,
        password: formData.password.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        permissions: formData.permissions,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };
      await updateModerator(updated);
      onShowToast(`تم تحديث بيانات وصلاحيات المشرف "${updated.name}" بنجاح!`, 'success');
    } else {
      // Check duplicate username
      if (moderators.some(m => m.username.toLowerCase() === cleanUsername)) {
        onShowToast('اسم المستخدم هذا موجود مسبقاً، يرجى اختيار اسم مستخدم آخر.', 'error');
        return;
      }

      const newMod: ModeratorUser = {
        id: `mod_${Date.now()}`,
        name: formData.name.trim(),
        username: cleanUsername,
        password: formData.password.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        permissions: formData.permissions,
        status: formData.status,
        createdAt: new Date().toISOString(),
        notes: formData.notes.trim() || undefined,
      };
      await addModerator(newMod);
      onShowToast(`تمت إضافة المشرف "${newMod.name}" وتفعيل صلاحياته بنجاح!`, 'success');
    }

    setIsAddModalOpen(false);
  };

  const handleToggleStatus = async (mod: ModeratorUser) => {
    const updatedStatus: 'active' | 'suspended' = mod.status === 'active' ? 'suspended' : 'active';
    await updateModerator({
      ...mod,
      status: updatedStatus,
    });
    onShowToast(
      updatedStatus === 'active' 
        ? `تم تفعيل حساب المشرف "${mod.name}"` 
        : `تم تجميد حساب المشرف "${mod.name}" مؤقتاً`,
      'info'
    );
  };

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteModerator(deletingId);
      onShowToast('تم حذف المشرف بنجاح', 'info');
      setDeletingId(null);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredModerators = moderators.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                إدارة المشرفين والصلاحيات (المحررين)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200">
                {moderators.length} مشرف مسجل
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إضافة وتعيين مشرفين مساعدين مع منحهم صلاحيات التعديل، النشر، وجدولة صيدليات المناوبة
            </p>
          </div>
        </div>

        {/* Add Moderator Button */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مشرف جديد</span>
        </button>
      </div>

      {/* Roles & Permissions Explanation Card */}
      <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>نظام الصلاحيات المرن للمشرفين:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>صلاحية التعديل</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تحديث بيانات وأرقام الهواتف وساعات عمل المنشآت الطبية القائمة.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>صلاحية النشر والاعتماد</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              مراجعة ونشر المنشآت الجديدة وتفعيل ظهورها في الدليل والخريطة.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>صلاحية صيدليات المناوبة</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              تعديل وتحديد أيام المناوبة الليلية والأسبوعية لكل صيدلية.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Moderators List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-black text-slate-900">
            قائمة المشرفين المعتمدين ({filteredModerators.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو اسم المستخدم..."
              className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Moderators Cards Grid */}
        {filteredModerators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredModerators.map((mod) => (
              <div
                key={mod.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                  mod.status === 'active'
                    ? 'bg-white border-slate-200 shadow-xs hover:border-indigo-300'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                <div className="space-y-3">
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {mod.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{mod.name}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            mod.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {mod.status === 'active' ? 'نشط' : 'مجمّد'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          @{mod.username}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(mod)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-bold transition-colors flex items-center gap-1 ${
                        mod.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      title={mod.status === 'active' ? 'تجميد الحساب' : 'تفعيل الحساب'}
                    >
                      {mod.status === 'active' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{mod.status === 'active' ? 'تجميد' : 'تفعيل'}</span>
                    </button>
                  </div>

                  {/* Credentials / Details */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">كلمة المرور / الرمز السري:</span>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                        <span>{visiblePasswords[mod.id] ? mod.password : '••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(mod.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5"
                          title="إظهار / إخفاء"
                        >
                          {visiblePasswords[mod.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {mod.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">رقم الهاتف:</span>
                        <span className="font-mono text-slate-800 font-bold">{mod.phone}</span>
                      </div>
                    )}

                    {mod.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">البريد الإلكتروني:</span>
                        <span className="text-slate-800 font-mono text-[11px]">{mod.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Permissions Badges */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 block">الصلاحيات الممنوحة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mod.permissions.map((perm) => {
                        const meta = ALL_MODERATOR_PERMISSIONS.find(p => p.id === perm);
                        return (
                          <span
                            key={perm}
                            className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-[11px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                            <span>{meta?.label || perm}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {mod.lastLoginAt && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" />
                      <span>آخر تسجيل دخول: {new Date(mod.lastLoginAt).toLocaleDateString('ar-DZ')} {new Date(mod.lastLoginAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => handleOpenEdit(mod)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الصلاحيات</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(mod.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="حذف المشرف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs space-y-2">
            <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
            <p>لا يوجد مشرفين مسجلين بعد.</p>
            <button
              onClick={handleOpenAdd}
              className="text-indigo-600 hover:underline font-bold text-xs"
            >
              + اضغط هنا لإضافة أول مشرف للموقع
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Moderator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs font-['Tajawal'] dir-rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden text-right max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-l from-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingMod ? 'تعديل بيانات وصلاحيات المشرف' : 'إضافة مشرف جديد'}
                  </h3>
                  <p className="text-xs text-slate-300">تعيين كلمة المرور واختيار الصلاحيات الممنوحة</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModerator} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل للمشرف *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: د. محمد علي، أو أحمد بن سالم"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم للدخول *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="مثال: ahmed_eloued"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">يستخدم لتسجيل الدخول في لوحة الإدارة</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور / الرمز السري *
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="أدخل كلمة المرور أو PIN..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">الرمز الذي سيدخل به المشرف</span>
                </div>
              </div>

              {/* Contact Info (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06XX XX XX XX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@mail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-800">
                  تحديد الصلاحيات الممنوحة لهذا المشرف: *
                </label>

                <div className="space-y-2">
                  {ALL_MODERATOR_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                          isChecked
                            ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600 rounded mt-0.5 shrink-0"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold block">{perm.label}</span>
                          <span className="text-[11px] text-slate-500 block leading-tight">{perm.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  حالة الحساب
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="modStatus"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-indigo-600"
                    />
                    <span>نشط (يمكنه الدخول وممارسة صلاحياته)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="modStatus"
                      checked={formData.status === 'suspended'}
                      onChange={() => setFormData({ ...formData, status: 'suspended' })}
                      className="text-rose-600"
                    />
                    <span>مجمّد (موقوف مؤقتاً)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  {editingMod ? 'حفظ التعديلات' : 'إضافة المشرف الآن'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">هل أنت متأكد من حذف هذا المشرف؟</h3>
              <p className="text-xs text-slate-500">
                سيتم إلغاء صلاحيات المشرف وسحب قدرته على الدخول إلى لوحة الإدارة.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                نعم، حذف
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
