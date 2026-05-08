/**
 * @fileoverview Pie/Doughnut chart component using Chart.js.
 * Displays proportional data distribution.
 */

const { useRef, useEffect, useCallback } = React;

/**
 * PieChart component renders a doughnut chart for proportional data.
 * @param {Object} props - Component props
 * @param {string[]} props.labels - Category labels
 * @param {number[]} props.data - Data values
 * @param {string} [props.title] - Chart title
 * @param {string[]} [props.colors] - Custom segment colors
 * @param {Function} [props.onExport] - Export callback
 * @param {string} [props.theme='light'] - Current theme
 * @returns {React.ReactElement}
 */
function PieChart({ labels, data, title, colors, onExport, theme }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  /** @type {string[]} Default color palette */
  const defaultColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16',
  ];

  const segmentColors = colors || defaultColors;

  const buildChart = useCallback(() => {
    if (!canvasRef.current || !labels || !data) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: segmentColors,
          borderColor: theme === 'dark' ? '#1e293b' : '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              color: theme === 'dark' ? '#94a3b8' : '#64748b',
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
            titleColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
            borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return ` ${context.label}: ${value.toLocaleString()} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }, [labels, data, segmentColors, theme]);

  useEffect(() => {
    buildChart();
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [buildChart]);

  return React.createElement('div', { className: 'chart-card' },
    React.createElement('div', { className: 'chart-card-header' },
      React.createElement('div', null,
        title && React.createElement('div', { className: 'chart-card-title' }, title)
      ),
      onExport && React.createElement('div', { className: 'chart-card-actions' },
        React.createElement('button', {
          className: 'chart-action-btn',
          onClick: onExport,
          title: 'Export chart data as CSV',
        }, '\u2193 CSV')
      )
    ),
    React.createElement('div', { className: 'chart-container' },
      React.createElement('canvas', { ref: canvasRef })
    )
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PieChart };
}
