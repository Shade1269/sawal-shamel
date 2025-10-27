interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export const exportToExcel = ({ headers, rows, filename }: ExportData) => {
  // إنشاء CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // معالجة القيم التي تحتوي على فواصل أو علامات اقتباس
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // إضافة BOM للدعم العربي
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // تحميل الملف
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
