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
}

export type ActiveTab = 'home' | 'map' | 'pharmacies' | 'garde' | 'doctors' | 'hospitals';

export interface FilterState {
  searchQuery: string;
  commune: string;
  specialty: string;
  gardeDate: string; // YYYY-MM-DD
}
