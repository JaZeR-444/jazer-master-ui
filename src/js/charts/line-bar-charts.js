// Line chart component
function createLineChart(container, data, options = {}) {
  const {
    width = 600,
    height = 400,
    margin = { top: 20, right: 30, bottom: 40, left: 40 },
    color = '#007bff'
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
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom); // X-axis
  ctx.lineTo(width - margin.right, margin.top); // Y-axis
  ctx.strokeStyle = '#ccc';
  ctx.stroke();
  
  // Draw data points and lines
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  data.forEach((point, i) => {
    const x = margin.left + (i * (chartWidth / (data.length - 1)));
    const y = height - margin.bottom - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Draw points
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  ctx.stroke();
  
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

// Bar chart component
function createBarChart(container, data, options = {}) {
  const {
    width = 600,
    height = 400,
    margin = { top: 20, right: 30, bottom: 40, left: 40 },
    color = '#28a745'
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
  
  // Calculate scaling factors
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;
  
  // Draw axes
  ctx.beginPath();
  ctx.moveTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom); // X-axis
  ctx.lineTo(width - margin.right, margin.top); // Y-axis
  ctx.strokeStyle = '#ccc';
  ctx.stroke();
  
  // Draw bars
  data.forEach((point, i) => {
    const x = margin.left + i * (barWidth + barSpacing);
    const barHeight = (point.value / maxValue) * chartHeight;
    const y = height - margin.bottom - barHeight;
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw value labels on top of bars
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(point.value, x + barWidth/2, y - 5);
  });
  
  // Draw labels
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  
  // X-axis labels
  data.forEach((point, i) => {
    const x = margin.left + i * (barWidth + barSpacing) + barWidth/2;
    ctx.textAlign = 'center';
    ctx.fillText(point.label, x, height - margin.bottom + 20);
  });
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const value = i * (maxValue / 5);
    const y = height - margin.bottom - (i * chartHeight / 5);
    ctx.textAlign = 'right';
    ctx.fillText(value.toFixed(2), margin.left - 10, y + 4);
  }
}

export { createLineChart, createBarChart };