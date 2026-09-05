export type HealthEntityType = 'صيدلية' | 'طبيب' | 'مستشفى' | 'عيادة';

export interface HealthEntity {
  id: string;
  name: string;
  type: HealthEntityType;
  specialty?: string;
  commune: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  /** Days of week (0: الأحد, 1: الإثنين, 2: الثلاثاء, 3: الأربعاء, 4: الخميس, 5: الجمعة, 6: السبت) */
  garde_days?: number[];
  /** Specific dates formatted as YYYY-MM-DD for on-duty rotation */
  garde_dates?: string[];
  garde_shift?: 'ليلية (20:00 - 08:00)' | 'كامل اليوم (24/24)' | 'نهارية وعطلة (08:00 - 20:00)';
  latitude?: number;
  longitude?: number;
  workingHours?: string;
  isEmergency?: boolean;
  notes?: string;
  status?: 'approved' | 'pending';
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActiveTab = 'home' | 'map' | 'pharmacies' | 'garde' | 'doctors' | 'hospitals' | 'admin';

export interface FilterState {
  searchQuery: string;
  commune: string;
  specialty: string;
  gardeDate: string; // YYYY-MM-DD
}

export type ModeratorPermission =
  | 'can_edit_entities'     // تعديل المنشآت
  | 'can_publish_entities'  // نشر وتفعيل الطلبات الجديدة
  | 'can_manage_garde'      // إدارة وجدولة صيدليات المناوبة
  | 'can_add_entities'      // إضافة منشآت طبية جديدة
  | 'can_delete_entities';  // حذف منشأة

export interface ModeratorUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  permissions: ModeratorPermission[];
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  notes?: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  moderator?: ModeratorUser;
  name?: string;
  role?: string;
  permissions?: ModeratorPermission[];
}

export interface VisitEvent {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  tab: ActiveTab | string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  visitorId: string;
  isNewVisitor: boolean;
}

export interface SiteAnalytics {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  dailyVisits: Record<string, number>;
  tabVisits: Record<string, number>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  recentVisits: VisitEvent[];
  lastUpdated: string;
}

