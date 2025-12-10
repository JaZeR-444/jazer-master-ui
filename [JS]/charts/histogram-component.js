/**
 * Histogram Component
 * Data visualization component for displaying distributions
 * Compatible with jazer-brand.css styling for chart components
 */

class Histogram {
  /**
   * Creates a new histogram instance
   * @param {HTMLElement} container - Container element for the histogram
   * @param {Object} data - Data to visualize in the histogram
   * @param {Object} options - Configuration options
   */
  constructor(container, data, options = {}) {
    this.container = container;
    this.data = data || [];
    this.options = {
      // Basic options
      width: options.width || 600,
      height: options.height || 400,
      margin: options.margin || { top: 20, right: 30, bottom: 40, left: 60 },
      bins: options.bins || 10,
      
      // Styling options
      theme: options.theme || 'default', // 'default', 'dark', 'light', 'jazer'
      colorScheme: options.colorScheme || 'monochromatic',
      showAxes: options.showAxes !== false,
      showGrid: options.showGrid !== false,
      showTooltip: options.showTooltip !== false,
      
      // Behavior options
      enableAnimation: options.enableAnimation !== false,
      animationDuration: options.animationDuration || 500,
      onClick: options.onClick || null,
      onMouseOver: options.onMouseOver || null,
      
      // Label options
      title: options.title || 'Histogram',
      xAxisLabel: options.xAxisLabel || 'Value',
      yAxisLabel: options.yAxisLabel || 'Frequency',
      ...options
    };

    this.svg = null;
    this.xScale = null;
    this.yScale = null;
    this.xAxis = null;
    this.yAxis = null;
    this.tooltip = null;
    this.histogramData = [];
    this.binWidth = 0;
    
    this.init();
  }

  /**
   * Initializes the histogram
   */
  init() {
    if (!this.container) {
      throw new Error('Invalid container for histogram');
    }

    // Set up the container
    this.setupContainer();

    // Calculate histogram data
    this.calculateHistogram();

    // Create visualization
    this.createVisualization();

    // Add event listeners
    this.bindEvents();

    // Add dynamic styles
    this.addDynamicStyles();
  }

  /**
   * Sets up the container element
   */
  setupContainer() {
    // Clear container
    this.container.innerHTML = '';

    // Add histogram class
    this.container.classList.add('histogram-component');
    this.container.classList.add(`histogram-theme-${this.options.theme}`);
  }

  /**
   * Calculates histogram bins and frequencies
   */
  calculateHistogram() {
    if (!this.data || this.data.length === 0) {
      this.histogramData = [];
      return;
    }

    // Find min and max values
    const values = this.data.map(d => typeof d === 'object' ? d.value : d);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Calculate bin width
    this.binWidth = (maxValue - minValue) / this.options.bins;

    // Create bins
    const bins = Array(this.options.bins).fill(0);

    // Calculate frequencies
    for (const value of values) {
      const binIndex = Math.min(
        Math.floor((value - minValue) / this.binWidth),
        this.options.bins - 1
      );
      bins[binIndex]++;
    }

    // Create histogram data
    this.histogramData = bins.map((frequency, index) => ({
      value: minValue + index * this.binWidth,
      frequency: frequency,
      binStart: minValue + index * this.binWidth,
      binEnd: minValue + (index + 1) * this.binWidth
    }));
  }

  /**
   * Creates the visualization
   */
  createVisualization() {
    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.options.width);
    this.svg.setAttribute('height', this.options.height);
    this.svg.classList.add('histogram-svg');
    
    this.container.appendChild(this.svg);

    // Calculate dimensions
    const innerWidth = this.options.width - this.options.margin.left - this.options.margin.right;
    const innerHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;

    // Create scales
    this.xScale = this.createLinearScale(
      this.histogramData.map(d => d.value),
      0, innerWidth
    );
    
    this.yScale = this.createLinearScale(
      [0, Math.max(...this.histogramData.map(d => d.frequency))],
      innerHeight, 0
    );

    // Create axes if enabled
    if (this.options.showAxes) {
      this.createAxes(innerWidth, innerHeight);
    }

    // Create bars
    this.createBars(innerWidth, innerHeight);

    // Add title if specified
    if (this.options.title) {
      this.createTitle();
    }
  }

  /**
   * Creates scales for the histogram
   */
  createLinearScale(domain, rangeStart, rangeEnd) {
    const min = Math.min(...domain);
    const max = Math.max(...domain);
    const range = rangeEnd - rangeStart;
    
    return {
      scale: (value) => rangeStart + (value - min) / (max - min) * range,
      unscale: (scaledValue) => min + (scaledValue - rangeStart) / range * (max - min),
      domain: [min, max],
      range: [rangeStart, rangeEnd]
    };
  }

  /**
   * Creates axes for the histogram
   * @param {number} innerWidth - Inner width of the chart
   * @param {number} innerHeight - Inner height of the chart
   */
  createAxes(innerWidth, innerHeight) {
    // Create X axis
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('class', 'x-axis');
    xAxisGroup.setAttribute('transform', `translate(${this.options.margin.left}, ${this.options.margin.top + innerHeight})`);
    
    // Add X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('x2', innerWidth);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('class', 'axis-line');
    xAxisGroup.appendChild(xAxisLine);
    
    // Add X axis ticks and labels
    const xTickValues = this.getTickValues(this.xScale.domain[0], this.xScale.domain[1], 5);
    xTickValues.forEach((tickValue, index) => {
      const scaledValue = this.xScale.scale(tickValue);
      
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', scaledValue);
      tick.setAttribute('y1', 0);
      tick.setAttribute('x2', scaledValue);
      tick.setAttribute('y2', 6);
      tick.setAttribute('class', 'axis-tick');
      xAxisGroup.appendChild(tick);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', scaledValue);
      label.setAttribute('y', 20);
      label.setAttribute('class', 'axis-label');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = tickValue.toFixed(2);
      xAxisGroup.appendChild(label);
    });
    
    this.svg.appendChild(xAxisGroup);

    // Create Y axis
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxisGroup.setAttribute('class', 'y-axis');
    yAxisGroup.setAttribute('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);
    
    // Add Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', innerHeight);
    yAxisLine.setAttribute('class', 'axis-line');
    yAxisGroup.appendChild(yAxisLine);
    
    // Add Y axis ticks and labels
    const yMaxValue = this.yScale.domain[1];
    const yTickValues = this.getTickValues(0, yMaxValue, 5);
    yTickValues.forEach((tickValue) => {
      const scaledValue = this.yScale.scale(tickValue);
      
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', 0);
      tick.setAttribute('y1', scaledValue);
      tick.setAttribute('x2', -6);
      tick.setAttribute('y2', scaledValue);
      tick.setAttribute('class', 'axis-tick');
      yAxisGroup.appendChild(tick);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', -10);
      label.setAttribute('y', scaledValue + 4);
      label.setAttribute('class', 'axis-label');
      label.setAttribute('text-anchor', 'end');
      label.textContent = tickValue;
      yAxisGroup.appendChild(label);
    });
    
    this.svg.appendChild(yAxisGroup);
  }

  /**
   * Creates bars for the histogram
   * @param {number} innerWidth - Inner width of the chart
   * @param {number} innerHeight - Inner height of the chart
   */
  createBars(innerWidth, innerHeight) {
    const barWidth = innerWidth / this.histogramData.length - 2;
    
    this.histogramData.forEach((datum, index) => {
      const x = this.xScale.scale(datum.value);
      const y = this.yScale.scale(datum.frequency);
      
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('class', 'histogram-bar');
      bar.setAttribute('x', this.options.margin.left + x);
      bar.setAttribute('y', this.options.margin.top + y);
      bar.setAttribute('width', Math.max(0, barWidth));
      bar.setAttribute('height', Math.max(0, innerHeight - (y - this.options.margin.top)));
      
      // Set color based on theme
      const color = this.getBarColor(index);
      bar.setAttribute('fill', color);
      
      if (this.options.enableAnimation) {
        // Animate bars on load
        bar.style.animation = `histogram-rise ${this.options.animationDuration}ms ease-in-out`;
      }
      
      // Add event listeners
      if (this.options.onClick) {
        bar.addEventListener('click', (e) => this.options.onClick(datum, e));
      }
      
      if (this.options.onMouseOver) {
        bar.addEventListener('mouseover', (e) => this.options.onMouseOver(datum, e));
      }
      
      this.svg.appendChild(bar);
    });
  }

  /**
   * Creates the chart title
   */
  createTitle() {
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('class', 'chart-title');
    title.setAttribute('x', this.options.width / 2);
    title.setAttribute('y', 20);
    title.setAttribute('text-anchor', 'middle');
    title.textContent = this.options.title;
    
    this.svg.appendChild(title);
  }

  /**
   * Gets bar color based on theme and index
   * @param {number} index - Index of the bar
   * @returns {string} Color value
   */
  getBarColor(index) {
    switch (this.options.colorScheme) {
      case 'monochromatic':
        return this.getColorForTheme();
      case 'sequential':
        return this.getSequentialColor(index, this.histogramData.length);
      case 'diverging':
        return this.getDivergingColor(index, this.histogramData.length);
      default:
        return this.getColorForTheme();
    }
  }

  /**
   * Gets color appropriate for the current theme
   * @returns {string} Theme-appropriate color
   */
  getColorForTheme() {
    switch (this.options.theme) {
      case 'dark':
        return '#4facfe';
      case 'light':
        return '#007acc';
      case 'jazer':
        return '#00f2ea';
      default:
        return '#4facfe';
    }
  }

  /**
   * Gets a sequential color based on index
   * @param {number} index - Index in the sequence
   * @param {number} total - Total number of items
   * @returns {string} Sequential color
   */
  getSequentialColor(index, total) {
    const hue = 200; // Blue range
    const saturation = 100;
    const lightness = 50 + (index / total) * 30;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Gets a diverging color based on index
   * @param {number} index - Index in the sequence
   * @param {number} total - Total number of items
   * @returns {string} Diverging color
   */
  getDivergingColor(index, total) {
    const center = Math.floor(total / 2);
    const hue = index < center ? 240 : 0; // Blue to red
    const saturation = 100;
    const lightness = 50 + Math.abs(index - center) / total * 30; // More saturated at extremes
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Generates tick values for an axis
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} count - Number of ticks
   * @returns {Array} Array of tick values
   */
  getTickValues(min, max, count) {
    const range = max - min;
    const step = range / (count - 1);
    const ticks = [];
    
    for (let i = 0; i < count; i++) {
      ticks.push(min + i * step);
    }
    
    return ticks;
  }

  /**
   * Binds event listeners for the histogram
   */
  bindEvents() {
    // Add resize listener to handle responsive behavior
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Add zoom/pan functionality if enabled
    if (this.options.enableZoomPan) {
      this.svg.addEventListener('wheel', this.handleZoom.bind(this));
    }
  }

  /**
   * Handles window resize event
   */
  handleResize() {
    // In a complete implementation, this would handle responsive behavior
    // For now, just clear and redraw with new dimensions if container size changes
  }

  /**
   * Handles zoom event
   * @param {WheelEvent} e - Wheel event
   */
  handleZoom(e) {
    e.preventDefault();
    // In a complete implementation, this would handle zooming
  }

  /**
   * Updates the histogram with new data
   * @param {Array} newData - New data to visualize
   * @param {Object} newOptions - New options to apply
   */
  update(newData, newOptions = {}) {
    if (newData) this.data = newData;
    if (Object.keys(newOptions).length > 0) this.options = { ...this.options, ...newOptions };

    // Recalculate histogram data
    this.calculateHistogram();

    // Remove existing visualization
    this.container.innerHTML = '';

    // Create new visualization
    this.createVisualization();
  }

  /**
   * Adds dynamic styles for the histogram
   */
  addDynamicStyles() {
    if (document.getElementById('histogram-styles')) return;

    const style = document.createElement('style');
    style.id = 'histogram-styles';
    style.textContent = `
      .histogram-component {
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        padding: 15px;
      }
      
      .histogram-svg {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .histogram-bar {
        transition: fill 0.2s ease, opacity 0.2s ease;
      }
      
      .histogram-bar:hover {
        opacity: 0.8;
      }
      
      .axis-line {
        stroke: var(--border-default, #4facfe);
        stroke-width: 1;
      }
      
      .axis-tick {
        stroke: var(--border-default, #4facfe);
        stroke-width: 1;
      }
      
      .axis-label {
        fill: var(--text-light, #fff);
        font-size: 0.8rem;
      }
      
      .chart-title {
        fill: var(--jazer-cyan, #00f2ea);
        font-size: 1.2rem;
        font-weight: bold;
      }
      
      .histogram-theme-dark {
        background: #000;
      }
      
      .histogram-theme-light {
        background: #fff;
        color: #000;
      }
      
      .histogram-theme-jazer {
        background: #000;
      }
      
      /* Animation for bars */
      @keyframes histogram-rise {
        from {
          height: 0;
          y: 100%;
        }
        to {
          height: var(--final-height);
          y: var(--final-y);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the histogram and cleans up
   */
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Clear container
    this.container.innerHTML = '';
    this.container.classList.remove('histogram-component');
  }
}

/**
 * Creates a new histogram instance
 * @param {HTMLElement} container - Container for the histogram
 * @param {Array} data - Data to visualize
 * @param {Object} options - Configuration options
 * @returns {Histogram} New histogram instance
 */
function createHistogram(container, data, options = {}) {
  return new Histogram(container, data, options);
}

/**
 * Histogram utilities for common operations
 */
const HistogramUtils = {
  /**
   * Creates a histogram from numerical data with automatic binning
   * @param {Array} data - Array of numerical values
   * @param {number} bins - Number of bins (default: 10)
   * @returns {Array} Histogram data array with value and frequency
   */
  createFromData(data, bins = 10) {
    if (!Array.isArray(data) || data.length === 0) return [];
    
    // Filter out non-numeric values
    const numericData = data.filter(d => typeof d === 'number' && !isNaN(d));
    
    if (numericData.length === 0) return [];
    
    const minValue = Math.min(...numericData);
    const maxValue = Math.max(...numericData);
    const binWidth = (maxValue - minValue) / bins;
    
    // Create bins
    const binsArray = Array(bins).fill(0);
    const binLabels = Array(bins).fill(0).map((_, i) => 
      minValue + i * binWidth
    );
    
    // Calculate frequencies
    for (const value of numericData) {
      const binIndex = Math.min(
        Math.floor((value - minValue) / binWidth),
        bins - 1
      );
      binsArray[binIndex]++;
    }
    
    // Create histogram data
    return binsArray.map((frequency, index) => ({
      value: binLabels[index],
      frequency,
      binStart: minValue + index * binWidth,
      binEnd: minValue + (index + 1) * binWidth
    }));
  },
  
  /**
   * Normalizes histogram data to percentages
   * @param {Array} histogramData - Histogram data to normalize
   * @returns {Array} Normalized histogram data
   */
  normalizeToPercentages(histogramData) {
    if (!Array.isArray(histogramData)) return [];
    
    const total = histogramData.reduce((sum, bin) => sum + bin.frequency, 0);
    
    if (total === 0) return histogramData;
    
    return histogramData.map(bin => ({
      ...bin,
      percentage: (bin.frequency / total) * 100
    }));
  },
  
  /**
   * Gets statistical measures from histogram data
   * @param {Array} histogramData - Histogram data
   * @returns {Object} Statistical measures
   */
  getStatistics(histogramData) {
    if (!Array.isArray(histogramData) || histogramData.length === 0) return null;
    
    const frequencies = histogramData.map(bin => bin.frequency);
    const total = frequencies.reduce((sum, freq) => sum + freq, 0);
    
    if (total === 0) return null;
    
    // Calculate mean
    const weightedSum = histogramData.reduce((sum, bin) => 
      sum + bin.value * bin.frequency, 0);
    const mean = weightedSum / total;
    
    // Calculate variance
    const variance = histogramData.reduce((sum, bin) => {
      const diff = bin.value - mean;
      return sum + diff * diff * bin.frequency;
    }, 0) / total;
    
    // Calculate mode (most frequent bin)
    const maxFreq = Math.max(...frequencies);
    const modeBin = histogramData.find(bin => bin.frequency === maxFreq);
    const mode = modeBin ? modeBin.value : null;
    
    return {
      mean,
      variance,
      stdDev: Math.sqrt(variance),
      mode,
      total,
      minFrequency: Math.min(...frequencies),
      maxFrequency: maxFreq,
      median: histogramData[Math.floor(histogramData.length / 2)]?.value || null
    };
  }
};

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Histogram,
    createHistogram,
    HistogramUtils
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Histogram = Histogram;
  window.createHistogram = createHistogram;
  window.HistogramUtils = HistogramUtils;
}