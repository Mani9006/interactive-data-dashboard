/**
 * @fileoverview Formatting utilities for displaying numbers, currency, dates, and percentages.
 */

/**
 * Formats a number as US currency.
 * @param {number} value - Value to format
 * @param {boolean} [compact=false] - Use compact notation
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, compact = false) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '$0.00';
  }

  if (compact && Math.abs(value) >= 1000000) {
    return '$' + (value / 1000000).toFixed(1) + 'M';
  }
  if (compact && Math.abs(value) >= 1000) {
    return '$' + (value / 1000).toFixed(1) + 'K';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number with thousands separators.
 * @param {number} value - Value to format
 * @param {boolean} [compact=false] - Use compact notation (e.g., 1.2K)
 * @returns {string} Formatted number string
 */
function formatNumber(value, compact = false) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  if (compact && Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (compact && Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }

  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/**
 * Formats a number as a percentage.
 * @param {number} value - Value to format (0.15 = 15%)
 * @param {number} [decimals=1] - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) {
    return decimals === 0 ? '0%' : `0.${'0'.repeat(decimals)}%`;
  }

  if (value === 0) {
    return decimals === 0 ? '0%' : `0.${'0'.repeat(decimals)}%`;
  }

  return value.toFixed(decimals) + '%';
}

/**
 * Formats a date string to a readable format.
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {Object} options - Formatting options
 * @param {boolean} [options.short=false] - Use short format (MM/DD/YYYY)
 * @param {boolean} [options.monthDay=false] - Use Month Day format
 * @returns {string} Formatted date string
 */
function formatDate(dateStr, options = {}) {
  const { short = false, monthDay = false } = options;
  const date = new Date(dateStr + 'T00:00:00');

  if (isNaN(date.getTime())) {
    return dateStr;
  }

  if (short) {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (monthDay) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculates the change between two values as a percentage.
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {Object} Change information
 */
function calculateChange(current, previous) {
  if (!previous || previous === 0) {
    return { value: 0, percentage: 0, direction: 'neutral' };
  }

  const diff = current - previous;
  const percentage = (diff / previous) * 100;

  return {
    value: diff,
    percentage: parseFloat(percentage.toFixed(1)),
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
  };
}

/**
 * Formats a change object as a readable string with arrow indicator.
 * @param {Object} change - Change object from calculateChange
 * @returns {string} Formatted change string
 */
function formatChange(change) {
  if (!change || change.direction === 'neutral') {
    return '0%';
  }

  const arrow = change.direction === 'up' ? '↑' : '↓';
  const sign = change.direction === 'up' ? '+' : '';
  return `${arrow} ${sign}${change.percentage}%`;
}

/**
 * Truncates text to a maximum length with ellipsis.
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.substring(0, maxLength) + '...';
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatNumber,
    formatPercentage,
    formatDate,
    calculateChange,
    formatChange,
    truncateText,
  };
}
