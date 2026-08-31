# 🏥 دليل الصحة - ولاية الوادي (39) | El-Oued Health Guide

منصة رقمية متكاملة وتطبيق ويب تقدمي (PWA) مخصص لخدمات الرعاية الصحية والطبية في ولاية الوادي بالجزائر. يتيح للمواطنين والزوار البحث الفوري عن الصيدليات المناوبة ليلاً ونهاراً، الأطباء بمختلف التخصصات، والمستشفيات والمراكز الصحية مع تحديد المواقع والمسارات المباشرة عبر الخرائط التفاعلية.

---

## 🌟 الميزات الرئيسية (Key Features)

- ⏰ **جدول صيدليات المناوبة (Pharmacies On-Duty / Garde)**:
  - عرض فوري لصيدليات المناوبة النهارية والليلية لليوم الحالي وكل أيام الأسبوع.
  - حساب تلقائي للحالة (مفتوح الآن / مغلق) بالدقائق والساعات.
  - الاتصال الهاتفي المباشر وبدء التوجيه الجغرافي بنقرة واحدة.

- 🩺 **دليل الأطباء والعيادات التخصصية (Doctors & Clinics Directory)**:
  - أكثر من 25 تخصصاً طبياً (أمراض القلب، طب الأطفال، العيون، النساء والتوليد، جراحة الأسنان، الطب العام...).
  - تصفية متقدمة حسب البلدية، الحي/المنطقة، التخصص، وساعات العمل.

- 🏥 **المستشفيات والمرافق الاستعجالية 24/24 (Hospitals & Emergency)**:
  - دليل المستشفيات العمومية والعيادات الخاصة ومراكز تصفية الدم والأشعة والتحاليل.
  - شريط أرقام الطوارئ السريع (الحماية المدنية 14، الشرطة 17، الدرك الوطني 1055).

- 🗺️ **الخريطة التفاعلية ونظام التوجيه (Interactive GPS Map & Navigation)**:
  - خريطة تفاعلية بدون مفاتيح خارجية مع إمكانية التبديل بين وضع الخريطة العادية والقمر الصناعي.
  - قياس المسافة المباشرة بين موقع المستخدم والمرفق الطبي بالكيلومتر والمتر.
  - توجيه مباشر نحو خرائط Google Maps وتطبيق Waze أو التصفح داخل التطبيق.

- 📱 **تجربة تطبيق أصلي وتثبيت PWA (Progressive Web App)**:
  - شريط تنقل سفلي مريح للإبهام (Bottom Navigation Bar) مخصص لشاشات الهواتف.
  - دعم كامل للعمل دون اتصال بالإنترنت (Offline First).
  - إمكانية التثبيت المباشر على الشاشة الرئيسية للهاتف أو سطح المكتب بنقرة واحدة.

- 🧹 **إدارة ومسح دوري للذاكرة المحلية (LocalStorage Auto-Cleanup & Background Sync)**:
  - فحص وتنظيف تلقائي للبيانات القديمة وغير الصالحة في متصفح المستخدم (`localStorage`).
  - تحديث خفيف للبيانات في الخلفية دون استهلاك موارد الجهاز أو بطارية الهاتف.
  - حماية من امتلاء مساحة التخزين (Storage Quota Protection).

- ☁️ **المزامنة السحابية وقاعدة البيانات (Firebase Firestore & Auth)**:
  - مزامنة فورية في الوقت الفعلي مع قاعدة بيانات Firebase Firestore.
  - إمكانية إضافة المرافق الصحية وتدقيقها من خلال لوحة تحكم المشرف.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Mobile-First, RTL Arabic Support)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **Mapping & Geolocation**: OpenStreetMap, Leaflet, Geolocation API
- **Offline & Service Worker**: Progressive Web App (PWA) with custom Cache-First & Stale-While-Revalidate Service Worker (`/public/sw.js`)
- **Storage Lifecycle**: Custom `storageManager` for Cache TTL & Garbage Collection

---

## 📁 هيكل المشروع (Project Structure)

```text
├── public/                     # Static assets, icons, manifest
│   ├── sw.js                   # Advanced Service Worker with multi-tier caching
│   ├── icon.svg                # Vector PWA icon
│   └── manifest.json           # Web App Manifest
├── src/
│   ├── components/             # UI Components
│   │   ├── Header.tsx          # Top navigation header & branding
│   │   ├── MobileBottomNav.tsx # App-like bottom bar for mobile devices
│   │   ├── MobileDrawer.tsx    # Slide-over navigation drawer
│   │   ├── HomeView.tsx        # Main dashboard & live statistics
│   │   ├── GardeView.tsx       # On-duty pharmacy schedule
│   │   ├── DoctorsView.tsx     # Doctors directory & search
│   │   ├── PharmaciesView.tsx  # All pharmacies directory
│   │   ├── HospitalsView.tsx   # 24/7 hospitals & medical centers
│   │   ├── MapView.tsx         # Interactive full-screen map
│   │   ├── InAppMapModal.tsx   # Modal map viewer
│   │   ├── DirectoryCard.tsx   # Unified medical entity card
│   │   ├── AdvancedFilterBar.tsx # Multi-criteria search & filtering
│   │   ├── AdminDashboard.tsx  # Administration & data moderation
│   │   ├── AddEntityModal.tsx  # User contribution form
│   │   ├── EmergencyModal.tsx  # Emergency contacts dialer
│   │   └── PwaInstallModal.tsx # PWA install prompt guide
│   ├── data/
│   │   └── mockData.ts         # Initial verified dataset for El-Oued
│   ├── lib/
│   │   └── firebase.ts         # Firebase SDK configuration & error handler
│   ├── services/
│   │   └── firebaseService.ts  # Firestore CRUD & Authentication helpers
│   ├── utils/
│   │   ├── filterUtils.ts      # Multi-criteria filtering logic
│   │   ├── geoUtils.ts         # Distance & coordinate calculations
│   │   ├── storageManager.ts   # LocalStorage auto-cleanup & cache lifecycle
│   │   └── serviceWorkerRegistration.ts # Service Worker registration & network listener
│   ├── types.ts                # Shared TypeScript types & interfaces
│   ├── App.tsx                 # Root application component & routing
│   └── main.tsx                # Application entry point
├── firestore.rules             # Secure Firestore security rules
├── firebase-blueprint.json     # Firebase collection schema blueprint
├── metadata.json               # AI Studio project metadata
├── package.json                # Project dependencies and scripts
└── vite.config.ts              # Vite build configuration
```

---

## ⚡ استراتيجية العمل بدون إنترنت (Offline-First & Service Worker)

يعتمد التطبيق على منظومة مزدوجة للعمل أوفلاين:
1. **Service Worker (`public/sw.js`)**:
   - **التهيئة والتحميل المسبق (Precache)**: تخزين هيكل التطبيق (HTML, CSS, JS, Manifest, Icons) فور التثبيت.
   - **استراتيجية Stale-While-Revalidate**: تقديم الأصول والخطوط وخرائط المعاينة فوراً من الكاش مع تحديثها بهدوء في الخلفية.
   - **استراتيجية التصفح دون اتصال (Navigation Fallback)**: تحويل جميع طلبات التنقل أثناء انقطاع الإنترنت إلى صفحة التطبيق المخزنة محلياً لضمان عدم ظهور شاشة الخطأ "No Internet".
2. **طبقة البيانات المحلية التلقائية (`storageManager.ts`)**:
   - حفظ كامل الصيدليات والأطباء وقوائم المناوبة التي تمت زيارتها في التخزين المحلي.
   - إشعار فوري وتلقائي في واجهة المستخدم عند انقطاع الاتصال يفيد بأن البيانات متاحة ومحفوظة بالكامل.

---

## 🚀 التشغيل والتطوير المحلي (Getting Started)

### المتطلبات (Prerequisites)
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- npm or yarn or bun

### خطوات التثبيت (Installation)

1. **استنساخ المشروع أو فك الضغط**:
   ```bash
   git clone <repository-url>
   cd eloued-health-guide
   ```

2. **تثبيت الحزم البرمجية (Install dependencies)**:
   ```bash
   npm install
   ```

3. **بدء خادم التطوير (Start development server)**:
   ```bash
   npm run dev
   ```

4. **بناء التطبيق للإنتاج (Build for production)**:
   ```bash
   npm run build
   ```

---

## ⚙️ آلية إدارة التخزين المؤقت (Storage Lifecycle & Cache)

يحتوي التطبيق على نظام ذكي مدمج في `src/utils/storageManager.ts`:
1. **التنظيف التلقائي عند بدء التشغيل**: إزالة المفاتيح والنسخ القديمة غير المستخدمة تلقائياً.
2. **الصيانة الدورية في الخلفية**: تشغيل فحص خفيف كل 30 دقيقة وعند عودة المستخدم للتبويب لتحرير الذاكرة.
3. **حماية التخزين المحلي**: في حال وصول المتصفح لحدود التخزين القصوى (`QuotaExceededError`)، يقوم التطبيق بتفريغ الذاكرة المؤقتة التالفة والاحتفاظ بالبيانات الضرورية فقط.

---

## 🌐 النشر على Vercel (Deploying to Vercel)

المشروع جاهز ومُهيأ بالكامل للنشر بنقرة واحدة على منصة **Vercel**:

### الطريقة الأولى: عبر GitHub و Vercel Dashboard (موصى بها)
1. قم برفع المشروع على حسابك في **GitHub**.
2. توجّه إلى [Vercel Dashboard](https://vercel.com/new).
3. اختر مستودع المشروع (Repository).
4. تأكد من إعدادات البناء الافتراضية:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. اضغط على **Deploy** وسيعمل التطبيق فوراً برابط مجاني سريع مع شهادة SSL.

### الطريقة الثانية: عبر Vercel CLI
```bash
npm i -g vercel
vercel
```

*(تم تضمين ملف `vercel.json` لضمان توجيه مسارات SPA بشكل سليم).*

---

## 📄 الترخيص (License)
هذا المشروع متاح للاستخدام العام ومخصص لخدمة سكان وزوار ولاية الوادي (الجزائر).
جميع الحقوق محفوظة © 2026 دليل الصحة - ولاية الوادي.
