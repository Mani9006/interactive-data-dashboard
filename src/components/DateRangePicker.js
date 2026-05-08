/**
 * @fileoverview Date range picker component with preset options.
 * Allows selecting custom date ranges or using quick presets.
 */

const { useCallback, useMemo } = React;

/**
 * DateRangePicker component for selecting date ranges with preset options.
 * @param {Object} props - Component props
 * @param {string} props.startDate - Start date (YYYY-MM-DD)
 * @param {string} props.endDate - End date (YYYY-MM-DD)
 * @param {Function} props.onChange - Callback with { startDate, endDate } when range changes
 * @returns {React.ReactElement}
 */
function DateRangePicker({ startDate, endDate, onChange }) {
  /**
   * Get today's date as YYYY-MM-DD string.
   * @returns {string}
   */
  const getToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  /**
   * Get date N days ago as YYYY-MM-DD string.
   * @param {number} days - Number of days ago
   * @returns {string}
   */
  const getDaysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  /** @type {Array<{label: string, days: number|null, custom?: boolean}>} */
  const presets = useMemo(() => [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
    { label: '1Y', days: 365 },
  ], []);

  /**
   * Determine which preset is active based on current range.
   * @returns {number|null}
   */
  const getActivePreset = useCallback(() => {
    for (const preset of presets) {
      if (preset.days !== null) {
        const expectedStart = getDaysAgo(preset.days);
        const expectedEnd = getToday();
        if (startDate === expectedStart && endDate === expectedEnd) {
          return preset.days;
        }
      }
    }
    return null;
  }, [startDate, endDate, presets]);

  /**
   * Handle start date change.
   * @param {Event} event - Change event
   */
  const handleStartChange = useCallback((event) => {
    const newStart = event.target.value;
    if (newStart && newStart <= endDate) {
      onChange({ startDate: newStart, endDate });
    }
  }, [endDate, onChange]);

  /**
   * Handle end date change.
   * @param {Event} event - Change event
   */
  const handleEndChange = useCallback((event) => {
    const newEnd = event.target.value;
    if (newEnd && newEnd >= startDate) {
      onChange({ startDate, endDate: newEnd });
    }
  }, [startDate, onChange]);

  /**
   * Apply a preset date range.
   * @param {number|null} days - Number of days, null for custom
   */
  const applyPreset = useCallback((days) => {
    if (days !== null) {
      onChange({
        startDate: getDaysAgo(days),
        endDate: getToday(),
      });
    }
  }, [onChange]);

  const activePreset = getActivePreset();

  return React.createElement('div', { className: 'date-range-picker' },
    React.createElement('label', { htmlFor: 'date-start' }, 'From'),
    React.createElement('input', {
      id: 'date-start',
      type: 'date',
      value: startDate,
      onChange: handleStartChange,
      max: endDate,
    }),
    React.createElement('span', { className: 'date-range-separator' }, 'to'),
    React.createElement('input', {
      id: 'date-end',
      type: 'date',
      value: endDate,
      onChange: handleEndChange,
      min: startDate,
      max: getToday(),
    }),
    React.createElement('div', { className: 'date-range-presets' },
      presets.map(preset =>
        React.createElement('button', {
          key: preset.label,
          className: `date-preset-btn${activePreset === preset.days ? ' active' : ''}`,
          onClick: () => applyPreset(preset.days),
        }, preset.label)
      )
    )
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DateRangePicker };
}
