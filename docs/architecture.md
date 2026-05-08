# Architecture Overview

## Project: Interactive Data Dashboard

This document describes the architecture and design decisions of the Interactive Data Dashboard application.

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Utility Modules](#utility-modules)
- [Testing Strategy](#testing-strategy)
- [Technology Stack](#technology-stack)

## System Overview

The Interactive Data Dashboard is a single-page React application that visualizes business metrics through interactive charts. It runs entirely in the browser with no backend server required.

```
User <-> React UI <-> Chart.js <-> Canvas API
              |         
              +---> Mock Data Generator
              |         
              +---> localStorage (theme persistence)
```

## Component Architecture

The component tree follows a hierarchical structure:

```
App (Root)
├── ErrorBoundary
│   └── Dashboard (Main container)
│       ├── ControlsBar
│       │   ├── DateRangePicker
│       │   └── [Action Buttons: Export, Refresh]
│       ├── StatsGrid
│       │   └── StatCard[] (6 cards)
│       ├── ChartsGrid (Row 1)
│       │   ├── LineChart (Revenue Trend)
│       │   └── PieChart (Revenue by Day of Week)
│       ├── ChartsGrid (Row 2)
│       │   ├── BarChart (Weekly Revenue)
│       │   └── BarChart (Daily Sales)
│       └── AreaChart (Active Users - Full Width)
```

### Component Responsibilities

| Component | Type | Responsibility |
|-----------|------|---------------|
| `App` | Container | Root layout, theme management, error boundary wrapper |
| `ErrorBoundary` | Class | Catches and handles render errors gracefully |
| `Dashboard` | Container | Data generation, state management, chart data preparation |
| `DateRangePicker` | Presentational | Date range selection with preset shortcuts |
| `StatCard` | Presentational | Displays a single KPI metric with trend indicator |
| `LineChart` | Presentational | Time-series line chart using Chart.js |
| `BarChart` | Presentational | Categorical comparison bar chart |
| `PieChart` | Presentational | Proportional doughnut chart |
| `AreaChart` | Presentational | Area/filled line chart for cumulative trends |
| `ThemeToggle` | Presentational | Light/dark theme switcher |

## Data Flow

The application uses a unidirectional data flow pattern:

```
1. User interacts with DateRangePicker
   |
2. Dashboard updates date range state
   |
3. Dashboard calls generateDailyMetrics() to create new data
   |
4. Dashboard computes aggregated views (weekly, monthly, by day of week)
   |
5. Computed data flows down as props to chart components
   |
6. Chart components render Chart.js instances
```

### Data Transformation Pipeline

```
Raw Date Range
    |
    v
generateDailyMetrics() --> DailyMetric[]
    |
    +--> aggregateByWeek() --> WeeklyMetric[] --> BarChart
    |
    +--> aggregateByMonth() --> MonthlyMetric[] --> (future feature)
    |
    +--> computeSummary() --> Summary --> StatCard[]
    |
    +--> groupByDayOfWeek() --> DayOfWeekData --> PieChart
    |
    +--> raw arrays --> LineChart, AreaChart
```

## State Management

State is managed using React's built-in hooks. No external state library is required due to the application's moderate complexity.

### State Locations

| State | Location | Type | Persistence |
|-------|----------|------|-------------|
| Theme | App | `useState` | localStorage |
| Date Range | Dashboard | `useState` | none (session only) |
| Metrics Data | Dashboard | `useState` | none (regenerated) |
| Loading State | Dashboard | `useState` | none |
| Auto-Refresh | Dashboard | `useState` | none |

### Custom Hooks

- **useLocalStorage**: Synchronizes state with localStorage for theme persistence

## Utility Modules

### dataGenerator.js

Responsible for creating realistic mock business data. Uses:
- **Seeded random number generation** for reproducible data
- **Weekly seasonality** (weekend patterns, Friday boost)
- **Growth trends** (configurable monthly growth rate)
- **Random variance** for realism

### formatters.js

Provides formatting utilities:
- **formatCurrency**: US dollar formatting with compact notation
- **formatNumber**: Thousands separators with compact notation
- **formatPercentage**: Percentage with configurable decimals
- **formatDate**: Human-readable date strings
- **calculateChange**: Period-over-period comparison

### exportCSV.js

Handles data export functionality:
- **convertToCSV**: Object array to CSV string conversion
- **downloadCSV**: Browser download trigger
- **exportChartData**: Chart-specific export
- **generateFilename**: Dated filenames for exports

## Testing Strategy

Tests are organized by utility module and cover:

| Test File | Coverage |
|-----------|----------|
| `test_dataGenerator.js` | Date formatting, metric generation, aggregation, summary computation |
| `test_formatters.js` | Currency, number, percentage formatting, change calculation |
| `test_exportCSV.js` | CSV conversion, escaping, download triggering, filename generation |

### Testing Approach

- **Unit tests** for all utility functions
- **Mocked browser APIs** for DOM-dependent functions
- **Edge case coverage** for invalid inputs and boundary conditions

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 18 | Component-based UI |
| Charts | Chart.js 4 | Canvas-based chart rendering |
| Build | None (CDN) | Simple browser-based setup |
| Testing | Jest + jsdom | Unit testing |
| Styling | CSS Variables | Theming and responsive design |
| Icons | Lucide (CDN) | UI icons |

## Design Decisions

### Why CDN over Build Tool?

The project uses CDN-hosted libraries to:
- Eliminate build complexity
- Enable quick prototyping
- Reduce setup friction
- Allow direct browser execution

### Why Chart.js over D3.js?

Chart.js was chosen because:
- Simpler API for standard chart types
- Built-in responsiveness and animations
- Less boilerplate code
- Sufficient for the dashboard's needs

### Why CSS Variables for Theming?

CSS custom properties enable:
- Instant theme switching without React re-render
- Consistent styling across components
- Easy extension for additional themes
- No CSS-in-JS library dependency
