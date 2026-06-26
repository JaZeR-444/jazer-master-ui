// Scatter plot chart component
function createScatterPlot(container, data, options = {}) {
  const {
    width = 600,
    height = 400,
    margin = { top: 20, right: 30, bottom: 40, left: 40 },
    color = '#007bff',
    pointSize = 4
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Calculate min/max for x and y values
  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  // Calculate scaling factors
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  const xScale = chartWidth / (xMax - xMin || 1); // Prevent division by zero
  const yScale = chartHeight / (yMax - yMin || 1);
  
  // Draw axes
  ctx.beginPath();
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  
  // X-axis
  ctx.moveTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom);
  
  // Y-axis
  ctx.moveTo(margin.left, height - margin.bottom);
  ctx.lineTo(margin.left, margin.top);
  
  ctx.stroke();
  
  // Draw points
  data.forEach(point => {
    const x = margin.left + (point.x - xMin) * xScale;
    const y = height - margin.bottom - (point.y - yMin) * yScale;
    
    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Add label if included
    if (point.label) {
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x, y - 10);
    }
  });
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  
  // Vertical grid lines
  for (let i = 0; i <= 5; i++) {
    const x = margin.left + i * (chartWidth / 5);
    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, height - margin.bottom);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = height - margin.bottom - i * (chartHeight / 5);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
  }
  
  // Draw axis labels
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  
  // X-axis labels
  for (let i = 0; i <= 5; i++) {
    const xValue = xMin + i * (xMax - xMin) / 5;
    const x = margin.left + i * (chartWidth / 5);
    ctx.textAlign = 'center';
    ctx.fillText(xValue.toFixed(2), x, height - margin.bottom + 20);
  }
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const yValue = yMin + i * (yMax - yMin) / 5;
    const y = height - margin.bottom - i * (chartHeight / 5);
    ctx.textAlign = 'right';
    ctx.fillText(yValue.toFixed(2), margin.left - 10, y + 4);
  }
}

// Export the function
export { createScatterPlot };