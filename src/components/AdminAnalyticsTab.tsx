import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  RefreshCw,
  Download,
  Trash2,
  Activity,
  Globe,
  Compass,
  TrendingUp,
  Sparkles,
  Layers,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SiteAnalytics, VisitEvent } from '../types';
import {
  getLocalAnalytics,
  subscribeToAnalytics,
  resetAnalyticsInCloud
} from '../utils/analyticsManager';

interface AdminAnalyticsTabProps {
  isSuperAdmin: boolean;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const TAB_NAMES_AR: Record<string, { name: string; icon: string; color: string }> = {
  home: { name: 'الصفحة الرئيسية', icon: '🏠', color: 'bg-blue-500' },
  garde: { name: 'صيدليات المناوبة', icon: '⏰', color: 'bg-emerald-500' },
  doctors: { name: 'دليل الأطباء', icon: '🩺', color: 'bg-indigo-500' },
  pharmacies: { name: 'دليل الصيدليات', icon: '💊', color: 'bg-teal-500' },
  hospitals: { name: 'المستشفيات والعيادات', icon: '🏥', color: 'bg-rose-500' },
  map: { name: 'الخريطة التفاعلية', icon: '🗺️', color: 'bg-amber-500' },
  admin: { name: 'لوحة التحكم', icon: '⚙️', color: 'bg-slate-500' },
};

export const AdminAnalyticsTab: React.FC<AdminAnalyticsTabProps> = ({
  isSuperAdmin,
  onShowToast,
}) => {
  const [analytics, setAnalytics] = useState<SiteAnalytics>(() => getLocalAnalytics());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<'all' | '7days' | '30days'>('7days');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAnalytics((updated) => {
      setAnalytics(updated);
    });
    return () => unsub();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    const fresh = getLocalAnalytics();
    setAnalytics(fresh);
    setTimeout(() => {
      setIsRefreshing(false);
      onShowToast('تم تحديث إحصائيات الزيارات الحية بنجاح!', 'success');
    }, 600);
  };

  const handleExportAnalyticsCSV = () => {
    try {
      const headers = ['المعرف', 'التاريخ', 'الوقت', 'القسم / الصفحة', 'نوع الجهاز', 'المتصفح', 'معرف الزائر', 'زائر جديد'];
      const rows = (analytics.recentVisits || []).map(v => [
        `"${v.id}"`,
        `"${v.date}"`,
        `"${new Date(v.timestamp).toLocaleTimeString('ar-DZ')}"`,
        `"${TAB_NAMES_AR[v.tab]?.name || v.tab}"`,
        `"${v.device === 'mobile' ? 'هاتف' : v.device === 'desktop' ? 'كمبيوتر' : 'لوحي'}"`,
        `"${v.browser}"`,
        `"${v.visitorId}"`,
        `"${v.isNewVisitor ? 'نعم' : 'لا'}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eloued-health-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      onShowToast('تم تصدير سجل الزيارات بصيغة CSV بنجاح!');
    } catch (e) {
      onShowToast('تعذر تصدير الإحصائيات!', 'error');
    }
  };

  const handleConfirmReset = async () => {
    await resetAnalyticsInCloud();
    setIsResetConfirmOpen(false);
    onShowToast('تمت إعادة تصفير إحصائيات الزيارات بنجاح', 'info');
  };

  // Calculations for daily breakdown
  const dailyVisitsMap: Record<string, number> = analytics.dailyVisits || {};
  const dailyEntries: [string, number][] = (Object.entries(dailyVisitsMap) as [string, number][])
    .sort((a, b) => b[0].localeCompare(a[0])) // latest first
    .slice(0, filterPeriod === '7days' ? 7 : filterPeriod === '30days' ? 30 : 50);

  const maxDailyVisit: number = Math.max(...dailyEntries.map(e => Number(e[1])), 1);

  // Tab Breakdown calculations
  const tabVisitsMap: Record<string, number> = analytics.tabVisits || {};
  const totalTabVisits: number = Object.values(tabVisitsMap).reduce((a: number, b: number) => a + Number(b), 0) || 1;
  const sortedTabs: [string, number][] = (Object.entries(tabVisitsMap) as [string, number][])
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  // Device Breakdown calculations
  const totalDeviceVisits = (analytics.deviceStats.mobile || 0) + (analytics.deviceStats.desktop || 0) + (analytics.deviceStats.tablet || 0) || 1;
  const mobilePct = Math.round(((analytics.deviceStats.mobile || 0) / totalDeviceVisits) * 100);
  const desktopPct = Math.round(((analytics.deviceStats.desktop || 0) / totalDeviceVisits) * 100);
  const tabletPct = Math.round(((analytics.deviceStats.tablet || 0) / totalDeviceVisits) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Top Header & Action Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                إحصائيات وعدد الزيارات الحقيقية
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                مباشر (Live)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تتبع فوري ودقيق لحركة زوار دليل الصحة لولاية الوادي ومعدل التفاعل مع الأقسام
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="تحديث البيانات لحظياً"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleExportAnalyticsCSV}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير التقرير (CSV)</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
              title="إعادة تصفير العدادات"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">تصفير الإحصائيات</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Main Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Visits */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200">إجمالي الزيارات الكلية</span>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {(analytics.totalVisits || 0).toLocaleString('ar-DZ')}
            </div>
            <p className="text-[11px] text-blue-200/80 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>إجمالي مشاهدات وتفاعلات الموقع</span>
            </p>
          </div>
        </div>

        {/* Card 2: Today's Visits */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">زيارات اليوم (اليوم الحالي)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-600 font-mono">
              {(analytics.todayVisits || 0).toLocaleString('ar-DZ')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>حركة الزوار خلال الـ 24 ساعة الماضية</span>
            </p>
          </div>
        </div>

        {/* Card 3: Unique Visitors */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">الزوار الفريدون (Unique)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-purple-700 font-mono">
              {(analytics.uniqueVisitors || 0).toLocaleString('ar-DZ')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              مستخدمين مميزين بأجهزة وهواتف مختلفة
            </p>
          </div>
        </div>

        {/* Card 4: Mobile Share */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مستخدمي الهواتف الذكية</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-mono">
              {mobilePct}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {analytics.deviceStats.mobile || 0} زيارة عبر الهواتف المحمولة
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Daily Visits Chart + Popular Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Daily Visits Trend & Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>سجل الزيارات اليومية وتطور الحركة</span>
              </h3>
              <p className="text-xs text-slate-500">مقارنة عدد الزيارات المسجلة يومياً في ولاية الوادي</p>
            </div>

            {/* Time Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterPeriod('7days')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterPeriod === '7days' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600'
                }`}
              >
                آخر 7 أيام
              </button>
              <button
                onClick={() => setFilterPeriod('30days')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterPeriod === '30days' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600'
                }`}
              >
                آخر 30 يوم
              </button>
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterPeriod === 'all' ? 'bg-white text-blue-600 shadow-2xs font-extrabold' : 'text-slate-600'
                }`}
              >
                الكل
              </button>
            </div>
          </div>

          {/* Daily Bar Chart */}
          <div className="space-y-3 pt-2">
            {dailyEntries.length > 0 ? (
              dailyEntries.map(([dateKey, count]) => {
                const numericCount = Number(count);
                const pct = Math.min(Math.round((numericCount / maxDailyVisit) * 100), 100);
                const isToday = dateKey === new Date().toISOString().split('T')[0];
                return (
                  <div key={dateKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-1.5 font-mono">
                        {dateKey}
                        {isToday && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md font-sans">
                            اليوم
                          </span>
                        )}
                      </span>
                      <span className="text-slate-900 font-mono font-black">
                        {numericCount.toLocaleString('ar-DZ')} زيارة
                      </span>
                    </div>

                    {/* Bar Line */}
                    <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isToday
                            ? 'bg-gradient-to-l from-emerald-500 to-teal-400 shadow-xs'
                            : 'bg-gradient-to-l from-blue-600 to-indigo-500'
                        }`}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                لا توجد سجلات يومية كافية حتى الآن. الزيارات تسجل لحظياً عند تصفح الموقع.
              </div>
            )}
          </div>
        </div>

        {/* Most Visited Sections (1 Col) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>الأقسام الأكثر زيارة</span>
            </h3>
            <p className="text-xs text-slate-500">توزيع الزيارات حسب الصفحات المفضلة</p>
          </div>

          <div className="space-y-3.5">
            {sortedTabs.map(([tabKey, count]) => {
              const tabMeta = TAB_NAMES_AR[tabKey] || { name: tabKey, icon: '📄', color: 'bg-slate-500' };
              const numericCount = Number(count);
              const pct = Math.round((numericCount / totalTabVisits) * 100);
              return (
                <div key={tabKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 flex items-center gap-1.5">
                      <span>{tabMeta.icon}</span>
                      <span>{tabMeta.name}</span>
                    </span>
                    <span className="text-slate-600 font-mono">
                      {numericCount} ({pct}%)
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tabMeta.color}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Device Breakdown Summary */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-600" />
              <span>أنواع الأجهزة المستخدمة:</span>
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-0.5">
                <Smartphone className="w-4 h-4 text-blue-600 mx-auto" />
                <span className="block text-[11px] font-bold text-slate-700">هواتف</span>
                <span className="font-mono font-black text-blue-700">{mobilePct}%</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
                <Monitor className="w-4 h-4 text-slate-600 mx-auto" />
                <span className="block text-[11px] font-bold text-slate-700">حواسيب</span>
                <span className="font-mono font-black text-slate-700">{desktopPct}%</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-0.5">
                <Tablet className="w-4 h-4 text-purple-600 mx-auto" />
                <span className="block text-[11px] font-bold text-slate-700">أجهزة لوحية</span>
                <span className="font-mono font-black text-purple-700">{tabletPct}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Live Recent Activity Stream Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>سجل أحدث الزيارات المباشرة (Live Visitor Stream)</span>
            </h3>
            <p className="text-xs text-slate-500">آخر التفاعلات المسجلة على الموقع مع التوقيت ونوع الجهاز</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/60">
            أحدث {analytics.recentVisits?.length || 0} زيارة
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">الوقت والتاريخ</th>
                <th className="p-3">الصفحة / القسم</th>
                <th className="p-3">الجهاز</th>
                <th className="p-3">المتصفح</th>
                <th className="p-3">نوع الزائر</th>
                <th className="p-3">معرف الجلسة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {analytics.recentVisits && analytics.recentVisits.length > 0 ? (
                analytics.recentVisits.map((event) => {
                  const tabMeta = TAB_NAMES_AR[event.tab] || { name: event.tab, icon: '📄', color: 'bg-slate-500' };
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-600">
                        <div>{new Date(event.timestamp).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                        <div className="text-[10px] text-slate-400">{event.date}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{tabMeta.icon}</span>
                          <span>{tabMeta.name}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                          {event.device === 'mobile' ? (
                            <><Smartphone className="w-3 h-3 text-blue-600" /> هاتف</>
                          ) : event.device === 'desktop' ? (
                            <><Monitor className="w-3 h-3 text-indigo-600" /> كمبيوتر</>
                          ) : (
                            <><Tablet className="w-3 h-3 text-purple-600" /> لوحي</>
                          )}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {event.browser}
                      </td>
                      <td className="p-3">
                        {event.isNewVisitor ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-[10px]">
                            زائر جديد ✨
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                            زائر متكرر
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {event.visitorId.substring(0, 14)}...
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    لا توجد زيارات مسجلة بعد. عند تصفح الزوار للموقع ستظهر فوراً في هذا الجدول.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Confirmation Modal for Stats Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">هل أنت متأكد من تصفير إحصائيات الزيارات؟</h3>
              <p className="text-xs text-slate-500">
                سيتم إعادة ضبط عداد الزيارات الكلية واليومية إلى الصفر ومسح سجل الزيارات السابقة في السحابة.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                نعم، تصفير الإحصائيات
              </button>
              <button
                onClick={() => setIsResetConfirmOpen(false)}
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
