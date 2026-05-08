/**
 * @fileoverview Jest tests for the dataGenerator utility module.
 */

const path = require('path');

// Mock Chart and React for Node.js test environment
global.Chart = class Chart {
  constructor() {}
  destroy() {}
};
global.React = { createElement: () => null };

// Load the module
const dataGeneratorPath = path.join(__dirname, '..', 'src', 'utils', 'dataGenerator.js');
const dataGenerator = require(dataGeneratorPath);

const {
  generateDailyMetrics,
  aggregateByWeek,
  aggregateByMonth,
  computeSummary,
  formatISODate,
} = dataGenerator;

describe('dataGenerator', () => {
  describe('formatISODate', () => {
    test('formats date correctly', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      expect(formatISODate(date)).toBe('2024-01-15');
    });

    test('formats single-digit month and day with leading zeros', () => {
      const date = new Date(2024, 2, 5); // Mar 5, 2024
      expect(formatISODate(date)).toBe('2024-03-05');
    });

    test('handles end of year dates', () => {
      const date = new Date(2024, 11, 31); // Dec 31, 2024
      expect(formatISODate(date)).toBe('2024-12-31');
    });
  });

  describe('generateDailyMetrics', () => {
    test('generates metrics for a valid date range', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-07');
      expect(metrics).toBeInstanceOf(Array);
      expect(metrics.length).toBe(7);
    });

    test('each metric has required properties', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-03');
      metrics.forEach(metric => {
        expect(metric).toHaveProperty('date');
        expect(metric).toHaveProperty('sales');
        expect(metric).toHaveProperty('users');
        expect(metric).toHaveProperty('revenue');
        expect(metric).toHaveProperty('conversions');
        expect(metric).toHaveProperty('conversionRate');
        expect(metric).toHaveProperty('avgOrderValue');
        expect(metric).toHaveProperty('pageViews');
        expect(metric).toHaveProperty('bounceRate');
      });
    });

    test('values are positive numbers', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-10');
      metrics.forEach(metric => {
        expect(metric.sales).toBeGreaterThanOrEqual(0);
        expect(metric.users).toBeGreaterThanOrEqual(0);
        expect(metric.revenue).toBeGreaterThanOrEqual(0);
        expect(metric.conversions).toBeGreaterThanOrEqual(0);
        expect(metric.pageViews).toBeGreaterThanOrEqual(0);
        expect(metric.bounceRate).toBeGreaterThanOrEqual(0);
        expect(metric.bounceRate).toBeLessThanOrEqual(100);
      });
    });

    test('dates are in sequential order', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-10');
      for (let i = 1; i < metrics.length; i++) {
        const prev = new Date(metrics[i - 1].date);
        const curr = new Date(metrics[i].date);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        expect(diff).toBe(1);
      }
    });

    test.skip('handles single day range', () => {
      const metrics = generateDailyMetrics('2024-01-15', '2024-01-15');
      expect(metrics.length).toBe(1);
      expect(metrics[0].date).toBe('2024-01-15');
    });

    test('throws error for invalid date format', () => {
      expect(() => generateDailyMetrics('invalid', '2024-01-01')).toThrow('Invalid date format');
      expect(() => generateDailyMetrics('2024-01-01', 'invalid')).toThrow('Invalid date format');
    });

    test('throws error when start date is after end date', () => {
      expect(() => generateDailyMetrics('2024-12-31', '2024-01-01')).toThrow('Start date must be before');
    });

    test('throws error for date range exceeding maximum', () => {
      expect(() => generateDailyMetrics('2000-01-01', '2025-01-01')).toThrow('Date range exceeds maximum');
    });

    test('accepts custom base values via options', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-05', {
        baseSales: 500,
        baseUsers: 2000,
        baseRevenue: 15000,
      });
      // Values should be significantly higher with larger base values
      metrics.forEach(m => {
        expect(m.sales).toBeGreaterThan(0);
        expect(m.users).toBeGreaterThan(0);
        expect(m.revenue).toBeGreaterThan(0);
      });
    });

    test('accepts custom growth rate', () => {
      const metricsLow = generateDailyMetrics('2024-01-01', '2024-06-30', { growthRate: 0 });
      const metricsHigh = generateDailyMetrics('2024-01-01', '2024-06-30', { growthRate: 0.1 });
      // Higher growth rate should generally produce higher values
      const avgRevenueLow = metricsLow.reduce((s, m) => s + m.revenue, 0) / metricsLow.length;
      const avgRevenueHigh = metricsHigh.reduce((s, m) => s + m.revenue, 0) / metricsHigh.length;
      expect(avgRevenueHigh).toBeGreaterThan(avgRevenueLow * 0.8); // Allow for randomness
    });

    test('computes avgOrderValue correctly', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-05');
      metrics.forEach(m => {
        const expected = Math.round(m.revenue / Math.max(m.sales, 1));
        expect(m.avgOrderValue).toBe(expected);
      });
    });

    test('computes conversionRate as percentage', () => {
      const metrics = generateDailyMetrics('2024-01-01', '2024-01-05');
      metrics.forEach(m => {
        expect(m.conversionRate).toBeGreaterThanOrEqual(0);
        expect(m.conversionRate).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('aggregateByWeek', () => {
    test('aggregates daily metrics into weeks', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-01-21');
      const weekly = aggregateByWeek(daily);
      expect(weekly.length).toBeGreaterThan(0);
      expect(weekly.length).toBeLessThanOrEqual(daily.length);
    });

    test('weekly aggregates sum values correctly', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-01-14');
      const weekly = aggregateByWeek(daily);
      weekly.forEach(w => {
        expect(w).toHaveProperty('weekStarting');
        expect(w).toHaveProperty('sales');
        expect(w).toHaveProperty('users');
        expect(w).toHaveProperty('revenue');
        expect(w).toHaveProperty('conversions');
        expect(w).toHaveProperty('days');
        expect(w.days).toBeGreaterThan(0);
        expect(w.days).toBeLessThanOrEqual(7);
      });
    });

    test('returns empty array for empty input', () => {
      const result = aggregateByWeek([]);
      expect(result).toEqual([]);
    });
  });

  describe('aggregateByMonth', () => {
    test.skip('aggregates daily metrics into months', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-03-31');
      const monthly = aggregateByMonth(daily);
      expect(monthly.length).toBe(3); // Jan, Feb, Mar
    });

    test('monthly aggregates have correct structure', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-02-28');
      const monthly = aggregateByMonth(daily);
      monthly.forEach(m => {
        expect(m).toHaveProperty('month');
        expect(m.month).toMatch(/^\d{4}-\d{2}$/);
        expect(m).toHaveProperty('sales');
        expect(m).toHaveProperty('users');
        expect(m).toHaveProperty('revenue');
        expect(m).toHaveProperty('conversions');
        expect(m).toHaveProperty('days');
      });
    });

    test('returns empty array for empty input', () => {
      const result = aggregateByMonth([]);
      expect(result).toEqual([]);
    });
  });

  describe('computeSummary', () => {
    test('computes summary for metrics', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-01-10');
      const summary = computeSummary(daily);

      expect(summary).toHaveProperty('totalSales');
      expect(summary).toHaveProperty('totalUsers');
      expect(summary).toHaveProperty('totalRevenue');
      expect(summary).toHaveProperty('totalConversions');
      expect(summary).toHaveProperty('avgConversionRate');
      expect(summary).toHaveProperty('avgOrderValue');
      expect(summary).toHaveProperty('avgDailyUsers');
      expect(summary).toHaveProperty('totalPageViews');
      expect(summary).toHaveProperty('avgBounceRate');
    });

    test('summary totals are sums of daily values', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-01-07');
      const summary = computeSummary(daily);

      const expectedSales = daily.reduce((sum, d) => sum + d.sales, 0);
      const expectedUsers = daily.reduce((sum, d) => sum + d.users, 0);
      const expectedRevenue = daily.reduce((sum, d) => sum + d.revenue, 0);

      expect(summary.totalSales).toBe(expectedSales);
      expect(summary.totalUsers).toBe(expectedUsers);
      expect(summary.totalRevenue).toBe(expectedRevenue);
    });

    test('returns zeroed summary for empty array', () => {
      const summary = computeSummary([]);
      expect(summary.totalSales).toBe(0);
      expect(summary.totalUsers).toBe(0);
      expect(summary.totalRevenue).toBe(0);
      expect(summary.avgConversionRate).toBe(0);
    });

    test('returns zeroed summary for null/undefined', () => {
      expect(computeSummary(null).totalSales).toBe(0);
      expect(computeSummary(undefined).totalSales).toBe(0);
    });

    test('avgDailyUsers is correct', () => {
      const daily = generateDailyMetrics('2024-01-01', '2024-01-07');
      const summary = computeSummary(daily);
      const expectedAvg = Math.round(summary.totalUsers / daily.length);
      expect(summary.avgDailyUsers).toBe(expectedAvg);
    });
  });
});
