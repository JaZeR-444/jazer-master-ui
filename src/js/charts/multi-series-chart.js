// Multi-series chart component
function createMultiSeriesChart(container, data, options = {}) {
  const {
    width = 700,
    height = 400,
    margin = { top: 20, right: 30, bottom: 40, left: 40 },
    chartType = 'line', // 'line', 'bar', or 'area'
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1']
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
  const allValues = data.series.flatMap(s => s.data.map(d => d.value));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  
  // Calculate scaling factors
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = margin.top + i * (chartHeight / 5);
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
  
  // Draw each series
  data.series.forEach((series, seriesIndex) => {
    const color = colors[seriesIndex % colors.length];
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    // For line and area charts, draw the path
    if (chartType === 'line' || chartType === 'area') {
      ctx.beginPath();
      
      series.data.forEach((point, i) => {
        const x = margin.left + (i * (chartWidth / (series.data.length - 1)));
        const y = margin.top + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // For area charts, fill the area under the line
      if (chartType === 'area') {
        ctx.lineTo(
          margin.left + chartWidth, 
          margin.top + chartHeight
        );
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.closePath();
        
        // Draw filled area with transparency
        const fillStyle = color + '44'; // Add alpha for transparency
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.fillStyle = color; // Reset to original color for line
        
        // Move back to the line path and stroke it
        ctx.beginPath();
        series.data.forEach((point, i) => {
          const x = margin.left + (i * (chartWidth / (series.data.length - 1)));
          const y = margin.top + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
      }
      
      ctx.stroke();
      
      // Draw points
      series.data.forEach((point, i) => {
        const x = margin.left + (i * (chartWidth / (series.data.length - 1)));
        const y = margin.top + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    // For bar charts
    else if (chartType === 'bar') {
      const barWidth = chartWidth / series.data.length * 0.8 / data.series.length;
      const seriesOffset = seriesIndex * barWidth;
      
      series.data.forEach((point, i) => {
        const x = margin.left + (i * (chartWidth / series.data.length)) + seriesOffset;
        const barHeight = (point.value / maxValue) * chartHeight;
        const y = margin.top + chartHeight - barHeight;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
      });
    }
  });
  
  // Draw labels
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';
  
  // X-axis labels (take labels from the first series)
  if (data.series.length > 0) {
    data.series[0].data.forEach((point, i) => {
      const x = margin.left + (i * (chartWidth / (data.series[0].data.length - 1)));
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x, height - margin.bottom + 20);
    });
  }
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const value = minValue + (i * (maxValue - minValue) / 5);
    const y = margin.top + chartHeight - (i * chartHeight / 5);
    ctx.textAlign = 'right';
    ctx.fillText(value.toFixed(2), margin.left - 10, y + 4);
  }
  
  // Draw legend
  ctx.font = '12px Arial';
  data.series.forEach((series, i) => {
    const color = colors[i % colors.length];
    const x = width - margin.right + 10;
    const y = margin.top + i * 20;
    
    // Draw color box
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 10, 10);
    
    // Draw label
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(series.label || `Series ${i+1}`, x + 15, y + 10);
  });
}

// Export the function
export { createMultiSeriesChart };