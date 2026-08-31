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
  authenticateAdminCredentialsAsync,
  fetchRemoteModerators,
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
    // Pre-fetch moderators from Firestore into local cache
    fetchRemoteModerators().catch(console.warn);

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

  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Authentication Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      const cleanPass = passwordInput.trim();
      const cleanUser = usernameInput.trim();

      const session = await authenticateAdminCredentialsAsync({
        username: cleanUser,
        password: cleanPass,
      });

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
        setAuthError('بيانات الدخول غير صحيحة أو تم تجميد الحساب. يرجى التحقق من صحة اسم المستخدم وكلمة المرور.');
      }
    } catch (err: any) {
      setAuthError('حدث خطأ أثناء التحقق من بيانات الدخول.');
    } finally {
      setIsSubmittingAuth(false);
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
    const approvedEntities = entities.filter(e => 