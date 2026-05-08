/**
 * @fileoverview Bar chart component using Chart.js.
 * Displays categorical data comparison with vertical bars.
 */

const { useRef, useEffect, useCallback } = React;

/**
 * BarChart component renders a bar chart for comparing categorical values.
 * @param {Object} props - Component props
 * @param {string[]} props.labels - X-axis category labels
 * @param {number[]} props.data - Bar values
 * @param {string} [props.title] - Chart title
 * @param {string} [props.label] - Dataset label
 * @param {string} [props.color='#8b5cf6'] - Bar color
 * @param {Function} [props.onExport] - Export callback
 * @param {string} [props.theme='light'] - Current theme
 * @returns {React.ReactElement}
 */
function BarChart({ labels, data, title, label, color, onExport, theme }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  const buildChart = useCallback(() => {
    if (!canvasRef.current || !labels || !data) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, color + 'CC');
    gradient.addColorStop(1, color + '80');

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: label || 'Value',
          data,
          backgroundColor: gradient,
          borderColor: color,
          borderWidth: 0,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.65,
          categoryPercentage: 0.8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
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
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: textColor,
              font: { size: 11 },
            },
            border: {
              color: gridColor,
            },
          },
          y: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
              font: { size: 11 },
              callback: (value) => {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
                return value;
              },
            },
            border: {
              display: false,
            },
            beginAtZero: true,
          },
        },
      },
    });
  }, [labels, data, color, label, textColor, gridColor, theme]);

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
        title && React.createElement('div', { className: 'chart-card-title' }, title),
        label && !title && React.createElement('div', { className: 'chart-card-title' }, label)
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
  module.exports = { BarChart };
}
