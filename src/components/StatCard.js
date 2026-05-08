/**
 * @fileoverview Stat card component for displaying summary metrics with trend indicators.
 */

/**
 * StatCard component displays a single metric with title, value, change indicator, and icon.
 * @param {Object} props - Component props
 * @param {string} props.title - Card title/label
 * @param {string} props.value - Display value (pre-formatted string)
 * @param {Object} [props.change] - Change indicator object
 * @param {number} props.change.percentage - Percentage change
 * @param {string} props.change.direction - 'up', 'down', or 'neutral'
 * @param {string} [props.icon] - Icon character/emoji
 * @param {string} [props.accent] - Accent color (CSS color or variable)
 * @returns {React.ReactElement}
 */
function StatCard({ title, value, change, icon, accent }) {
  const changeClass = change?.direction || 'neutral';

  return React.createElement('div', {
    className: 'stat-card',
    style: accent ? { '--card-accent': accent } : undefined,
  },
    React.createElement('div', { className: 'stat-card-header' },
      React.createElement('span', { className: 'stat-card-title' }, title),
      icon && React.createElement('div', {
        className: 'stat-card-icon',
        style: accent ? { background: accent } : undefined,
      }, icon)
    ),
    React.createElement('div', { className: 'stat-card-value' }, value),
    change && React.createElement('div', { className: `stat-card-change ${changeClass}` },
      change.direction === 'up' ? '\u2191' : change.direction === 'down' ? '\u2193' : '\u2014',
      ' ',
      change.direction === 'up' ? '+' : '',
      change.percentage !== undefined ? `${change.percentage}%` : ''
    )
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StatCard };
}
