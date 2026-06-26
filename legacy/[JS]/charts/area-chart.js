// Area chart component
function createAreaChart(container, data, options = {}) {
  const {
    width = 600,
    height = 400,
    margin = { top: 20, right: 30, bottom: 40, left: 40 },
    color = '#007bff',
    fillOpacity = 0.3
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // Calculate scaling factors
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = height - margin.bottom - (i * chartHeight / 5);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
  }
  
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
  
  // Draw area
  ctx.beginPath();
  ctx.fillStyle = color + Math.floor(fillOpacity * 255).toString(16).padStart(2, '0');
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  // Start from the bottom left
  ctx.moveTo(margin.left, height - margin.bottom);
  
  // Draw line to each point
  data.forEach((point, i) => {
    const x = margin.left + (i * (chartWidth / (data.length - 1)));
    const y = height - margin.bottom - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    
    ctx.lineTo(x, y);
  });
  
  // Draw line back to bottom right
  ctx.lineTo(width - margin.right, height - margin.bottom);
  ctx.closePath();
  ctx.fill();
  
  // Draw line on top of the area
  ctx.beginPath();
  data.forEach((point, i) => {
    const x = margin.left + (i * (chartWidth / (data.length - 1)));
    const y = height - margin.bottom - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  
  ctx.stroke();
  
  // Draw points
  data.forEach((point, i) => {
    const x = margin.left + (i * (chartWidth / (data.length - 1)));
    const y = height - margin.bottom - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  });
  
  // Draw labels
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  
  // X-axis labels
  data.forEach((point, i) => {
    const x = margin.left + (i * (chartWidth / (data.length - 1)));
    ctx.textAlign = 'center';
    ctx.fillText(point.label, x, height - margin.bottom + 20);
  });
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const value = minValue + (i * (maxValue - minValue) / 5);
    const y = height - margin.bottom - (i * chartHeight / 5);
    ctx.textAlign = 'right';
    ctx.fillText(value.toFixed(2), margin.left - 10, y + 4);
  }
}

// Export the function
export { createAreaChart };