/**
 * Bubble Chart Component
 * Interactive data visualization component for displaying three-dimensional data
 * Compatible with jazer-brand.css styling for bubble chart components
 */

class BubbleChart {
  /**
   * Creates a new bubble chart instance
   * @param {HTMLElement} container - Container element for the bubble chart
   * @param {Array} data - Data to visualize
   * @param {Object} options - Configuration options
   */
  constructor(container, data, options = {}) {
    this.container = container;
    this.data = data || [];
    this.options = {
      // Basic chart options
      width: options.width || 600,
      height: options.height || 400,
      margin: options.margin || { top: 20, right: 30, bottom: 40, left: 60 },
      
      // Bubble options
      minBubbleSize: options.minBubbleSize || 5,
      maxBubbleSize: options.maxBubbleSize || 30,
      bubbleColor: options.bubbleColor || 'var(--jazer-cyan, #00f2ea)',
      bubbleOpacity: options.bubbleOpacity || 0.7,
      bubbleHoverOpacity: options.bubbleHoverOpacity || 0.9,
      
      // Axes options
      showAxes: options.showAxes !== false,
      showGrid: options.showGrid !== false,
      
      // Label options
      title: options.title || 'Bubble Chart',
      xAxisLabel: options.xAxisLabel || 'X Value',
      yAxisLabel: options.yAxisLabel || 'Y Value',
      bubbleSizeLabel: options.bubbleSizeLabel || 'Size',
      
      // Styling options
      theme: options.theme || 'default', // 'default', 'dark', 'light', 'jazer'
      colorScheme: options.colorScheme || 'sequential', // 'sequential', 'diverging', 'categorical'
      
      // Interaction options
      enableTooltips: options.enableTooltips !== false,
      enableZoom: options.enableZoom !== false,
      enablePanning: options.enablePanning !== false,
      onClick: options.onClick || null,
      onMouseOver: options.onMouseOver || null,
      onMouseOut: options.onMouseOut || null,
      
      // Animation options
      enableAnimation: options.enableAnimation !== false,
      animationDuration: options.animationDuration || 500,
      
      // Performance options
      useCanvas: options.useCanvas || false, // Use canvas for large datasets
      ...options
    };

    this.svg = null;
    this.canvas = null;
    this.ctx = null;
    this.xScale = null;
    this.yScale = null;
    this.sizeScale = null;
    this.colorScale = null;
    this.tooltip = null;
    this.bubbles = [];
    
    this.init();
  }

  /**
   * Initializes the bubble chart
   */
  init() {
    if (!this.container) {
      throw new Error('Invalid container for bubble chart');
    }

    // Set up the container
    this.setupContainer();

    // Process data
    this.processData();

    // Create visualization
    if (this.options.useCanvas) {
      this.createCanvasVisualization();
    } else {
      this.createSVGVisualization();
    }

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

    // Set container styles
    this.container.style.position = 'relative';
    this.container.style.width = `${this.options.width}px`;
    this.container.style.height = `${this.options.height}px`;
    this.container.classList.add('bubble-chart-component');
    this.container.classList.add(`bubble-chart-theme-${this.options.theme}`);
  }

  /**
   * Processes the chart data
   */
  processData() {
    if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
      this.processedData = [];
      return;
    }

    // Find min/max values for scaling
    const xValues = this.data.map(d => d.x);
    const yValues = this.data.map(d => d.y);
    const sizeValues = this.data.map(d => d.size || 1);

    this.xRange = {
      min: Math.min(...xValues),
      max: Math.max(...xValues)
    };

    this.yRange = {
      min: Math.min(...yValues),
      max: Math.max(...yValues)
    };

    this.sizeRange = {
      min: Math.min(...sizeValues),
      max: Math.max(...sizeValues)
    };

    // Create scales
    const innerWidth = this.options.width - this.options.margin.left - this.options.margin.right;
    const innerHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;

    this.xScale = this.createLinearScale(this.xRange, 0, innerWidth);
    this.yScale = this.createLinearScale(this.yRange, innerHeight, 0);
    this.sizeScale = this.createLinearScale(this.sizeRange, this.options.minBubbleSize, this.options.maxBubbleSize);

    // Create color scale based on colorScheme
    this.colorScale = this.createColorScale();
  }

  /**
   * Creates a linear scale
   * @param {Object} range - Object with min and max values
   * @param {number} start - Start of the scale
   * @param {number} end - End of the scale
   * @returns {Function} Scale function
   */
  createLinearScale(range, start, end) {
    const domainRange = range.max - range.min;
    const rangeDiff = end - start;

    return {
      scale: (value) => start + (value - range.min) / domainRange * rangeDiff,
      unscale: (scaledValue) => range.min + (scaledValue - start) / rangeDiff * domainRange,
      domain: [range.min, range.max],
      range: [start, end]
    };
  }

  /**
   * Creates a color scale based on the selected color scheme
   * @returns {Function} Color scale function
   */
  createColorScale() {
    const dataLength = this.data.length;

    switch (this.options.colorScheme) {
      case 'sequential':
        return (index) => {
          const hue = 200; // Blue range
          const saturation = 70 + (index / dataLength) * 30;
          const lightness = 50 + (index / dataLength) * 30;
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };

      case 'diverging':
        return (index) => {
          const center = Math.floor(dataLength / 2);
          const hue = index < center ? 240 : 0; // Blue to red
          const saturation = 100;
          const lightness = 50 + Math.abs(index - center) / dataLength * 30; // More saturated at extremes
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        };

      case 'categorical':
        return (index) => {
          const colors = [
            '#4facfe', // blue
            '#00f2ea', // cyan
            '#f0008c', // pink
            '#ff8c52', // orange
            '#00bbf9', // light blue
            '#ffcc00', // yellow
            '#9c27b0', // purple
            '#4caf50'  // green
          ];
          return colors[index % colors.length];
        };

      default:
        return () => this.options.bubbleColor;
    }
  }

  /**
   * Creates the bubble chart visualization using SVG
   */
  createSVGVisualization() {
    // Create SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.options.width);
    this.svg.setAttribute('height', this.options.height);
    this.svg.classList.add('bubble-chart-svg');
    
    // Calculate dimensions
    const innerWidth = this.options.width - this.options.margin.left - this.options.margin.right;
    const innerHeight = this.options.height - this.options.margin.top - this.options.margin.bottom;
    
    // Create group for chart content with margins applied
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${this.options.margin.left}, ${this.options.margin.top})`);
    
    // Add axes if enabled
    if (this.options.showAxes) {
      this.createAxes(chartGroup, innerWidth, innerHeight);
    }
    
    // Create bubble circles
    this.data.forEach((datum, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      
      const x = this.xScale.scale(datum.x);
      const y = this.yScale.scale(datum.y);
      const radius = this.sizeScale.scale(datum.size || 1);
      const color = this.colorScale(index);
      
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', this.options.bubbleOpacity);
      circle.setAttribute('stroke', 'var(--border-lighter, #222)');
      circle.setAttribute('stroke-width', '1');
      circle.setAttribute('class', 'bubble-chart-bubble');
      circle.setAttribute('data-index', index);
      circle.setAttribute('data-value', JSON.stringify(datum));
      
      // Add event listeners
      if (this.options.onClick) {
        circle.addEventListener('click', (e) => {
          this.options.onClick(datum, e);
        });
      }
      
      if (this.options.onMouseOver) {
        circle.addEventListener('mouseover', (e) => {
          this.options.onMouseOver(datum, e);
        });
      }
      
      if (this.options.onMouseOut) {
        circle.addEventListener('mouseout', (e) => {
          this.options.onMouseOut(datum, e);
        });
      }
      
      // Add tooltip functionality if enabled
      if (this.options.enableTooltips) {
        circle.addEventListener('mouseover', (e) => {
          this.showTooltip(datum, e);
        });
        
        circle.addEventListener('mouseout', () => {
          this.hideTooltip();
        });
      }
      
      chartGroup.appendChild(circle);
    });
    
    // Add bubbles to SVG
    this.svg.appendChild(chartGroup);
    
    // Add to container
    this.container.appendChild(this.svg);
  }

  /**
   * Creates the bubble chart visualization using Canvas
   */
  createCanvasVisualization() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.classList.add('bubble-chart-canvas');
    
    this.ctx = this.canvas.getContext('2d');
    
    // Draw bubbles
    this.data.forEach((datum, index) => {
      const x = this.xScale.scale(datum.x);
      const y = this.yScale.scale(datum.y);
      const radius = this.sizeScale.scale(datum.size || 1);
      const color = this.colorScale(index);
      
      this.drawBubble(this.ctx, x, y, radius, color, datum);
    });
    
    // Add to container
    this.container.appendChild(this.canvas);
    
    // Add event handling for canvas bubbles
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const bubble = this.findBubbleAt(x, y);
      if (bubble && this.options.onClick) {
        this.options.onClick(bubble.datum, e);
      }
    });
    
    if (this.options.enableTooltips) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const bubble = this.findBubbleAt(x, y);
        if (bubble) {
          this.showTooltip(bubble.datum, e);
        } else {
          this.hideTooltip();
        }
      });
    }
  }

  /**
   * Draws a bubble on the canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} radius - Radius of the bubble
   * @param {string} color - Color of the bubble
   * @param {Object} datum - Data point for the bubble
   */
  drawBubble(ctx, x, y, radius, color, datum) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = this.options.bubbleOpacity;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'var(--border-lighter, #222)';
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  /**
   * Finds a bubble at the specified coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Bubble object if found, null otherwise
   */
  findBubbleAt(x, y) {
    for (let i = 0; i < this.data.length; i++) {
      const datum = this.data[i];
      const bubbleX = this.xScale.scale(datum.x);
      const bubbleY = this.yScale.scale(datum.y);
      const bubbleRadius = this.sizeScale.scale(datum.size || 1);
      
      // Calculate distance between point and bubble center
      const distance = Math.sqrt(Math.pow(x - bubbleX, 2) + Math.pow(y - bubbleY, 2));
      
      if (distance <= bubbleRadius) {
        return { datum, index: i };
      }
    }
    
    return null;
  }

  /**
   * Creates axes for the chart
   * @param {SVGElement} chartGroup - Group to add axes to
   * @param {number} innerWidth - Inner width of the chart
   * @param {number} innerHeight - Inner height of the chart
   */
  createAxes(chartGroup, innerWidth, innerHeight) {
    // Create X axis
    const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxisGroup.setAttribute('class', 'x-axis');
    xAxisGroup.setAttribute('transform', `translate(0, ${innerHeight})`);
    
    // Add X axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('x2', innerWidth);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('class', 'axis-line');
    xAxisGroup.appendChild(xAxisLine);
    
    // Add X axis ticks and labels
    const xTickCount = 5;
    const xTickStep = (this.xRange.max - this.xRange.min) / (xTickCount - 1);
    
    for (let i = 0; i < xTickCount; i++) {
      const value = this.xRange.min + i * xTickStep;
      const position = this.xScale.scale(value);
      
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', position);
      tick.setAttribute('y1', 0);
      tick.setAttribute('x2', position);
      tick.setAttribute('y2', 6);
      tick.setAttribute('class', 'axis-tick');
      xAxisGroup.appendChild(tick);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', position);
      label.setAttribute('y', 20);
      label.setAttribute('class', 'axis-label');
      label.setAttribute('text-anchor', 'middle');
      label.textContent = value.toFixed(2);
      xAxisGroup.appendChild(label);
      
      // Add grid line if enabled
      if (this.options.showGrid) {
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', position);
        gridLine.setAttribute('y1', 0);
        gridLine.setAttribute('x2', position);
        gridLine.setAttribute('y2', -innerHeight);
        gridLine.setAttribute('class', 'grid-line');
        chartGroup.appendChild(gridLine);
      }
    }
    
    // Add X axis label
    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', innerWidth / 2);
    xLabel.setAttribute('y', this.options.margin.bottom - 10);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.setAttribute('class', 'axis-label');
    xLabel.textContent = this.options.xAxisLabel;
    xAxisGroup.appendChild(xLabel);
    
    chartGroup.appendChild(xAxisGroup);

    // Create Y axis
    const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxisGroup.setAttribute('class', 'y-axis');
    
    // Add Y axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', innerHeight);
    yAxisLine.setAttribute('class', 'axis-line');
    yAxisGroup.appendChild(yAxisLine);
    
    // Add Y axis ticks and labels
    const yTickCount = 5;
    const yTickStep = (this.yRange.max - this.yRange.min) / (yTickCount - 1);
    
    for (let i = 0; i < yTickCount; i++) {
      const value = this.yRange.min + i * yTickStep;
      const position = this.yScale.scale(value);
      
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', 0);
      tick.setAttribute('y1', position);
      tick.setAttribute('x2', -6);
      tick.setAttribute('y2', position);
      tick.setAttribute('class', 'axis-tick');
      yAxisGroup.appendChild(tick);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', -10);
      label.setAttribute('y', position + 4);
      label.setAttribute('class', 'axis-label');
      label.setAttribute('text-anchor', 'end');
      label.textContent = value.toFixed(2);
      yAxisGroup.appendChild(label);
      
      // Add grid line if enabled
      if (this.options.showGrid) {
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', 0);
        gridLine.setAttribute('y1', position);
        gridLine.setAttribute('x2', innerWidth);
        gridLine.setAttribute('y2', position);
        gridLine.setAttribute('class', 'grid-line');
        chartGroup.appendChild(gridLine);
      }
    }
    
    // Add Y axis label
    const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yLabel.setAttribute('transform', 'rotate(-90)');
    yLabel.setAttribute('x', -innerHeight / 2);
    yLabel.setAttribute('y', -this.options.margin.left + 15);
    yLabel.setAttribute('text-anchor', 'middle');
    yLabel.setAttribute('class', 'axis-label');
    yLabel.textContent = this.options.yAxisLabel;
    yAxisGroup.appendChild(yLabel);
    
    chartGroup.appendChild(yAxisGroup);
  }

  /**
   * Shows a tooltip for a data point
   * @param {Object} datum - Data point
   * @param {Event} event - Event that triggered the tooltip
   */
  showTooltip(datum, event) {
    if (!this.options.enableTooltips) return;

    // Remove existing tooltip
    this.hideTooltip();

    // Create tooltip element
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'bubble-chart-tooltip';
    this.tooltip.style.cssText = `
      position: absolute;
      background: var(--bg-darker, #111);
      border: 1px solid var(--border-default, #4facfe);
      color: var(--text-light, #fff);
      padding: 8px 12px;
      border-radius: 6px;
      pointer-events: none;
      z-index: 10000;
      font-size: 0.9rem;
      white-space: nowrap;
    `;

    // Set tooltip content
    this.tooltip.textContent = this.getTooltipContent(datum);

    // Position tooltip near the mouse cursor
    this.tooltip.style.left = `${event.clientX + 10}px`;
    this.tooltip.style.top = `${event.clientY - 30}px`;

    // Add to document
    document.body.appendChild(this.tooltip);
  }

  /**
   * Gets the content for the tooltip
   * @param {Object} datum - Data point
   * @returns {string} Tooltip content
   */
  getTooltipContent(datum) {
    return `
      X: ${datum.x}<br>
      Y: ${datum.y}<br>
      Size: ${datum.size || 1}<br>
      ${datum.label ? `Label: ${datum.label}` : ''}
    `.trim();
  }

  /**
   * Hides the tooltip
   */
  hideTooltip() {
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
      this.tooltip = null;
    }
  }

  /**
   * Binds event listeners for the chart
   */
  bindEvents() {
    // Handle zoom if enabled
    if (this.options.enableZoom) {
      this.container.addEventListener('wheel', this.handleZoom.bind(this));
    }
  }

  /**
   * Handles zoom events
   * @param {WheelEvent} e - Wheel event
   */
  handleZoom(e) {
    e.preventDefault();
    
    // Implement zoom functionality based on wheel movement
    const delta = e.deltaY;
    if (delta < 0) {
      // Zoom in
      this.zoom(1.1);
    } else {
      // Zoom out
      this.zoom(0.9);
    }
  }

  /**
   * Zooms the chart by a factor
   * @param {number} factor - Zoom factor
   */
  zoom(factor) {
    // In a complete implementation, this would adjust the scale factors
    // For now, this is a placeholder functionality
  }

  /**
   * Updates the chart with new data
   * @param {Array} newData - New data for the chart
   * @param {Object} newOptions - New options for the chart
   * @returns {BubbleChart} Instance for method chaining
   */
  update(newData, newOptions = {}) {
    this.data = newData || this.data;
    this.options = { ...this.options, ...newOptions };
    
    // Process the new data
    this.processData();
    
    // Clear the container
    this.container.innerHTML = '';
    
    // Create visualization again
    if (this.options.useCanvas) {
      this.createCanvasVisualization();
    } else {
      this.createSVGVisualization();
    }
    
    return this;
  }

  /**
   * Adds a new data point to the chart
   * @param {Object} point - Data point to add
   * @returns {BubbleChart} Instance for method chaining
   */
  addPoint(point) {
    if (typeof point === 'object' && point.x !== undefined && point.y !== undefined) {
      this.data.push(point);
      this.update(this.data);
    }
    return this;
  }

  /**
   * Removes a data point from the chart
   * @param {number} index - Index of the data point to remove
   * @returns {BubbleChart} Instance for method chaining
   */
  removePoint(index) {
    if (index >= 0 && index < this.data.length) {
      this.data.splice(index, 1);
      this.update(this.data);
    }
    return this;
  }

  /**
   * Gets the chart dimensions
   * @returns {Object} Object with width and height
   */
  getDimensions() {
    return { width: this.options.width, height: this.options.height };
  }

  /**
   * Sets the chart dimensions
   * @param {number} width - New width
   * @param {number} height - New height
   * @returns {BubbleChart} Instance for method chaining
   */
  setDimensions(width, height) {
    if (typeof width === 'number') this.options.width = width;
    if (typeof height === 'number') this.options.height = height;
    this.update();
    return this;
  }

  /**
   * Exports the chart as a data URL (for image export)
   * @returns {string} Data URL of the chart
   */
  exportAsImage() {
    if (this.canvas) {
      // For canvas, just return the data URL
      return this.canvas.toDataURL();
    } else if (this.svg) {
      // For SVG, we need to convert to image
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(this.svg);
      const encodedSvg = encodeURIComponent(svgString);
      return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
    }
    return null;
  }

  /**
   * Adds dynamic styles for the bubble chart
   */
  addDynamicStyles() {
    if (document.getElementById('bubble-chart-styles')) return;

    const style = document.createElement('style');
    style.id = 'bubble-chart-styles';
    style.textContent = `
      .bubble-chart-component {
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .bubble-chart-svg {
        width: 100%;
        height: 100%;
      }
      
      .bubble-chart-canvas {
        width: 100%;
        height: 100%;
      }
      
      .bubble-chart-bubble {
        cursor: pointer;
        transition: all 0.15s ease;
      }
      
      .bubble-chart-bubble:hover {
        opacity: var(--bubble-hover-opacity, 0.9) !important;
        transform: scale(1.1);
      }
      
      .axis-line {
        stroke: var(--border-default, #4facfe);
        stroke-width: 2;
      }
      
      .axis-tick {
        stroke: var(--border-default, #4facfe);
        stroke-width: 1;
      }
      
      .axis-label {
        fill: var(--text-light, #fff);
        font-size: 0.8rem;
      }
      
      .grid-line {
        stroke: var(--border-lighter, #222);
        stroke-width: 1;
        stroke-dasharray: 4;
      }
      
      .bubble-chart-tooltip {
        position: absolute;
        background: var(--bg-darker, #111);
        border: 1px solid var(--jazer-cyan, #00f2ea);
        color: var(--text-light, #fff);
        padding: 8px 12px;
        border-radius: 6px;
        pointer-events: none;
        z-index: 10000;
        font-size: 0.9rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }
      
      .chart-title {
        fill: var(--jazer-cyan, #00f2ea);
        font-size: 1.2rem;
        font-weight: bold;
        text-anchor: middle;
      }
      
      .bubble-chart-theme-dark {
        background: #000;
      }
      
      .bubble-chart-theme-light {
        background: #fff;
        color: #000;
      }
      
      .bubble-chart-theme-jazer {
        background: var(--bg-dark, #0a0a0a);
      }
      
      /* Animation related styles */
      .bubble-chart-animating {
        animation: chartFadeIn 0.3s ease-out;
      }
      
      @keyframes chartFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the bubble chart and cleans up resources
   */
  destroy() {
    // Remove event listeners
    if (this.options.enableZoom) {
      this.container.removeEventListener('wheel', this.handleZoom);
    }

    // Remove tooltip if exists
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    // Clear container
    this.container.innerHTML = '';
    this.container.classList.remove('bubble-chart-component');
  }

  /**
   * Creates a bubble chart from a configuration object
   * @param {Object} config - Configuration object
   * @returns {BubbleChart} New bubble chart instance
   */
  static createFromConfig(config) {
    const container = typeof config.container === 'string' 
      ? document.querySelector(config.container) 
      : config.container;
    
    return new BubbleChart(
      container,
      config.data || [],
      config.options || {}
    );
  }

  /**
   * Creates a bubble chart from CSV data
   * @param {string} csvData - CSV formatted data
   * @param {Object} options - Chart options
   * @returns {BubbleChart} New bubble chart instance
   */
  static createFromCSV(csvData, options) {
    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => {
        const trimmed = v.trim();
        // Try to convert to number if possible
        return isNaN(parseFloat(trimmed)) ? trimmed : parseFloat(trimmed);
      });
      
      const point = {};
      headers.forEach((header, index) => {
        point[header.toLowerCase()] = values[index];
      });
      
      data.push(point);
    }

    return new BubbleChart(document.createElement('div'), data, options);
  }

  /**
   * Creates a bubble chart from JSON data
   * @param {string|Object} jsonData - JSON data as string or object
   * @param {Object} options - Chart options
   * @returns {BubbleChart} New bubble chart instance
   */
  static createFromJSON(jsonData, options) {
    let parsedData;
    
    if (typeof jsonData === 'string') {
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        console.error('Invalid JSON data provided');
        parsedData = [];
      }
    } else {
      parsedData = jsonData;
    }

    if (!Array.isArray(parsedData)) {
      parsedData = [];
    }

    return new BubbleChart(document.createElement('div'), parsedData, options);
  }
}

/**
 * Bubble chart utility functions
 */
const BubbleChartUtils = {
  /**
   * Generates sample data for demo purposes
   * @param {number} count - Number of data points to generate
   * @param {Object} options - Options for data generation
   * @returns {Array} Array of sample data points
   */
  generateSampleData(count = 10, options = {}) {
    const {
      xRange = [0, 100],
      yRange = [0, 100],
      sizeRange = [1, 10],
      labels = true
    } = options;
    
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        x: Math.random() * (xRange[1] - xRange[0]) + xRange[0],
        y: Math.random() * (yRange[1] - yRange[0]) + yRange[0],
        size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
        label: labels ? `Point ${i + 1}` : undefined
      });
    }
    
    return data;
  },

  /**
   * Converts data for bubble chart format
   * @param {Array} data - Raw data array
   * @param {Object} mapping - Property mapping
   * @returns {Array} Converted data array
   */
  convertToBubbleChartData(data, mapping = {}) {
    const {
      x: xProp = 'x',
      y: yProp = 'y',
      size: sizeProp = 'size',
      label: labelProp = 'label'
    } = mapping;
    
    return data.map(item => ({
      x: item[xProp] || item.x || 0,
      y: item[yProp] || item.y || 0,
      size: item[sizeProp] || item.size || 1,
      label: item[labelProp] || item.label || undefined
    }));
  },

  /**
   * Creates a bubble chart with default styling
   * @param {HTMLElement} container - Container for the chart
   * @param {Array} data - Data for the chart
   * @param {Object} options - Chart options
   * @returns {BubbleChart} New bubble chart instance
   */
  createDefaultChart(container, data, options = {}) {
    const defaultOptions = {
      width: 600,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 60 },
      showAxes: true,
      showGrid: true,
      enableTooltips: true,
      theme: 'jazer',
      colorScheme: 'sequential',
      minBubbleSize: 5,
      maxBubbleSize: 30,
      bubbleOpacity: 0.7,
      bubbleHoverOpacity: 0.9,
      ...options
    };
    
    return new BubbleChart(container, data, defaultOptions);
  }
};

/**
 * Creates a new bubble chart instance
 * @param {HTMLElement} container - Container for the chart
 * @param {Array} data - Data for the chart
 * @param {Object} options - Chart options
 * @returns {BubbleChart} New bubble chart instance
 */
function createBubbleChart(container, data, options = {}) {
  return new BubbleChart(container, data, options);
}

// Create default instance
const bubbleChart = new BubbleChart(
  document.createElement('div'), 
  [], 
  { width: 600, height: 400 }
);

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BubbleChart,
    BubbleChartUtils,
    createBubbleChart,
    bubbleChart
  };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BubbleChart = BubbleChart;
  window.BubbleChartUtils = BubbleChartUtils;
  window.createBubbleChart = createBubbleChart;
  window.bubbleChart = bubbleChart;
}