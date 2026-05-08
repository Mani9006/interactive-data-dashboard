/**
 * @fileoverview CSV export utilities for dashboard data.
 * Supports exporting metrics, charts, and summary data to downloadable CSV files.
 */

/**
 * Converts an array of objects to CSV format.
 * @param {Object[]} data - Array of data objects
 * @param {string[]} [headers] - Optional custom headers (uses object keys if not provided)
 * @param {string} [filename='export.csv'] - Download filename
 * @returns {string} CSV content string
 */
function convertToCSV(data, headers) {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');

  const escapeCell = (value) => {
    if (value === null || value === undefined) {
      return '';
    }
    const str = String(value);
    // Escape values containing commas, quotes, or newlines
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const rows = data.map(row =>
    keys.map(key => escapeCell(row[key])).join(',')
  );

  return [csvHeaders, ...rows].join('\n');
}

/**
 * Triggers a browser download of CSV content.
 * @param {string} csvContent - CSV string content
 * @param {string} filename - Download filename
 * @throws {Error} If download fails
 */
function downloadCSV(csvContent, filename = 'export.csv') {
  if (typeof window === 'undefined') {
    throw new Error('downloadCSV can only be used in a browser environment.');
  }

  if (!csvContent) {
    throw new Error('CSV content is empty.');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Exports metrics data to CSV and triggers download.
 * @param {Object[]} metrics - Metrics data array
 * @param {string} [filename='metrics.csv'] - Download filename
 * @param {string[]} [columns] - Specific columns to export
 */
function exportMetricsToCSV(metrics, filename = 'metrics.csv', columns) {
  const csv = convertToCSV(metrics, columns);
  if (!csv) {
    throw new Error('No data to export.');
  }
  downloadCSV(csv, filename);
}

/**
 * Exports chart data formatted for visualization tools.
 * @param {Object} chartData - Chart dataset
 * @param {string} chartData.label - Chart label
 * @param {string[]} chartData.labels - X-axis labels
 * @param {number[]} chartData.data - Y-axis values
 * @param {string} [filename='chart_data.csv'] - Download filename
 */
function exportChartData(chartData, filename = 'chart_data.csv') {
  if (!chartData || !Array.isArray(chartData.labels) || !Array.isArray(chartData.data)) {
    throw new Error('Invalid chart data format.');
  }

  if (chartData.labels.length !== chartData.data.length) {
    throw new Error('Labels and data arrays must have the same length.');
  }

  const data = chartData.labels.map((label, index) => ({
    label,
    value: chartData.data[index],
  }));

  exportMetricsToCSV(data, filename, ['label', 'value']);
}

/**
 * Exports summary statistics to CSV.
 * @param {Object} summary - Summary statistics object
 * @param {string} [filename='summary.csv'] - Download filename
 */
function exportSummaryToCSV(summary, filename = 'summary.csv') {
  if (!summary || typeof summary !== 'object') {
    throw new Error('Invalid summary data.');
  }

  const data = Object.entries(summary).map(([key, value]) => ({
    metric: key,
    value: typeof value === 'number' ? value : String(value),
  }));

  exportMetricsToCSV(data, filename, ['metric', 'value']);
}

/**
 * Generates a filename with current date.
 * @param {string} baseName - Base filename
 * @param {string} [extension='csv'] - File extension
 * @returns {string} Dated filename
 */
function generateFilename(baseName = 'export', extension = 'csv') {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return `${baseName}_${dateStr}.${extension}`;
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertToCSV,
    downloadCSV,
    exportMetricsToCSV,
    exportChartData,
    exportSummaryToCSV,
    generateFilename,
  };
}
