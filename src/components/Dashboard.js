/**
 * @fileoverview Main Dashboard component that orchestrates all data visualization.
 * Manages data generation, filtering, and renders all chart and stat components.
 */

const { useState, useEffect, useCallback, useMemo } = React;

/**
 * Dashboard - Main dashboard component with all charts, stats, and controls.
 * @param {Object} props - Component props
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @returns {React.ReactElement}
 */
function Dashboard({ theme }) {
  // Default date range: last 30 days
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Generate metrics data for the current date range.
   */
  const refreshData = useCallback(() => {
    setIsLoading(true);
    try {
      const newMetrics = generateDailyMetrics(startDate, endDate, {
        baseSales: 120,
        baseUsers: 850,
        baseRevenue: 4500,
        growthRate: 0.03,
      });
      setMetrics(newMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to generate metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Generate data on mount and when date range changes
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  // Compute summary statistics
  const summary = useMemo(() => computeSummary(metrics), [metrics]);

  // Compute previous period comparison
  const previousPeriodSummary = useMemo(() => {
    const dayCount = metrics.length;
    const endMs = new Date(startDate).getTime() - 24 * 60 * 60 * 1000;
    const startMs = endMs - dayCount * 24 * 60 * 60 * 1000;
    const prevStart = new Date(startMs).toISOString().split('T')[0];
    const prevEnd = new Date(endMs).toISOString().split('T')[0];

    try {
      const prevMetrics = generateDailyMetrics(prevStart, prevEnd);
      return computeSummary(prevMetrics);
    } catch (error) {
      return null;
    }
  }, [metrics, startDate]);

  // Prepare chart data
  const chartLabels = useMemo(() => {
    // For large datasets, show every Nth label
    const total = metrics.length;
    const step = total > 60 ? Math.ceil(total / 20) : total > 30 ? Math.ceil(total / 12) : 1;
    return metrics.map((m, i) => {
      if (i % step !== 0 && i !== total - 1) return '';
      const date = new Date(m.date + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
  }, [metrics]);

  const revenueData = useMemo(() => metrics.map(m => m.revenue), [metrics]);
  const usersData = useMemo(() => metrics.map(m => m.users), [metrics]);
  const salesData = useMemo(() => metrics.map(m => m.sales), [metrics]);
  const conversionsData = useMemo(() => metrics.map(m => m.conversions), [metrics]);

  // Weekly aggregation for bar chart
  const weeklyData = useMemo(() => aggregateByWeek(metrics), [metrics]);
  const weeklyLabels = useMemo(() =>
    weeklyData.map(w => {
      const date = new Date(w.weekStarting + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    [weeklyData]
  );
  const weeklyRevenue = useMemo(() => weeklyData.map(w => w.revenue), [weeklyData]);

  // Pie chart data: revenue by day of week
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = days.map(() => 0);
    metrics.forEach(m => {
      const day = new Date(m.date + 'T00:00:00').getDay();
      totals[day] += m.revenue;
    });
    return { labels: days, data: totals };
  }, [metrics]);

  // Handlers
  const handleDateChange = useCallback(({ startDate: newStart, endDate: newEnd }) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  }, []);

  const handleExportAll = useCallback(() => {
    try {
      const columns = ['date', 'sales', 'users', 'revenue', 'conversions', 'conversionRate', 'avgOrderValue', 'pageViews', 'bounceRate'];
      exportMetricsToCSV(metrics, generateFilename('dashboard_metrics', 'csv'), columns);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  }, [metrics]);

  const handleExportLine = useCallback(() => {
    try {
      exportChartData({ label: 'Revenue', labels: chartLabels.filter(l => l), data: revenueData.filter((_, i) => chartLabels[i]) },
        generateFilename('revenue_chart', 'csv'));
    } catch (error) {
      console.error('Chart export failed:', error);
    }
  }, [chartLabels, revenueData]);

  const handleExportBar = useCallback(() => {
    try {
      exportChartData({ label: 'Weekly Revenue', labels: weeklyLabels, data: weeklyRevenue },
        generateFilename('weekly_revenue', 'csv'));
    } catch (error) {
      console.error('Chart export failed:', error);
    }
  }, [weeklyLabels, weeklyRevenue]);

  const handleExportPie = useCallback(() => {
    try {
      exportChartData({ label: 'Revenue by Day', labels: dayOfWeekData.labels, data: dayOfWeekData.data },
        generateFilename('revenue_by_day', 'csv'));
    } catch (error) {
      console.error('Chart export failed:', error);
    }
  }, [dayOfWeekData]);

  const handleExportArea = useCallback(() => {
    try {
      exportChartData({ label: 'Active Users', labels: chartLabels.filter(l => l), data: usersData.filter((_, i) => chartLabels[i]) },
        generateFilename('users_chart', 'csv'));
    } catch (error) {
      console.error('Chart export failed:', error);
    }
  }, [chartLabels, usersData]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Stat card data
  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue, true),
      change: previousPeriodSummary ? calculateChange(summary.totalRevenue, previousPeriodSummary.totalRevenue) : null,
      icon: '\u{1F4B0}',
      accent: '#3b82f6',
    },
    {
      title: 'Total Sales',
      value: formatNumber(summary.totalSales),
      change: previousPeriodSummary ? calculateChange(summary.totalSales, previousPeriodSummary.totalSales) : null,
      icon: '\u{1F4CB}',
      accent: '#10b981',
    },
    {
      title: 'Active Users',
      value: formatNumber(summary.totalUsers),
      change: previousPeriodSummary ? calculateChange(summary.totalUsers, previousPeriodSummary.totalUsers) : null,
      icon: '\u{1F465}',
      accent: '#8b5cf6',
    },
    {
      title: 'Conversions',
      value: formatNumber(summary.totalConversions),
      change: previousPeriodSummary ? calculateChange(summary.totalConversions, previousPeriodSummary.totalConversions) : null,
      icon: '\u{1F3AF}',
      accent: '#f59e0b',
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(summary.avgOrderValue),
      change: null,
      icon: '\u{1F4B8}',
      accent: '#06b6d4',
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(summary.avgConversionRate),
      change: null,
      icon: '\u{1F4C8}',
      accent: '#ec4899',
    },
  ];

  return React.createElement('div', null,
    // Controls bar
    React.createElement('div', { className: 'controls-bar' },
      React.createElement('div', { className: 'controls-left' },
        React.createElement(DateRangePicker, {
          startDate,
          endDate,
          onChange: handleDateChange,
        })
      ),
      React.createElement('div', { className: 'controls-right' },
        React.createElement('div', {
          className: 'live-indicator',
          title: autoRefresh ? 'Auto-refresh every 30s' : 'Auto-refresh paused',
        },
          React.createElement('span', { className: 'live-dot' }),
          React.createElement('span', null, 'Live')
        ),
        React.createElement('button', {
          className: 'refresh-btn',
          onClick: refreshData,
          disabled: isLoading,
          title: 'Refresh data now',
        }, isLoading ? '\u{1F504} Refreshing...' : '\u{1F504} Refresh'),
        React.createElement('button', {
          className: 'export-btn',
          onClick: handleExportAll,
          title: 'Export all metrics as CSV',
        }, '\u{1F4E5} Export CSV')
      )
    ),

    // Stat cards
    React.createElement('div', { className: 'stats-grid' },
      statCards.map((card, index) =>
        React.createElement(StatCard, {
          key: index,
          title: card.title,
          value: card.value,
          change: card.change,
          icon: card.icon,
          accent: card.accent,
        })
      )
    ),

    // Charts grid - Row 1: Line + Pie
    React.createElement('div', { className: 'charts-grid' },
      React.createElement(LineChart, {
        labels: chartLabels,
        data: revenueData,
        title: 'Revenue Trend',
        label: 'Revenue ($)',
        color: '#3b82f6',
        fill: false,
        onExport: handleExportLine,
        theme,
      }),
      React.createElement(PieChart, {
        labels: dayOfWeekData.labels,
        data: dayOfWeekData.data,
        title: 'Revenue by Day of Week',
        onExport: handleExportPie,
        theme,
      })
    ),

    // Charts grid - Row 2: Bar chart (full width)
    React.createElement('div', { className: 'charts-grid' },
      React.createElement(BarChart, {
        labels: weeklyLabels,
        data: weeklyRevenue,
        title: 'Weekly Revenue',
        label: 'Revenue ($)',
        color: '#8b5cf6',
        onExport: handleExportBar,
        theme,
      }),
      React.createElement(BarChart, {
        labels: chartLabels,
        data: salesData,
        title: 'Daily Sales',
        label: 'Sales',
        color: '#10b981',
        onExport: handleExportBar,
        theme,
      })
    ),

    // Charts grid - Row 3: Area chart (full width)
    React.createElement(AreaChart, {
      labels: chartLabels,
      data: usersData,
      title: 'Active Users Over Time',
      label: 'Users',
      color: '#f59e0b',
      onExport: handleExportArea,
      theme,
    })
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Dashboard };
}
