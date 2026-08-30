import { HealthEntity, HealthEntityType } from '../types';
import { COMMUNES, SPECIALTIES } from '../data/mockData';

export interface AdvancedFilterState {
  searchQuery: string;
  commune: string;
  neighborhood: string; // الحي أو المنطقة
  type: string; // 'الكل' | HealthEntityType
  specialty: string;
  onlyOnDuty: boolean; // مناوبة اليوم
  onlyEmergency: boolean; // استعجالات 24/24
  onlyWithGps: boolean; // يتوفر على موقع GPS
  onlyWithPhone: boolean; // يتوفر على هاتف
  sortBy: 'default' | 'name' | 'commune' | 'neighborhood';
}

export const INITIAL_FILTER_STATE: AdvancedFilterState = {
  searchQuery: '',
  commune: 'الكل',
  neighborhood: 'الكل',
  type: 'الكل',
  specialty: 'الكل',
  onlyOnDuty: false,
  onlyEmergency: false,
  onlyWithGps: false,
  onlyWithPhone: false,
  sortBy: 'default',
};

// Distinct list of popular neighborhoods/districts in El Oued province
export const NEIGHBORHOODS_BY_COMMUNE: Record<string, string[]> = {
  'الوادي': [
    'وسط المدينة',
    'حي 19 مارس',
    'حي تكسبت الغربية',
    'حي تكسبت الشرقية',
    'حي الرمال',
    'حي الشط',
    'حي الشهداء',
    'حي 08 ماي',
    'حي المجاهدين',
    'حي النزل',
    'حي الصحن',
    'حي الأصنام',
    'حي سيدي مستور',
    'حي باب الغربي',
    'طريق قمار',
    'شارع محمد خميستي',
    'شارع أول نوفمبر',
  ],
  'البياضة': [
    'وسط البياضة',
    'حي السوق',
    'شارع الشهداء',
    'حي المستقبل',
    'حي الفتح',
    'قرب مسجد الرحمة',
  ],
  'قمار': [
    'وسط مدينة قمار',
    'حي 20 أوت',
    'حي الزاوية التجانية',
    'حي الرمال',
    'حي النصر',
  ],
  'المقرن': [
    'وسط المقرن',
    'طريق المجمع التجاري',
    'طريق المستشفى',
    'حي النصر',
    'حي السلام',
  ],
  'الرباح': [
    'وسط الرباح',
    'حي المستقبل',
    'شارع فلسطين',
    'حي السلام',
  ],
  'حاسي خليفة': [
    'وسط حاسي خليفة',
    'شارع الاستقلال',
    'شارع الجمهورية',
    'حي الصحراء',
  ],
  'الدبيلة': [
    'وسط الدبيلة',
    'الشارع الرئيسي',
    'شارع الاستقلال',
    'حي السلام',
  ],
  'الرقيبة': [
    'وسط الرقيبة',
    'حي النصر',
    'الشارع الرئيسي',
  ],
  'الطالب العربي': [
    'وسط الطالب العربي',
    'طريق المركز الحدودي',
  ],
  'كوينين': [
    'المدخل الشمالي',
    'وسط كوينين',
    'حي النخيل',
  ],
  'تغزوت': [
    'وسط تغزوت',
    'قرب المسجد العتيق',
  ],
  'سيدي عون': [
    'وسط سيدي عون',
    'حي السلام',
  ],
  'وادي العلندة': [
    'وسط وادي العلندة',
    'الشارع الرئيسي',
  ],
  'ورماس': [
    'وسط ورماس',
  ],
  'النخلة': [
    'وسط النخلة',
  ],
  'العقلة': [
    'وسط العقلة',
  ],
};

// All unified distinct neighborhoods
export const ALL_POPULAR_NEIGHBORHOODS: string[] = [
  'وسط المدينة',
  'حي 19 مارس',
  'حي تكسبت',
  'حي الرمال',
  'حي الشط',
  'حي الشهداء',
  'حي 08 ماي',
  'حي المجاهدين',
  'حي السوق',
  'حي المستقبل',
  'حي النصر',
  'حي السلام',
  'حي النزل',
  'حي الصحن',
  'حي سيدي مستور',
  'حي باب الغربي',
  'شارع أول نوفمبر',
  'شارع الاستقلال',
];

/**
 * Extract or check neighborhood from address
 */
export function extractNeighborhoodFromAddress(address: string): string | null {
  if (!address) return null;
  
  for (const n of ALL_POPULAR_NEIGHBORHOODS) {
    if (address.toLowerCase().includes(n.toLowerCase())) {
      return n;
    }
  }

  // Regex pattern for Arabic "حي [كلمة]" or "شارع [كلمة]"
  const match = address.match(/(حي\s+[\u0621-\u064A0-9]+(?:\s+[\u0621-\u064A0-9]+)?)/);
  if (match && match[1]) {
    return match[1].trim();
  }

  return null;
}

/**
 * Dynamic neighborhoods extractor from all current entities
 */
export function getAvailableNeighborhoods(entities: HealthEntity[], selectedCommune: string = 'الكل'): string[] {
  const set = new Set<string>();

  // If a specific commune is selected, add predefined neighborhoods
  if (selectedCommune !== 'الكل' && NEIGHBORHOODS_BY_COMMUNE[selectedCommune]) {
    NEIGHBORHOODS_BY_COMMUNE[selectedCommune].forEach(n => set.add(n));
  } else {
    ALL_POPULAR_NEIGHBORHOODS.forEach(n => set.add(n));
  }

  // Also harvest from actual entities
  const relevantEntities = selectedCommune === 'الكل' 
    ? entities 
    : entities.filter(e => e.commune === selectedCommune);

  relevantEntities.forEach(e => {
    if (e.address) {
      for (const n of ALL_POPULAR_NEIGHBORHOODS) {
        if (e.address.includes(n)) {
          set.add(n);
        }
      }
    }
  });

  return Array.from(set);
}

/**
 * Service Types options with labels and icons info
 */
export const HEALTH_SERVICE_TYPES = [
  { id: 'الكل', label: 'جميع الخدمات الصحية', icon: 'all' },
  { id: 'صيدلية', label: 'صيدليات', icon: 'pill' },
  { id: 'طبيب', label: 'عيادات وأطباء متخصصون', icon: 'doctor' },
  { id: 'مستشفى', label: 'مستشفيات عمومية ومصحات', icon: 'hospital' },
  { id: 'عيادة', label: 'عيادات متعددة الخدمات (EPSP)', icon: 'clinic' },
];

/**
 * Check if an entity is on duty today
 */
export function isEntityOnDutyToday(entity: HealthEntity, todayOnDutyIds?: string[]): boolean {
  if (todayOnDutyIds && todayOnDutyIds.includes(entity.id)) return true;
  if (!entity.garde_days || entity.garde_days.length === 0) return false;
  const currentDay = new Date().getDay();
  return entity.garde_days.includes(currentDay);
}

/**
 * Filter health entities with comprehensive multi-criteria filter
 */
export function filterEntities(
  entities: HealthEntity[],
  filters: Partial<AdvancedFilterState>,
  options: {
    todayOnDutyIds?: string[];
    enforceType?: HealthEntityType;
    specificDateFormatted?: string; // YYYY-MM-DD
    specificDayOfWeek?: number; // 0 to 6
  } = {}
): HealthEntity[] {
  const {
    searchQuery = '',
    commune = 'الكل',
    neighborhood = 'الكل',
    type = 'الكل',
    specialty = 'الكل',
    onlyOnDuty = false,
    onlyEmergency = false,
    onlyWithGps = false,
    onlyWithPhone = false,
    sortBy = 'default',
  } = filters;

  const { todayOnDutyIds = [], enforceType, specificDateFormatted, specificDayOfWeek } = options;

  return entities.filter(item => {
    // Enforce fixed type if provided by parent tab (e.g. Pharmacies tab enforces 'صيدلية')
    if (enforceType && item.type !== enforceType) {
      return false;
    }

    // Type filter
    if (!enforceType && type !== 'الكل' && item.type !== type) {
      return false;
    }

    // Commune filter
    if (commune !== 'الكل' && item.commune !== commune) {
      return false;
    }

    // Neighborhood / District filter
    if (neighborhood !== 'الكل') {
      const address = (item.address || '').toLowerCase();
      const targetNeighborhood = neighborhood.toLowerCase();
      
      // Check exact inclusion or normalized substring
      const matchesNeighborhood = address.includes(targetNeighborhood) || 
        (targetNeighborhood.startsWith('حي ') && address.includes(targetNeighborhood.replace('حي ', ''))) ||
        (targetNeighborhood.startsWith('شارع ') && address.includes(targetNeighborhood.replace('شارع ', '')));

      if (!matchesNeighborhood) {
        return false;
      }
    }

    // Specialty filter
    if (specialty !== 'الكل') {
      if (!item.specialty || item.specialty !== specialty) {
        return false;
      }
    }

    // On-Duty filter (either for today or a specific scheduled date/day)
    if (onlyOnDuty) {
      if (specificDayOfWeek !== undefined || specificDateFormatted) {
        const matchesDay = specificDayOfWeek !== undefined && item.garde_days?.includes(specificDayOfWeek);
        const matchesDate = specificDateFormatted && item.garde_dates?.includes(specificDateFormatted);
        if (!matchesDay && !matchesDate) return false;
      } else {
        const onDuty = isEntityOnDutyToday(item, todayOnDutyIds);
        if (!onDuty) return false;
      }
    }

    // Emergency 24/24 filter
    if (onlyEmergency && !item.isEmergency && !item.garde_shift?.includes('24/24') && !item.workingHours?.includes('24/24')) {
      return false;
    }

    // GPS coordinate filter
    if (onlyWithGps && (!item.latitude || !item.longitude)) {
      return false;
    }

    // Phone filter
    if (onlyWithPhone && !item.phone) {
      return false;
    }

    // Search query (search in name, specialty, commune, address, notes, phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchAddress = item.address.toLowerCase().includes(q);
      const matchSpecialty = item.specialty ? item.specialty.toLowerCase().includes(q) : false;
      const matchCommune = item.commune.toLowerCase().includes(q);
      const matchNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
      const matchPhone = item.phone.includes(q) || (item.secondaryPhone ? item.secondaryPhone.includes(q) : false);

      if (!matchName && !matchAddress && !matchSpecialty && !matchCommune && !matchNotes && !matchPhone) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ar');
    }
    if (sortBy === 'commune') {
      return a.commune.localeCompare(b.commune, 'ar');
    }
    if (sortBy === 'neighborhood') {
      return a.address.localeCompare(b.address, 'ar');
    }
    return 0;
  });
}

/**
 * Calculate active filters count for badge display
 */
export function getActiveFiltersCount(filters: Partial<AdvancedFilterState>): number {
  let count = 0;
  if (filters.searchQuery?.trim()) count++;
  if (filters.commune && filters.commune !== 'الكل') count++;
  if (filters.neighborhood && filters.neighborhood !== 'الكل') count++;
  if (filters.type && filters.type !== 'الكل') count++;
  if (filters.specialty && filters.specialty !== 'الكل') count++;
  if (filters.onlyOnDuty) count++;
  if (filters.onlyEmergency) count++;
  if (filters.onlyWithGps) count++;
  if (filters.onlyWithPhone) count++;
  if (filters.sortBy && filters.sortBy !== 'default') count++;
  return count;
}

export const countActiveFilters = getActiveFiltersCount;
