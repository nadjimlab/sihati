import { HealthEntity } from '../types';

/**
 * Exports data to CSV file with UTF-8 BOM for Arabic compatibility in Excel
 */
export function exportEntitiesToCSV(entities: HealthEntity[], filename = 'دليل_اطباء_ولاية_الوادي.csv') {
  const headers = ['الاسم', 'التخصص', 'النوع', 'البلدية', 'العنوان / الحي', 'رقم الهاتف الرئيسي', 'رقم الهاتف الثانوي', 'أوقات العمل', 'ملاحظات إضافية'];

  const rows = entities.map(e => [
    `"${(e.name || '').replace(/"/g, '""')}"`,
    `"${(e.specialty || '').replace(/"/g, '""')}"`,
    `"${(e.type || '').replace(/"/g, '""')}"`,
    `"${(e.commune || '').replace(/"/g, '""')}"`,
    `"${(e.address || '').replace(/"/g, '""')}"`,
    `"${(e.phone || '').replace(/"/g, '""')}"`,
    `"${(e.secondaryPhone || '').replace(/"/g, '""')}"`,
    `"${(e.workingHours || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports data as printable styled HTML document ready for instant download or Print to PDF
 */
export function exportEntitiesToPrintableHTML(entities: HealthEntity[], title = 'دليل أطباء وعيادات ولاية الوادي') {
  const tableRows = entities
    .map(
      (e, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
      <td style="padding: 10px 12px; font-weight: bold; color: #1e293b;">${idx + 1}</td>
      <td style="padding: 10px 12px; font-weight: bold; color: #0f172a;">${e.name || '-'}</td>
      <td style="padding: 10px 12px; color: #2563eb; font-weight: 600;">${e.specialty || '-'}</td>
      <td style="padding: 10px 12px; color: #475569;">${e.commune || '-'}</td>
      <td style="padding: 10px 12px; color: #475569;">${e.address || '-'}</td>
      <td style="padding: 10px 12px; direction: ltr; text-align: right; font-weight: 600; color: #059669;">${e.phone || '-'}</td>
      <td style="padding: 10px 12px; direction: ltr; text-align: right; color: #64748b;">${e.secondaryPhone || '-'}</td>
    </tr>
  `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 24px;
      color: #0f172a;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #3b82f6;
    }
    h1 {
      margin: 0 0 8px 0;
      color: #1e3a8a;
      font-size: 24px;
    }
    p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: right;
    }
    th {
      background-color: #1e40af;
      color: #ffffff;
      padding: 12px;
      font-weight: bold;
    }
    .footer {
      margin-top: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-DZ')} | إجمالي السجلات: ${entities.length}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>الاسم واللقب</th>
        <th>التخصص الطبي</th>
        <th>البلدية</th>
        <th>العنوان / الحي</th>
        <th>الهاتف الرئيسي</th>
        <th>الهاتف الثانوي</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <div class="footer">
    تم الإنشاء تلقائياً عبر تطبيق صحة الوادي (دليل الصحة لولاية الوادي)
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.html`;
    link.click();
  }
}
