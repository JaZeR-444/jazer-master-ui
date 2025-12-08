// Polar area chart component
function createPolarAreaChart(container, data, options = {}) {
  const {
    width = 400,
    height = 400,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'],
    maxValue = null
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Calculate max value if not provided
  const max = maxValue || Math.max(...data.values);
  
  // Calculate center and max radius
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) / 2 * 0.8;
  
  // Calculate angle for each segment
  const total = data.values.reduce((sum, val) => sum + val, 0);
  let currentAngle = -Math.PI / 2; // Start from top
  
  // Draw each segment
  data.values.forEach((value, i) => {
    const sliceAngle = (value / total) * 2 * Math.PI;
    const radius = (value / max) * maxRadius;
    
    // Draw the segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw labels
    if (data.labels) {
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);
      
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '12px Arial';
      ctx.fillText(data.labels[i], labelX, labelY);
    }
    
    currentAngle += sliceAngle;
  });
  
  // Draw concentric circles for scale
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  
  for (let level = 1; level <= 4; level++) {
    const r = (level * maxRadius) / 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

// Export the function
export { createPolarAreaChart };