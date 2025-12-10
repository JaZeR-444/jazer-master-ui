# Charts

This directory contains JavaScript components for creating various types of charts and data visualizations.

## Files

- `bubble-chart-component.js` - Component for creating bubble charts
- `histogram-component.js` - Component for creating histograms
- `line-bar-charts.js` - Components for creating line and bar charts
- `pie-donut-charts.js` - Components for creating pie and donut charts

## Usage

To use these charts, import the specific component you need:

```javascript
import { createLineChart } from './charts/line-bar-charts.js';

const container = document.getElementById('chart-container');
const data = [
  { label: 'A', value: 10 },
  { label: 'B', value: 20 },
  { label: 'C', value: 15 }
];

createLineChart(container, data);
```