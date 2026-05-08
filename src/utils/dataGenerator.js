/**
 * @fileoverview Mock data generator for business metrics.
 * Provides realistic data for sales, users, revenue, and conversions
 * with configurable date ranges and seasonal patterns.
 */

/**
 * @typedef {Object} DailyMetric
 * @property {string} date - ISO date string
 * @property {number} sales - Number of sales
 * @property {number} users - Active users
 * @property {number} revenue - Revenue in USD
 * @property {number} conversions - Conversion count
 * @property {number} conversionRate - Conversion percentage
 * @property {number} avgOrderValue - Average order value
 * @property {number} pageViews - Page view count
 * @property {number} bounceRate - Bounce rate percentage
 */

/** @type {number} */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Generates a pseudo-random number seeded by a string.
 * Ensures reproducible "random" data for the same inputs.
 * @param {string} seed - Seed string
 * @returns {number} Float between 0 and 1
 */
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 10000) / 10000;
}

/**
 * Applies realistic weekly seasonality to a value.
 * @param {number} value - Base value
 * @param {Date} date - Date to check for seasonality
 * @returns {number} Adjusted value
 */
function applyWeeklySeasonality(value, date) {
  const dayOfWeek = date.getDay();
  // Weekends typically have different patterns
  const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
  // Friday boost
  const fridayMultiplier = (dayOfWeek === 5) ? 1.15 : 1.0;
  return Math.round(value * weekendMultiplier * fridayMultiplier);
}

/**
 * Applies monthly growth trend to a value.
 * @param {number} value - Base value
 * @param {Date} date - Current date
 * @param {Date} startDate - Start date of range
 * @param {number} growthRate - Monthly growth rate (default 0.03 = 3%)
 * @returns {number} Adjusted value
 */
function applyGrowthTrend(value, date, startDate, growthRate = 0.03) {
  const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 +
    (date.getMonth() - startDate.getMonth());
  return Math.round(value * Math.pow(1 + growthRate, monthsDiff));
}

/**
 * Applies random variance to a value for realism.
 * @param {number} value - Base value
 * @param {number} variance - Variance percentage (0-1)
 * @param {string} seed - Seed for reproducibility
 * @returns {number} Adjusted value
 */
function applyVariance(value, variance = 0.15, seed) {
  const randomFactor = 1 + (seededRandom(seed) - 0.5) * 2 * variance;
  return Math.max(0, Math.round(value * randomFactor));
}

/**
 * Formats a Date to ISO date string (YYYY-MM-DD).
 * @param {Date} date - Date to format
 * @returns {string} ISO date string
 */
function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates daily metrics for a given date range.
 * @param {string} startDateStr - Start date (YYYY-MM-DD)
 * @param {string} endDateStr - End date (YYYY-MM-DD)
 * @param {Object} options - Generation options
 * @param {number} [options.baseSales=120] - Base daily sales
 * @param {number} [options.baseUsers=850] - Base daily active users
 * @param {number} [options.baseRevenue=4500] - Base daily revenue
 * @param {number} [options.growthRate=0.03] - Monthly growth rate
 * @returns {DailyMetric[]} Array of daily metrics
 */
function generateDailyMetrics(startDateStr, endDateStr, options = {}) {
  const {
    baseSales = 120,
    baseUsers = 850,
    baseRevenue = 4500,
    growthRate = 0.03,
  } = options;

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }

  if (startDate > endDate) {
    throw new Error('Start date must be before or equal to end date.');
  }

  const metrics = [];
  const dayCount = Math.ceil((endDate - startDate) / MS_PER_DAY) + 1;

  // Limit to prevent performance issues
  const MAX_DAYS = 365 * 5;
  if (dayCount > MAX_DAYS) {
    throw new Error(`Date range exceeds maximum of ${MAX_DAYS} days.`);
  }

  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(startDate.getTime() + i * MS_PER_DAY);
    const dateStr = formatISODate(currentDate);
    const seed = dateStr;

    const sales = applyVariance(
      applyGrowthTrend(
        applyWeeklySeasonality(baseSales, currentDate),
        currentDate, startDate, growthRate
      ),
      0.2,
      seed + 'sales'
    );

    const users = applyVariance(
      applyGrowthTrend(
        applyWeeklySeasonality(baseUsers, currentDate),
        currentDate, startDate, growthRate
      ),
      0.15,
      seed + 'users'
    );

    const revenue = applyVariance(
      applyGrowthTrend(
        applyWeeklySeasonality(baseRevenue, currentDate),
        currentDate, startDate, growthRate
      ),
      0.25,
      seed + 'revenue'
    );

    const avgOrderValue = Math.round(revenue / Math.max(sales, 1));
    const conversions = Math.round(sales * (0.08 + seededRandom(seed + 'conv') * 0.12));
    const conversionRate = parseFloat(((conversions / Math.max(users, 1)) * 100).toFixed(2));
    const pageViews = Math.round(users * (3 + seededRandom(seed + 'pv') * 7));
    const bounceRate = parseFloat((30 + seededRandom(seed + 'br') * 50).toFixed(2));

    metrics.push({
      date: dateStr,
      sales,
      users,
      revenue,
      conversions,
      conversionRate,
      avgOrderValue,
      pageViews,
      bounceRate,
    });
  }

  return metrics;
}

/**
 * Aggregates daily metrics by week.
 * @param {DailyMetric[]} dailyMetrics - Daily metrics array
 * @returns {Object[]} Weekly aggregated metrics
 */
function aggregateByWeek(dailyMetrics) {
  const weeks = {};

  for (const day of dailyMetrics) {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = formatISODate(weekStart);

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        weekStarting: weekKey,
        sales: 0,
        users: 0,
        revenue: 0,
        conversions: 0,
        pageViews: 0,
        days: 0,
      };
    }

    weeks[weekKey].sales += day.sales;
    weeks[weekKey].users += day.users;
    weeks[weekKey].revenue += day.revenue;
    weeks[weekKey].conversions += day.conversions;
    weeks[weekKey].pageViews += day.pageViews;
    weeks[weekKey].days += 1;
  }

  return Object.values(weeks).map(w => ({
    ...w,
    avgUsers: Math.round(w.users / w.days),
    conversionRate: parseFloat(((w.conversions / Math.max(w.users, 1)) * 100).toFixed(2)),
    avgOrderValue: Math.round(w.revenue / Math.max(w.sales, 1)),
  }));
}

/**
 * Aggregates daily metrics by month.
 * @param {DailyMetric[]} dailyMetrics - Daily metrics array
 * @returns {Object[]} Monthly aggregated metrics
 */
function aggregateByMonth(dailyMetrics) {
  const months = {};

  for (const day of dailyMetrics) {
    const monthKey = day.date.substring(0, 7); // YYYY-MM

    if (!months[monthKey]) {
      months[monthKey] = {
        month: monthKey,
        sales: 0,
        users: 0,
        revenue: 0,
        conversions: 0,
        pageViews: 0,
        days: 0,
      };
    }

    months[monthKey].sales += day.sales;
    months[monthKey].users += day.users;
    months[monthKey].revenue += day.revenue;
    months[monthKey].conversions += day.conversions;
    months[monthKey].pageViews += day.pageViews;
    months[monthKey].days += 1;
  }

  return Object.values(months).map(m => ({
    ...m,
    avgUsers: Math.round(m.users / m.days),
    conversionRate: parseFloat(((m.conversions / Math.max(m.users, 1)) * 100).toFixed(2)),
    avgOrderValue: Math.round(m.revenue / Math.max(m.sales, 1)),
  }));
}

/**
 * Computes summary statistics from daily metrics.
 * @param {DailyMetric[]} dailyMetrics - Daily metrics array
 * @returns {Object} Summary statistics
 */
function computeSummary(dailyMetrics) {
  if (!dailyMetrics || dailyMetrics.length === 0) {
    return {
      totalSales: 0,
      totalUsers: 0,
      totalRevenue: 0,
      totalConversions: 0,
      avgConversionRate: 0,
      avgOrderValue: 0,
      avgDailyUsers: 0,
      totalPageViews: 0,
      avgBounceRate: 0,
    };
  }

  const totalSales = dailyMetrics.reduce((sum, d) => sum + d.sales, 0);
  const totalUsers = dailyMetrics.reduce((sum, d) => sum + d.users, 0);
  const totalRevenue = dailyMetrics.reduce((sum, d) => sum + d.revenue, 0);
  const totalConversions = dailyMetrics.reduce((sum, d) => sum + d.conversions, 0);
  const totalPageViews = dailyMetrics.reduce((sum, d) => sum + d.pageViews, 0);

  return {
    totalSales,
    totalUsers,
    totalRevenue,
    totalConversions,
    avgConversionRate: parseFloat(((totalConversions / Math.max(totalUsers, 1)) * 100).toFixed(2)),
    avgOrderValue: Math.round(totalRevenue / Math.max(totalSales, 1)),
    avgDailyUsers: Math.round(totalUsers / dailyMetrics.length),
    totalPageViews,
    avgBounceRate: parseFloat((dailyMetrics.reduce((sum, d) => sum + d.bounceRate, 0) / dailyMetrics.length).toFixed(2)),
  };
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateDailyMetrics,
    aggregateByWeek,
    aggregateByMonth,
    computeSummary,
    formatISODate,
  };
}
