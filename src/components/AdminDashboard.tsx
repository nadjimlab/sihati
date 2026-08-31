import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HealthEntity, HealthEntityType, ActiveTab, ModeratorUser, ModeratorPermission, AdminSession } from '../types';
import { COMMUNES, SPECIALTIES } from '../data/mockData';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Pill, 
  Stethoscope, 
  Building2, 
  Calendar, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  RefreshCw, 
  FileSpreadsheet, 
  FileJson, 
  Phone, 
  MapPin, 
  Clock, 
  Eye, 
  EyeOff,
  LogOut, 
  Settings, 
  Layers, 
  Activity, 
  Check, 
  X,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Database,
  LocateFixed,
  AlertCircle,
  Cloud,
  CloudCheck,
  CloudUpload,
  UserCheck,
  CheckCircle,
  Inbox,
  TrendingUp,
  Users,
  User
} from 'lucide-react';
import { 
  syncInitialDataToFirestore, 
  loginWithGoogle, 
  logoutUser, 
  subscribeToAuth,
  approveEntityInFirestore
} from '../services/firebaseService';
import { User as FirebaseUser } from 'firebase/auth';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminModeratorsTab } from './AdminModeratorsTab';
import { 
  authenticateAdminCredentials, 
  getStoredAdminSession, 
  saveAdminSession, 
  clearAdminSession 
} from '../utils/moderatorManager';

interface AdminDashboardProps {
  entities: HealthEntity[];
  onUpdateEntities: (entities: HealthEntity[]) => void;
  onAddEntity: (entity: HealthEntity) => void;
  onDeleteEntity: (id: string) => void;
  onEditEntity: (entity: HealthEntity) => void;
  onResetToDefaults: () => void;
  setActiveTab?: (tab: ActiveTab) => void;
  onViewOnMap?: (entity: HealthEntity) => void;
}

type AdminSubTab = 'overview' | 'analytics' | 'pending' | 'entities' | 'garde' | 'moderators' | 'backup' | 'settings';

const ADMIN_STORAGE_PASS_KEY = 'eloued_health_admin_password';
const ADMIN_SESSION_AUTH_KEY = 'eloued_health_admin_auth';
const DEFAULT_ADMIN_PASS = 'NADJIM92bejaia';

const DAYS_OF_WEEK = [
  { id: 0, name: 'الأحد' },
  { id: 1, name: 'الإثنين' },
  { id: 2, name: 'الثلاثاء' },
  { id: 3, name: 'الأربعاء' },
  { id: 4, name: 'الخميس' },
  { id: 5, name: 'الجمعة' },
  { id: 6, name: 'السبت' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  entities,
  onUpdateEntities,
  onAddEntity,
  onDeleteEntity,
  onEditEntity,
  onResetToDefaults,
  setActiveTab,
  onViewOnMap,
}) => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getStoredAdminSession());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_AUTH_KEY) === 'true';
  });
  const [loginMode, setLoginMode] = useState<'admin' | 'moderator'>('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);

  // Moderator Permission Checks
  const isSuperAdmin = !adminSession || adminSession.role === 'super_admin' || !!currentUser;
  const canEdit = isSuperAdmin || (adminSession?.permissions?.includes('can_edit_entities') ?? true);
  const canPublish = isSuperAdmin || (adminSession?.permissions?.includes('can_publish_entities') ?? true);
  const canManageGarde = isSuperAdmin || (adminSession?.permissions?.includes('can_manage_garde') ?? true);
  const canAdd = isSuperAdmin || (adminSession?.permissions?.includes('can_add_entities') ?? true);
  const canDelete = isSuperAdmin || (adminSession?.permissions?.includes('can_delete_entities') ?? false);

  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_AUTH_KEY, 'true');
      }
    });
    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_AUTH_KEY, 'true');
        showToast(`مرحباً بك يا ${user.displayName || user.email}!`, 'success');
      }
    } catch (err: any) {
      showToast('فشل تسجيل الدخول عبر Google: ' + (err?.message || ''), 'error');
    }
  };

  const handleSyncToFirebase = async () => {
    setIsSyncingToCloud(true);
    try {
      const count = await syncInitialDataToFirestore(entities);
      showToast(`تمت مزامنة وحفظ ${count} منشأة طبية في سحابة Firebase بنجاح!`, 'success');
    } catch (err: any) {
      showToast('فشلت المزامنة مع سحابة Firebase: ' + (err?.message || ''), 'error');
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  // Admin Active Sub-Tab
  const [subTab, setSubTab] = useState<AdminSubTab>('overview');

  // Notification Toast inside Admin
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Entity Management Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('الكل');
  const [communeFilter, setCommuneFilter] = useState<string>('الكل');
  const [statusFilter, setStatusFilter] = useState<'all' | 'custom' | 'default' | 'withGarde' | 'withoutGps'>('all');

  // Modal States for Add / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<HealthEntity | null>(null);

  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const entityToDelete = useMemo(() => entities.find(e => e.id === deletingId), [entities, deletingId]);

  // Form State
  const [formData, setFormData] = useState<Partial<HealthEntity>>({
    name: '',
    type: 'صيدلية',
    specialty: '',
    commune: 'الوادي',
    address: '',
    phone: '',
    secondaryPhone: '',
    workingHours: '08:00 - 20:00',
    latitude: 33.3683,
    longitude: 6.8674,
    garde_days: [],
    garde_shift: 'ليلية (20:00 - 08:00)',
    notes: '',
  });

  // Settings State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const session = authenticateAdminCredentials(
        passwordInput.trim(),
        usernameInput.trim() || undefined
      );

      if (session && session.isAuthenticated) {
        setAdminSession(session);
        saveAdminSession(session);
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_SESSION_AUTH_KEY, 'true');
        setAuthError('');
        setPasswordInput('');
        setUsernameInput('');
        showToast(`مرحباً بك: ${session.name || 'المشرف'} (${session.isSuperAdmin ? 'المدير العام' : 'مشرف معتمد'})`, 'success');
      } else {
        setAuthError('بيانات الدخول غير صحيحة أو تم تجميد الحساب. يرجى التحقق وإعادة المحاولة.');
      }
    } catch (err: any) {
      setAuthError('حدث خطأ أثناء التحقق من بيانات الدخول.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSession(null);
    clearAdminSession();
    sessionStorage.removeItem(ADMIN_SESSION_AUTH_KEY);
    showToast('تم تسجيل الخروج من لوحة التحكم بنجاح', 'info');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = (localStorage.getItem(ADMIN_STORAGE_PASS_KEY) || DEFAULT_ADMIN_PASS).trim().toLowerCase();
    if (currentPassword.trim().toLowerCase() !== storedPass) {
      showToast('كلمة المرور الحالية غير صحيحة!', 'error');
      return;
    }
    if (newPassword.trim().length < 4) {
      showToast('يجب أن تتكون كلمة المرور الجديدة من 4 أحرف/أرقام على الأقل!', 'error');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      showToast('كلمتا المرور الجديدتان غير متطابقتين!', 'error');
      return;
    }
    localStorage.setItem(ADMIN_STORAGE_PASS_KEY, newPassword.trim());
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('تم تغيير كلمة مرور الإدارة بنجاح!', 'success');
  };

  // Open Form for Adding New Entity
  const handleOpenAdd = () => {
    setEditingEntity(null);
    setFormData({
      name: '',
      type: 'صيدلية',
      specialty: '',
      commune: 'الوادي',
      address: '',
      phone: '',
      secondaryPhone: '',
      workingHours: '08:00 - 20:00',
      latitude: 33.3683,
      longitude: 6.8674,
      garde_days: [new Date().getDay()],
      garde_shift: 'ليلية (20:00 - 08:00)',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  // Open Form for Editing Existing Entity
  const handleOpenEdit = (item: HealthEntity) => {
    setEditingEntity(item);
    setFormData({
      ...item,
      garde_days: item.garde_days || [],
      garde_shift: item.garde_shift || 'ليلية (20:00 - 08:00)',
    });
    setIsFormModalOpen(true);
  };

  // Save Entity (Add or Update)
  const handleSaveEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim() || !formData.address?.trim()) {
      showToast('يرجى ملء الحقول الإلزامية (الاسم، العنوان، رقم الهاتف)!', 'error');
      return;
    }

    if (editingEntity && !canEdit) {
      showToast('عذراً، ليس لديك صلاحية تعديل بيانات المنشآت الطبية!', 'error');
      return;
    }
    if (!editingEntity && !canAdd) {
      showToast('عذراً، ليس لديك صلاحية إضافة منشآت طبية جديدة!', 'error');
      return;
    }

    if (editingEntity) {
      // Update existing
      const updatedItem: HealthEntity = {
        ...editingEntity,
        name: formData.name.trim(),
        type: formData.type as HealthEntityType,
        specialty: formData.type === 'طبيب' || formData.type === 'عيادة' ? formData.specialty : undefined,
        commune: formData.commune || 'الوادي',
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        secondaryPhone: formData.secondaryPhone?.trim() || undefined,
        workingHours: formData.workingHours?.trim() || undefined,
        latitude: Number(formData.latitude) || undefined,
        longitude: Number(formData.longitude) || undefined,
        garde_days: formData.type === 'صيدلية' ? formData.garde_days : undefined,
        garde_shift: formData.type === 'صيدلية' ? formData.garde_shift : undefined,
        notes: formData.notes?.trim() || undefined,
      };
      onEditEntity(updatedItem);
      showToast(`تم تعديل بيانات "${updatedItem.name}" بنجاح!`);
    } else {
      // Create new
      const newItem: HealthEntity = {
        id: `custom-${Date.now()}`,
        name: formData.name.trim(),
        type: (formData.type as HealthEntityType) || 'صيدلية',
        specialty: formData.type === 'طبيب' || formData.type === 'عيادة' ? formData.specialty : undefined,
        commune: formData.commune || 'الوادي',
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        secondaryPhone: formData.secondaryPhone?.trim() || undefined,
        workingHours: formData.workingHours?.trim() || undefined,
        latitude: Number(formData.latitude) || undefined,
        longitude: Number(formData.longitude) || undefined,
        garde_days: formData.type === 'صيدلية' ? formData.garde_days : undefined,
        garde_shift: formData.type === 'صيدلية' ? formData.garde_shift : undefined,
        notes: formData.notes?.trim() || undefined,
      };
      onAddEntity(newItem);
      showToast(`تمت إضافة "${newItem.name}" بنجاح!`);
    }
    setIsFormModalOpen(false);
  };

  // Toggle Day in Garde Days
  const handleToggleGardeDay = (dayId: number) => {
    const currentDays = formData.garde_days || [];
    if (currentDays.includes(dayId)) {
      setFormData({
        ...formData,
        garde_days: currentDays.filter(d => d !== dayId),
      });
    } else {
      setFormData({
        ...formData,
        garde_days: [...currentDays, dayId].sort(),
      });
    }
  };

  // Quick Toggle Garde for Pharmacy in Table or Garde Planner
  const handleQuickToggleGarde = (pharmacyId: string, dayId: number) => {
    if (!canManageGarde) {
      showToast('عذراً، ليس لديك صلاحية تعديل وجدولة صيدليات المناوبة!', 'error');
      return;
    }
    const target = entities.find(e => e.id === pharmacyId);
    if (!target || target.type !== 'صيدلية') return;

    const currentDays = target.garde_days || [];
    let updatedDays: number[];
    if (currentDays.includes(dayId)) {
      updatedDays = currentDays.filter(d => d !== dayId);
    } else {
      updatedDays = [...currentDays, dayId].sort();
    }

    const updatedEntity: HealthEntity = {
      ...target,
      garde_days: updatedDays,
    };
    onEditEntity(updatedEntity);
    showToast(`تم تحديث جدول مناوبة "${target.name}"`);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!canDelete) {
      showToast('عذراً، ليس لديك صلاحية حذف المنشآت الطبية!', 'error');
      setDeletingId(null);
      return;
    }
    if (deletingId) {
      onDeleteEntity(deletingId);
      showToast('تم حذف المنشأة الطبية بنجاح', 'info');
      setDeletingId(null);
    }
  };

  // Export to JSON Backup
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(entities, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eloued-health-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير النسخة الاحتياطية (JSON) بنجاح!');
    } catch (e) {
      showToast('فشل في تصدير البيانات!', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['المعرف', 'الاسم', 'النوع', 'التخصص', 'البلدية', 'العنوان', 'الهاتف', 'الهاتف الثانوي', 'ساعات العمل', 'خط العرض', 'خط الطول', 'أيام المناوبة', 'ملاحظات'];
      const rows = entities.map(e => [
        `"${e.id}"`,
        `"${(e.name || '').replace(/"/g, '""')}"`,
        `"${e.type}"`,
        `"${(e.specialty || '').replace(/"/g, '""')}"`,
        `"${e.commune}"`,
        `"${(e.address || '').replace(/"/g, '""')}"`,
        `"${e.phone}"`,
        `"${e.secondaryPhone || ''}"`,
        `"${e.workingHours || ''}"`,
        `"${e.latitude || ''}"`,
        `"${e.longitude || ''}"`,
        `"${(e.garde_days || []).map(d => DAYS_OF_WEEK.find(dw => dw.id === d)?.name).join('، ')}"`,
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eloued-health-directory-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير ملف الإكسل (CSV) بنجاح!');
    } catch (e) {
      showToast('فشل في تصدير ملف CSV!', 'error');
    }
  };

  // Import from JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name && parsed[0].type) {
          onUpdateEntities(parsed);
          showToast(`تم استيراد ${parsed.length} منشأة طبية بنجاح!`, 'success');
        } else {
          showToast('ملف JSON غير صالح أو لا يحتوي على بنية البيانات الصحيحة!', 'error');
        }
      } catch (err) {
        showToast('تعذر قراءة ملف JSON!', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Detect GPS coordinates using browser API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('المتصفح لا يدعم تحديد الموقع الجغرافي', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        showToast('تم جلب الإحداثيات الجغرافية بنجاح!');
      },
      (err) => {
        showToast('تعذر تحديد الموقع الجغرافي: ' + err.message, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Filtered Entities for Data Table
  const filteredEntities = useMemo(() => {
    return entities.filter(item => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAddress = item.address.toLowerCase().includes(q);
        const matchesPhone = item.phone.includes(q);
        const matchesSpec = item.specialty ? item.specialty.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesAddress && !matchesPhone && !matchesSpec) return false;
      }
      // Type
      if (typeFilter !== 'الكل' && item.type !== typeFilter) return false;
      // Commune
      if (communeFilter !== 'الكل' && item.commune !== communeFilter) return false;
      // Status
      if (statusFilter === 'custom' && !item.id.startsWith('custom-')) return false;
      if (statusFilter === 'default' && item.id.startsWith('custom-')) return false;
      if (statusFilter === 'withGarde' && (!item.garde_days || item.garde_days.length === 0)) return false;
      if (statusFilter === 'withoutGps' && item.latitude && item.longitude) return false;

      return true;
    });
  }, [entities, searchQuery, typeFilter, communeFilter, statusFilter]);

  // Pending Submissions Filter
  const pendingEntities = useMemo(() => {
    return entities.filter(e => e.status === 'pending');
  }, [entities]);

  const handleApproveEntity = async (entity: HealthEntity) => {
    if (!canPublish) {
      showToast('عذراً، ليس لديك صلاحية نشر واعتماد الطلبات الجديدة!', 'error');
      return;
    }
    const updated: HealthEntity = {
      ...entity,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    };
    onEditEntity(updated);
    try {
      await approveEntityInFirestore(entity.id);
    } catch (err) {
      console.warn('Approve sync note:', err);
    }
    showToast(`تمت الموافقة على "${entity.name}" وتفعيلها في الدليل والخريطة بنجاح!`, 'success');
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const total = entities.length;
    const pendingCount = entities.filter(e => e.status === 'pending').length;
    const approvedEntities = entities.filter(e => e.status !== 'pending');
    const pharmaciesCount = approvedEntities.filter(e => e.type === 'صيدلية').length;
    const doctorsCount = approvedEntities.filter(e => e.type === 'طبيب').length;
    const hospitalsCount = approvedEntities.filter(e => e.type === 'مستشفى' || e.type === 'عيادة').length;
    const customCount = entities.filter(e => e.id.startsWith('custom-')).length;

    const todayDay = new Date().getDay();
    const todayGardeCount = approvedEntities.filter(e => e.type === 'صيدلية' && e.garde_days?.includes(todayDay)).length;

    const withGpsCount = entities.filter(e => e.latitude && e.longitude).length;
    const gpsCoveragePercent = total > 0 ? Math.round((withGpsCount / total) * 100) : 0;

    // Communes distribution
    const communeCounts: Record<string, number> = {};
    entities.forEach(e => {
      communeCounts[e.commune] = (communeCounts[e.commune] || 0) + 1;
    });

    const topCommunes = Object.entries(communeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      total,
      pendingCount,
      pharmaciesCount,
      doctorsCount,
      hospitalsCount,
      customCount,
      todayGardeCount,
      gpsCoveragePercent,
      topCommunes,
    };
  }, [entities]);

  const handleGoHome = () => {
    if (setActiveTab) {
      setActiveTab('home');
    }
    // Also navigate if using react-router-dom or window location
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    }
  };

  // -------------------------------------------------------------
  // RENDER: LOGIN FORM (If not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="py-10 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200 font-['Tajawal'] dir-rtl">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 text-right space-y-6">
          {/* Lock Icon & Title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-600/20">
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">لوحة تحكم المشرف</h2>
              <p className="text-xs text-slate-500 mt-1">
                إدارة قاعدة البيانات، الصيدليات المناوبة، الأطباء والمستشفيات
              </p>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Type Selector */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1.5 border border-slate-200">
            <button
              type="button"
              id="admin-mode-master-btn"
              onClick={() => {
                setLoginMode('admin');
                setAuthError('');
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                loginMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white/70 text-slate-700 hover:bg-white hover:text-slate-950 font-bold'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>المدير العام (Master)</span>
            </button>

            <button
              type="button"
              id="admin-mode-moderator-btn"
              onClick={() => {
                setLoginMode('moderator');
                setAuthError('');
              }}
              className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
                loginMode === 'moderator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/70 text-slate-700 hover:bg-white hover:text-slate-950 font-bold'
              }`}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>دخول مشرف معتمد</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === 'moderator' && (
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>اسم المستخدم للمشرف (Username):</span>
                </label>
                <div className="relative">
                  <input
                    id="moderator-username-input"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="اكتب اسم المستخدم هنا..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-white text-slate-900 font-bold text-sm sm:text-base placeholder:text-slate-400 shadow-xs transition-all outline-none"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  👤 اكتب اسم المستخدم المخصص لك من طرف الإدارة.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
                <KeyRound className={`w-4 h-4 ${loginMode === 'admin' ? 'text-blue-600' : 'text-indigo-600'}`} />
                <span>
                  {loginMode === 'admin' 
                    ? 'كلمة مرور المدير العام (Admin Password / PIN):' 
                    : 'الرمز السري أو كلمة مرور المشرف (PIN):'}
                </span>
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={loginMode === 'admin' ? 'اكتب كلمة المرور هنا...' : 'اكتب الرمز السري هنا...'}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm sm:text-base placeholder:text-slate-400 shadow-xs transition-all outline-none ${
                    loginMode === 'admin'
                      ? 'focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                      : 'focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100'
                  }`}
                  autoFocus={loginMode === 'admin'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-lg transition-colors"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                🔒 كلمة المرور الافتراضية للمدير العام: <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold text-xs">NADJIM92bejaia</code> (يمكن كتابتها بحروف كبيرة أو صغيرة)
              </p>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              className={`w-full py-3.5 text-white font-black rounded-xl text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer ${
                loginMode === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
              }`}
            >
              <KeyRound className="w-5 h-5" />
              <span>
                {loginMode === 'admin' ? 'تسجيل الدخول كمدير عام' : 'تسجيل دخول المشرف'}
              </span>
            </button>
          </form>

          {/* Google Sign In Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-300 w-full"></div>
            <span className="bg-white px-3 text-xs font-bold text-slate-500">أو</span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl text-xs sm:text-sm border-2 border-slate-300 shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>تسجيل الدخول باستخدام حساب Google</span>
          </button>

          {/* Return Back Button */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              onClick={handleGoHome}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold inline-flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة إلى الواجهة العامة للموقع</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-12 font-['Tajawal'] dir-rtl">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs sm:text-sm font-bold ${
          toast.type === 'error'
            ? 'bg-red-900 text-white border-red-700'
            : toast.type === 'info'
            ? 'bg-slate-900 text-white border-slate-700'
            : 'bg-emerald-900 text-white border-emerald-700'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 backdrop-blur-md flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">لوحة تحكم الإدارة</h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isSuperAdmin
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
              }`}>
                {isSuperAdmin ? 'المدير العام (Super Admin)' : `مشرف: ${adminSession?.name || 'محرر'}`}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              دليل الصحة لولاية الوادي • {entities.length} منشأة مسجلة
              {!isSuperAdmin && adminSession?.permissions && (
                <span className="mr-2 text-indigo-300 text-[11px]">
                  ({adminSession.permissions.length} صلاحيات مفعلة)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {canAdd && (
            <button
              id="admin-add-facility-btn"
              onClick={handleOpenAdd}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منشأة</span>
            </button>
          )}

          <button
            id="admin-export-quick-btn"
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="تصدير نسخة احتياطية"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">نسخة احتياطية</span>
          </button>

          <button
            id="admin-public-view-btn"
            onClick={handleGoHome}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            <span>معاينة الموقع</span>
          </button>

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 overflow-x-auto scrollbar-none flex gap-1">
        <button
          id="admin-tab-overview"
          onClick={() => setSubTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>نظرة عامة</span>
        </button>

        <button
          id="admin-tab-analytics"
          onClick={() => setSubTab('analytics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>إحصائيات الزيارات الحقيقية</span>
          <span className="px-1.5 py-0.2 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
            مباشر
          </span>
        </button>

        <button
          id="admin-tab-pending"
          onClick={() => setSubTab('pending')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
            subTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>الطلبات المعلقة</span>
          {pendingEntities.length > 0 && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              subTab === 'pending' ? 'bg-white text-amber-700' : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {pendingEntities.length}
            </span>
          )}
        </button>

        <button
          id="admin-tab-entities"
          onClick={() => setSubTab('entities')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'entities'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إدارة المنشآت ({entities.length})</span>
        </button>

        <button
          id="admin-tab-garde"
          onClick={() => setSubTab('garde')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'garde'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>صيدليات المناوبة ({stats.todayGardeCount} اليوم)</span>
        </button>

        <button
          id="admin-tab-moderators"
          onClick={() => setSubTab('moderators')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'moderators'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-500" />
          <span>إدارة المشرفين والصلاحيات</span>
        </button>

        <button
          id="admin-tab-backup"
          onClick={() => setSubTab('backup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            subTab === 'backup'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>النسخ والاستيراد</span>
        </button>

        {isSuperAdmin && (
          <button
            id="admin-tab-settings"
            onClick={() => setSubTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'settings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات الأمان</span>
          </button>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 0: PENDING SUBMISSIONS & APPROVALS */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'pending' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/80 shrink-0">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      الطلبات المعلقة وقيد المراجعة
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
                      {pendingEntities.length} طلب بانتظار التأكيد
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    المنشآت الطبية المقترحة من زوار الموقع للمراجعة والموافقة قبل نشرها في الدليل والخريطة
                  </p>
                </div>
              </div>

              {pendingEntities.length > 1 && (
                <button
                  onClick={async () => {
                    for (const item of pendingEntities) {
                      await handleApproveEntity(item);
                    }
                    showToast('تمت الموافقة على جميع الطلبات المعلقة بنجاح!', 'success');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>الموافقة على الكل ({pendingEntities.length})</span>
                </button>
              )}
            </div>

            {/* Pending List Grid */}
            {pendingEntities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingEntities.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-white border border-amber-200 shadow-2xs text-amber-700">
                            {item.type === 'صيدلية' ? (
                              <Pill className="w-5 h-5" />
                            ) : item.type === 'طبيب' ? (
                              <Stethoscope className="w-5 h-5" />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {item.type} {item.specialty ? `• ${item.specialty}` : ''}
                            </span>
                            <h3 className="text-base font-black text-slate-900 mt-1">
                              {item.name}
                            </h3>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 border border-amber-300/60 px-2 py-0.5 rounded-md shrink-0">
                          قيد المراجعة
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>بلدية {item.commune} - {item.address}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`tel:${item.phone}`} className="font-mono dir-ltr font-bold text-blue-600 hover:underline">
                            {item.phone}
                          </a>
                        </div>

                        {item.workingHours && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>ساعات العمل: {item.workingHours}</span>
                          </div>
                        )}

                        {item.latitude && item.longitude && (
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                            <span>إحداثيات GPS متوفرة</span>
                          </div>
                        )}
                      </div>

                      {item.notes && (
                        <div className="p-2.5 rounded-xl bg-white border border-amber-200/60 text-xs text-slate-600 space-y-0.5">
                          <span className="font-bold text-slate-700 block">ملاحظات مرسلة:</span>
                          <p>{item.notes}</p>
                        </div>
                      )}

                      {item.submittedAt && (
                        <span className="text-[10px] text-slate-400 block">
                          تاريخ الإرسال: {new Date(item.submittedAt).toLocaleDateString('ar-DZ')} {new Date(item.submittedAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-amber-200/80 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center gap-1"
                        title="رفض وحذف الطلب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>رفض وحذف</span>
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                        title="تعديل البيانات قبل النشر"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleApproveEntity(item)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>موافقة ونشر في الدليل</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">لا توجد أي طلبات معلقة حالياً</h3>
                  <p className="text-xs text-slate-500">
                    جميع المنشآت الطبية المضافة تمت مراجعتها وهي منشورة ومعتمدة في الدليل والخريطة.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* KPI Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">إجمالي المنشآت</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</p>
              <span className="text-[11px] text-slate-400 block">شاملة كافة المرافق المسجلة</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">الصيدليات</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.pharmaciesCount}</p>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {stats.todayGardeCount} مناوبة اليوم
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">صيدليات معتمدة في الولاية</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">الأطباء والعيادات</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{stats.doctorsCount}</p>
              <span className="text-[11px] text-slate-400 block">تخصصات طبية متعددة</span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">المستشفيات والمصحات</span>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-600">{stats.hospitalsCount}</p>
              <span className="text-[11px] text-slate-400 block">خدمة استعجالات 24/24</span>
            </div>
          </div>

          {/* Visual Analytics & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Communes Distribution */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">توزيع المنشآت حسب البلديات الأكثر كثافة</h3>
                </div>
                <span className="text-xs text-slate-400">{COMMUNES.length - 1} بلدية مغطاة</span>
              </div>

              <div className="space-y-3 pt-1">
                {stats.topCommunes.map(([commune, count]) => {
                  const percentage = Math.round((count / stats.total) * 100);
                  return (
                    <div key={commune} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">بلدية {commune}</span>
                        <span className="text-slate-500 font-medium">{count} منشأة ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality & Audit Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">مؤشرات الجودة والبيانات</h3>
                </div>

                <div className="space-y-3.5 pt-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-bold">تغطية الإحداثيات الجغرافية (GPS)</span>
                      <span className="font-extrabold text-blue-600">{stats.gpsCoveragePercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${stats.gpsCoveragePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-bold">منشآت مضافة من المستخدمين</span>
                    <span className="font-bold text-amber-600 px-2 py-0.5 bg-amber-50 rounded border border-amber-200">
                      {stats.customCount} منشأة
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-600 font-bold">صيدليات ذات مناوبة مسجلة</span>
                    <span className="font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                      {entities.filter(e => e.garde_days && e.garde_days.length > 0).length} صيدلية
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSubTab('entities')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>استعراض وإدارة جميع المنشآت</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: ENTITIES MANAGER (FULL CRUD TABLE) */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'entities' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4 animate-in fade-in duration-200">
          
          {/* Controls & Search Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">سجل المنشآت الطبية</h2>
              <p className="text-xs text-slate-500">البحث والتعديل والإضافة والحذف مع التصفية الفورية</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منشأة جديدة</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
                title="تصدير جدول CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">تصدير CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، العنوان، الهاتف..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Type Select */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="الكل">جميع الأنواع (صيدليات، أطباء، مستشفيات)</option>
              <option value="صيدلية">صيدلية</option>
              <option value="طبيب">طبيب</option>
              <option value="مستشفى">مستشفى</option>
              <option value="عيادة">عيادة</option>
            </select>

            {/* Commune Select */}
            <select
              value={communeFilter}
              onChange={(e) => setCommuneFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="الكل">جميع بلديات الولاية</option>
              {COMMUNES.filter(c => c !== 'الكل').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Status Quick Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">جميع الحالات</option>
              <option value="withGarde">الصيدليات ذات المناوبة</option>
              <option value="custom">المضافة يدوياً (مخصصة)</option>
              <option value="default">الافتراضية المعتمدة</option>
              <option value="withoutGps">المرافق بدون إحداثيات GPS</option>
            </select>
          </div>

          {/* Active Filters / Result Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 px-1">
            <span>تم العثور على <strong>{filteredEntities.length}</strong> من أصل {entities.length} منشأة</span>
            {(searchQuery || typeFilter !== 'الكل' || communeFilter !== 'الكل' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('الكل');
                  setCommuneFilter('الكل');
                  setStatusFilter('all');
                }}
                className="text-blue-600 hover:underline font-bold"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">المنشأة الطبية</th>
                  <th className="p-3.5 whitespace-nowrap">النوع والتخصص</th>
                  <th className="p-3.5 whitespace-nowrap">البلدية والعنوان</th>
                  <th className="p-3.5 whitespace-nowrap">الهاتف</th>
                  <th className="p-3.5 whitespace-nowrap">المناوبة</th>
                  <th className="p-3.5 whitespace-nowrap">الموقع GPS</th>
                  <th className="p-3.5 text-center whitespace-nowrap">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      لا توجد منشآت تطابق خيارات البحث المحددة.
                    </td>
                  </tr>
                ) : (
                  filteredEntities.map((item) => {
                    const isCustom = item.id.startsWith('custom-');
                    const hasGarde = item.garde_days && item.garde_days.length > 0;
                    const hasGps = Boolean(item.latitude && item.longitude);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Name */}
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </div>
                          {isCustom && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 inline-block mt-0.5">
                              مضاف محلياً
                            </span>
                          )}
                        </td>

                        {/* Type & Specialty */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            item.type === 'صيدلية'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.type === 'طبيب'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {item.type}
                          </span>
                          {item.specialty && (
                            <span className="block text-[10px] text-slate-500 mt-1 font-medium">
                              {item.specialty}
                            </span>
                          )}
                        </td>

                        {/* Commune & Address */}
                        <td className="p-3.5 max-w-xs">
                          <span className="font-bold text-slate-800">بلدية {item.commune}</span>
                          <span className="block text-[11px] text-slate-500 truncate" title={item.address}>
                            {item.address}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="p-3.5 whitespace-nowrap font-mono text-slate-700 font-bold dir-ltr text-right">
                          <a href={`tel:${item.phone.replace(/\s+/g, '')}`} className="hover:text-blue-600 transition-colors">
                            {item.phone}
                          </a>
                        </td>

                        {/* Garde Status */}
                        <td className="p-3.5 whitespace-nowrap">
                          {item.type === 'صيدلية' ? (
                            hasGarde ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                {item.garde_days?.length} أيام مناوبة
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">غير مسجل</span>
                            )
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* GPS Coordinates */}
                        <td className="p-3.5 whitespace-nowrap">
                          {hasGps ? (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1 w-fit">
                              <MapPin className="w-3 h-3 text-blue-600" />
                              <span>محدد</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              غير محدد
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {onViewOnMap && hasGps && (
                              <button
                                onClick={() => onViewOnMap(item)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="عرض على الخريطة"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              id={`admin-edit-btn-${item.id}`}
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="تعديل البيانات"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              id={`admin-delete-btn-${item.id}`}
                              onClick={() => setDeletingId(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف المنشأة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 3: GARDE PLANNER (ON-DUTY MATRIX) */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'garde' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">مخطط وجدول مناوبات الصيدليات</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تحديد الصيدليات المناوبة لكل يوم من أيام الأسبوع في ولاية الوادي وتفعيلها بنقرة واحدة
            </p>
          </div>

          {/* Days of Week Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayPharmacies = entities.filter(
                e => e.type === 'صيدلية' && e.garde_days?.includes(day.id)
              );
              const isToday = new Date().getDay() === day.id;

              return (
                <div 
                  key={day.id} 
                  className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between ${
                    isToday 
                      ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20' 
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">يوم {day.name}</span>
                        {isToday && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                            اليوم الحـالي
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {dayPharmacies.length} صيدليات
                      </span>
                    </div>

                    {/* Pharmacy List for this day */}
                    <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto">
                      {dayPharmacies.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">
                          لا توجد صيدليات مخصصة لهذا اليوم
                        </p>
                      ) : (
                        dayPharmacies.map(pharmacy => (
                          <div
                            key={pharmacy.id}
                            className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="truncate">
                              <span className="font-bold text-slate-800 block truncate">{pharmacy.name}</span>
                              <span className="text-[10px] text-slate-500">{pharmacy.commune}</span>
                            </div>
                            <button
                              onClick={() => handleQuickToggleGarde(pharmacy.id, day.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="إزالة من هذا اليوم"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add pharmacy to this day selector */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleQuickToggleGarde(e.target.value, day.id);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="w-full text-xs py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="" disabled>+ إضافة صيدلية ليوم {day.name}...</option>
                      {entities
                        .filter(e => e.type === 'صيدلية' && !e.garde_days?.includes(day.id))
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.commune})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB: REAL-TIME SITE ANALYTICS */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'analytics' && (
        <AdminAnalyticsTab isSuperAdmin={isSuperAdmin} onShowToast={showToast} />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB: MODERATORS & PERMISSIONS MANAGEMENT */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'moderators' && (
        <AdminModeratorsTab isSuperAdmin={isSuperAdmin} onShowToast={showToast} />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 4: BACKUP, IMPORT & EXPORT */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'backup' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Firebase Cloud Firestore Real-time Sync Card */}
          <div className="bg-gradient-to-r from-amber-900/90 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-amber-500/30 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Cloud className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">سحابة Firebase Firestore السحابية</h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CloudCheck className="w-3 h-3" />
                      <span>متصل ومفعل</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    مشروع: <code className="text-amber-300 font-mono">tokyo-quest-47c1c</code> • منطقة الخادم: <code className="text-amber-300 font-mono">europe-west1</code>
                  </p>
                </div>
              </div>

              <button
                id="admin-sync-firebase-btn"
                onClick={handleSyncToFirebase}
                disabled={isSyncingToCloud}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
              >
                {isSyncingToCloud ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ المزامنة السحابية...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>مزامنة كافة البيانات إلى Firebase الآن ({entities.length} منشأة)</span>
                  </>
                )}
              </button>
            </div>

            {currentUser && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>المستخدم الحالي: <strong>{currentUser.displayName || currentUser.email}</strong></span>
                </span>
                <button
                  onClick={async () => {
                    await logoutUser();
                    showToast('تم تسجيل الخروج من حساب Google', 'info');
                  }}
                  className="text-amber-300 hover:underline font-bold"
                >
                  تسجيل الخروج من Google
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">تصدير وحفظ البيانات</h3>
                  <p className="text-xs text-slate-500">حفظ نسخة احتياطية من قاعدة البيانات على جهازك</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  id="admin-export-json-btn"
                  onClick={handleExportJSON}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-right transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FileJson className="w-6 h-6 text-blue-600" />
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-blue-700 block">
                        تصدير كملف JSON كامل
                      </span>
                      <span className="text-[11px] text-slate-500">يتضمن كافة الإحداثيات وأيام المناوبة والتفاصيل</span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>

                <button
                  id="admin-export-csv-btn"
                  onClick={handleExportCSV}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-right transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-emerald-700 block">
                        تصدير كجدول إكسل (CSV)
                      </span>
                      <span className="text-[11px] text-slate-500">مناسب للفتح في Excel أو Google Sheets</span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">استيراد واستعادة البيانات</h3>
                  <p className="text-xs text-slate-500">رفع ملف JSON لاستعادة البيانات المحفوظة</p>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportJSON}
                  accept=".json"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-indigo-700">
                    اضغط لاختيار ملف JSON للرفع
                  </span>
                  <span className="text-[11px] text-slate-400">يدعم ملفات النسخ الاحتياطي الخاصة بالدليل</span>
                </button>
              </div>
            </div>

          </div>

          {/* Reset / Restore Defaults Alert Card */}
          <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 text-red-600 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-900">إعادة ضبط قاعدة البيانات إلى الحالة الافتراضية</h4>
                <p className="text-xs text-red-700 mt-0.5">
                  سيتم مسح كافة المنشآت المضافة محلياً واستعادة البيانات الأصلية لولاية الوادي.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط قاعدة البيانات إلى حالتها الأصلية؟')) {
                  onResetToDefaults();
                  showToast('تمت استعادة قاعدة البيانات الافتراضية بنجاح', 'info');
                }
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
            >
              استعادة الافتراضيات
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 5: SECURITY SETTINGS */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'settings' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">تغيير كلمة مرور الإدارة</h3>
              <p className="text-xs text-slate-500">حماية لوحة التحكم برمز سري جديد</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور الحالية:
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الحالية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                كلمة المرور الجديدة:
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة مرور جديدة (4 أحرف/أرقام كحد أدنى)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تأكيد كلمة المرور الجديدة:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة المرور للتأكيد..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              حفظ كلمة المرور الجديدة
            </button>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT ENTITY MODAL */}
      {/* ----------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs font-['Tajawal'] dir-rtl">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 text-right">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  {editingEntity ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingEntity ? `تعديل بيانات: ${editingEntity.name}` : 'إضافة منشأة طبية جديدة'}
                  </h3>
                  <p className="text-xs text-blue-100">دليل ولاية الوادي الطبي</p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields Body */}
            <form onSubmit={handleSaveEntity} className="p-6 overflow-y-auto space-y-4 grow">
              
              {/* Type and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نوع المنشأة *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as HealthEntityType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="صيدلية">صيدلية</option>
                    <option value="طبيب">طبيب عيادة خاصة</option>
                    <option value="مستشفى">مستشفى</option>
                    <option value="عيادة">عيادة متعددة الخدمات / مصحة</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المنشأة / الطبيب *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: صيدلية الأمل، د. فلان بن فلان..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Specialty (If Doctor or Clinic) */}
              {(formData.type === 'طبيب' || formData.type === 'عيادة') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    التخصص الطبي
                  </label>
                  <select
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">اختر التخصص...</option>
                    {SPECIALTIES.filter(s => s !== 'الكل').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Commune and Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    البلدية *
                  </label>
                  <select
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {COMMUNES.filter(c => c !== 'الكل').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="مثال: حي الشط، قرب المسجد العتيق..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم الهاتف الرئيسي *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="مثال: 029 21 34 56 أو 0661..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dir-ltr text-right"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم هاتف إضافي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryPhone || ''}
                    onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                    placeholder="رقم ثانوي..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 dir-ltr text-right"
                  />
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  أوقات العمل
                </label>
                <input
                  type="text"
                  value={formData.workingHours || ''}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="مثال: 08:00 - 20:00 أو 24/24..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* GPS Coordinates Section */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>الإحداثيات الجغرافية (GPS)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1 shadow-2xs"
                  >
                    <LocateFixed className="w-3 h-3 text-blue-600" />
                    <span>تحديد موقعي الآن</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">خط العرض (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || undefined })}
                      placeholder="33.3683"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">خط الطول (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || undefined })}
                      placeholder="6.8674"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* On-Duty Days Selector (Only for Pharmacies) */}
              {formData.type === 'صيدلية' && (
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>أيام المناوبة الأسبوعية (Garde)</span>
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      {formData.garde_days?.length || 0} أيام محددة
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((d) => {
                      const isSelected = formData.garde_days?.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleToggleGardeDay(d.id)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {d.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="معلومات إضافية، معالم قريبة، خدمات خاصة..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
                >
                  {editingEntity ? 'حفظ التعديلات' : 'إضافة المنشأة الآن'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ----------------------------------------------------------------- */}
      {deletingId && entityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs font-['Tajawal'] dir-rtl">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">تأكيد حذف المنشأة الطبية</h3>
              <p className="text-xs text-slate-500">
                هل أنت متأكد من رغبتك في حذف <strong>"{entityToDelete.name}"</strong> من قاعدة البيانات؟
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
