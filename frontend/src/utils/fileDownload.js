import api from './api';

/**
 * Download a single paper file
 */
export const downloadPaper = async (paperId, filename = null) => {
  try {
    const response = await api.downloadPaper(paperId);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `paper_${paperId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Download error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Download multiple papers as ZIP
 */
export const downloadPapersAsZip = async (paperIds, zipFilename = 'papers.zip') => {
  try {
    const response = await api.downloadPapersZip(paperIds);
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Batch download error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Download all papers from a conference
 */
export const downloadConferencePapers = async (conferenceId, status = 'all') => {
  try {
    const filename = `conference_${conferenceId}_papers_${status}.zip`;
    const response = await api.downloadConferencePapers(conferenceId, status);
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Conference download error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export data as CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    return { success: false, error: 'No data to export' };
  }

  try {
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('CSV export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export data as Excel (XLSX)
 */
export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    return { success: false, error: 'No data to export' };
  }

  try {
    // Simple Excel XML format
    const headers = Object.keys(data[0]);
    const headerRow = '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('') + '</Row>';
    const dataRows = data.map(row => 
      '<Row>' + headers.map(h => `<Cell><Data ss:Type="String">${row[h] || ''}</Data></Cell>`).join('') + '</Row>'
    ).join('');

    const xmlContent = `<?xml version="1.0"?>
      <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
        <Worksheet ss:Name="${sheetName}">
          <Table>
            ${headerRow}
            ${dataRows}
          </Table>
        </Worksheet>
      </Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Excel export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Show download progress notification
 */
export const showDownloadProgress = (message = 'Đang tải xuống...') => {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slideUp';
  notification.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span class="font-semibold">${message}</span>
  `;
  document.body.appendChild(notification);
  return notification;
};

/**
 * Hide download progress notification
 */
export const hideDownloadProgress = (notification, success = true, message = null) => {
  if (!notification) return;
  
  notification.className = notification.className.replace('bg-blue-600', success ? 'bg-green-600' : 'bg-red-600');
  notification.innerHTML = `
    <span class="material-symbols-outlined text-2xl">${success ? 'check_circle' : 'error'}</span>
    <span class="font-semibold">${message || (success ? 'Tải xuống thành công!' : 'Tải xuống thất bại')}</span>
  `;
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
};

export default {
  downloadPaper,
  downloadPapersAsZip,
  downloadConferencePapers,
  exportToCSV,
  exportToExcel,
  showDownloadProgress,
  hideDownloadProgress
};
