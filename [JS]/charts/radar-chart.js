// Radar chart component
function createRadarChart(container, data, options = {}) {
  const {
    width = 400,
    height = 400,
    maxValue = null,
    color = '#007bff',
    labels = true
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
  const max = maxValue || Math.max(...data.datasets.flatMap(d => d.values));
  
  // Calculate center and radius
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 * 0.8; // 80% of the smallest dimension
  
  // Calculate angles for each axis
  const angleSlice = (Math.PI * 2) / data.labels.length;
  
  // Draw grid
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  
  // Draw concentric circles
  for (let level = 1; level <= 5; level++) {
    ctx.beginPath();
    const r = (level * radius) / 5;
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw axes
  for (let i = 0; i < data.labels.length; i++) {
    const angle = angleSlice * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Draw labels
    if (labels) {
      const labelX = centerX + (radius + 15) * Math.cos(angle);
      const labelY = centerY + (radius + 15) * Math.sin(angle);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(data.labels[i], labelX, labelY);
    }
  }
  
  // Draw data
  data.datasets.forEach((dataset, datasetIndex) => {
    ctx.beginPath();
    
    for (let i = 0; i < dataset.values.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const value = dataset.values[i];
      const r = (value / max) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    
    // Set color for this dataset
    const datasetColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'];
    ctx.fillStyle = datasetColors[datasetIndex % datasetColors.length] + '44'; // Add alpha for transparency
    ctx.fill();
    
    ctx.strokeStyle = datasetColors[datasetIndex % datasetColors.length];
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw points
    for (let i = 0; i < dataset.values.length; i++) {
      const angle = angleSlice * i - Math.PI / 2;
      const value = dataset.values[i];
      const r = (value / max) * radius;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = datasetColors[datasetIndex % datasetColors.length];
      ctx.fill();
    }
  });
}

export { createRadarChart };