/**
 * @fileoverview Jest tests for the formatters utility module.
 */

const path = require('path');

// Mock Chart and React for Node.js test environment
global.Chart = class Chart {
  constructor() {}
  destroy() {}
};
global.React = { createElement: () => null };

// Load the module
const formattersPath = path.join(__dirname, '..', 'src', 'utils', 'formatters.js');
const formatters = require(formattersPath);

const {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  calculateChange,
  formatChange,
  truncateText,
} = formatters;

describe('formatters', () => {
  describe('formatCurrency', () => {
    test('formats positive number as USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    test('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('formats negative number', () => {
      expect(formatCurrency(-500)).toBe('-$500.00');
    });

    test('formats large number with commas', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });

    test('returns $0.00 for invalid input', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency('invalid')).toBe('$0.00');
      expect(formatCurrency(NaN)).toBe('$0.00');
    });

    test('compact notation for thousands', () => {
      expect(formatCurrency(1500, true)).toBe('$1.5K');
      expect(formatCurrency(95000, true)).toBe('$95.0K');
    });

    test('compact notation for millions', () => {
      expect(formatCurrency(1500000, true)).toBe('$1.5M');
      expect(formatCurrency(95000000, true)).toBe('$95.0M');
    });

    test('compact notation for small values', () => {
      expect(formatCurrency(500, true)).toBe('$500.00');
    });
  });

  describe('formatNumber', () => {
    test('formats with thousands separators', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    test('formats zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    test('returns 0 for invalid input', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber('invalid')).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });

    test('rounds decimal values', () => {
      expect(formatNumber(1234.56)).toBe('1,235');
      expect(formatNumber(1234.4)).toBe('1,234');
    });

    test('compact notation for thousands', () => {
      expect(formatNumber(1500, true)).toBe('1.5K');
    });

    test('compact notation for millions', () => {
      expect(formatNumber(2500000, true)).toBe('2.5M');
    });
  });

  describe('formatPercentage', () => {
    test('formats as percentage with 1 decimal', () => {
      expect(formatPercentage(15.5)).toBe('15.5%');
    });

    test('formats with custom decimals', () => {
      expect(formatPercentage(15.56, 2)).toBe('15.56%');
      expect(formatPercentage(15, 0)).toBe('15%');
    });

    test('formats zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    test('returns 0% for invalid input', () => {
      expect(formatPercentage(null)).toBe('0.0%');
      expect(formatPercentage(undefined)).toBe('0.0%');
      expect(formatPercentage(NaN)).toBe('0.0%');
    });
  });

  describe('formatDate', () => {
    test('formats date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    test('short format', () => {
      const result = formatDate('2024-01-15', { short: true });
      expect(result).toMatch(/1\/15\/2024/);
    });

    test('monthDay format', () => {
      const result = formatDate('2024-01-15', { monthDay: true });
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });

    test('returns original string for invalid date', () => {
      expect(formatDate('invalid')).toBe('invalid');
    });
  });

  describe('calculateChange', () => {
    test('calculates positive change', () => {
      const result = calculateChange(120, 100);
      expect(result.direction).toBe('up');
      expect(result.value).toBe(20);
      expect(result.percentage).toBe(20);
    });

    test('calculates negative change', () => {
      const result = calculateChange(80, 100);
      expect(result.direction).toBe('down');
      expect(result.value).toBe(-20);
      expect(result.percentage).toBe(-20);
    });

    test('handles zero previous value', () => {
      const result = calculateChange(100, 0);
      expect(result.direction).toBe('neutral');
      expect(result.value).toBe(0);
      expect(result.percentage).toBe(0);
    });

    test('handles no change', () => {
      const result = calculateChange(100, 100);
      expect(result.direction).toBe('neutral');
      expect(result.value).toBe(0);
      expect(result.percentage).toBe(0);
    });

    test('handles negative previous value gracefully', () => {
      const result = calculateChange(100, -50);
      expect(result).toHaveProperty('direction');
      expect(result).toHaveProperty('value');
      expect(result).toHaveProperty('percentage');
    });
  });

  describe('formatChange', () => {
    test('formats positive change', () => {
      expect(formatChange({ direction: 'up', percentage: 15.5 })).toBe('\u2191 +15.5%');
    });

    test('formats negative change', () => {
      expect(formatChange({ direction: 'down', percentage: -10.2 })).toBe('\u2193 -10.2%');
    });

    test('formats neutral change', () => {
      expect(formatChange({ direction: 'neutral', percentage: 0 })).toBe('0%');
    });

    test('returns 0% for null/undefined', () => {
      expect(formatChange(null)).toBe('0%');
      expect(formatChange(undefined)).toBe('0%');
    });
  });

  describe('truncateText', () => {
    test('truncates long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
      expect(truncateText(longText, 20).length).toBe(23); // 20 + '...'
    });

    test('does not truncate short text', () => {
      expect(truncateText('Short', 20)).toBe('Short');
    });

    test('handles empty string', () => {
      expect(truncateText('')).toBe('');
    });

    test('handles null/undefined', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
    });

    test('custom max length', () => {
      const text = 'Hello World';
      expect(truncateText(text, 5)).toBe('Hello...');
    });
  });
});
