// Funnel chart component
function createFunnelChart(container, data, options = {}) {
  const {
    width = 600,
    height = 400,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
    showValues = true,
    showLabels = true
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Calculate max value for width scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const totalHeight = height * 0.8; // Use 80% of the canvas height for the funnel
  const startY = (height - totalHeight) / 2; // Center the funnel vertically
  const centerX = width / 2;
  
  // Define funnel section dimensions
  const sectionHeight = totalHeight / data.length;
  const topWidth = width * 0.8; // 80% of canvas width at the top
  const bottomWidth = width * 0.2; // 20% of canvas width at the bottom
  
  // Draw each funnel section
  data.forEach((item, index) => {
    const value = item.value || 0;
    const label = item.label || `Stage ${index + 1}`;
    
    // Calculate width at this section
    const currentWidth = topWidth - ((topWidth - bottomWidth) * (index / (data.length - 1)));
    const sectionWidth = (value / maxValue) * currentWidth;
    
    // Calculate coordinates for the trapezoid
    const topY = startY + index * sectionHeight;
    const bottomY = startY + (index + 1) * sectionHeight;
    
    // Calculate X coordinates
    const leftX = centerX - sectionWidth / 2;
    const rightX = centerX + sectionWidth / 2;
    
    // Calculate the next section's width for the trapezoid shape (except for the last section)
    const nextSectionWidth = index < data.length - 1 ? 
      (topWidth - ((topWidth - bottomWidth) * ((index + 1) / (data.length - 1)))) * (data[index + 1].value / maxValue) :
      sectionWidth;
    const nextLeftX = centerX - nextSectionWidth / 2;
    const nextRightX = centerX + nextSectionWidth / 2;
    
    // Draw the trapezoid
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(nextRightX, bottomY);
    ctx.lineTo(nextLeftX, bottomY);
    ctx.closePath();
    
    // Fill with color
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw value if requested
    if (showValues) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textX = centerX;
      const textY = topY + sectionHeight / 2;
      ctx.fillText(value, textX, textY);
    }
    
    // Draw label if requested
    if (showLabels) {
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position the label to the left of the funnel
      const labelX = centerX - sectionWidth / 2 - 20;
      const labelY = topY + sectionHeight / 2;
      
      ctx.fillText(label, labelX, labelY);
    }
  });
}

// Pyramid chart component (a specific type of funnel)
function createPyramidChart(container, data, options = {}) {
  const {
    width = 600,
    height = 400,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
    showValues = true,
    showLabels = true
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Calculate dimensions
  const totalHeight = height * 0.8; // Use 80% of canvas height
  const startY = (height - totalHeight) / 2; // Center the pyramid vertically
  const centerX = width / 2;
  
  // Calculate max value for width scaling
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Calculate dimensions for each section
  const sectionHeight = totalHeight / data.length;
  
  // Draw each section of the pyramid
  data.forEach((item, index) => {
    const value = item.value || 0;
    const label = item.label || `Level ${index + 1}`;
    
    // Calculate width at this level (widest at center)
    const maxLevelWidth = (1 - Math.abs(data.length/2 - index) / (data.length/2)) * width * 0.6;
    const sectionWidth = (value / maxValue) * maxLevelWidth;
    
    // Calculate coordinates
    const topY = startY + index * sectionHeight;
    const bottomY = startY + (index + 1) * sectionHeight;
    
    const leftX = centerX - sectionWidth / 2;
    const rightX = centerX + sectionWidth / 2;
    
    // Draw the rectangle for the pyramid section
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    
    // Create a trapezoid effect for pyramid shape
    const nextSectionWidth = index < data.length - 1 ?
      (data[index + 1].value / maxValue) * (1 - Math.abs(data.length/2 - (index + 1)) / (data.length/2)) * width * 0.6 :
      sectionWidth;
    
    const nextLeftX = centerX - nextSectionWidth / 2;
    const nextRightX = centerX + nextSectionWidth / 2;
    
    ctx.lineTo(rightX, topY);
    ctx.lineTo(nextRightX, bottomY);
    ctx.lineTo(nextLeftX, bottomY);
    ctx.closePath();
    
    // Fill with color
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw value if requested
    if (showValues) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const textX = centerX;
      const textY = topY + sectionHeight / 2;
      ctx.fillText(value, textX, textY);
    }
    
    // Draw label if requested
    if (showLabels) {
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position the label to the right of the pyramid
      const labelX = centerX + sectionWidth / 2 + 30;
      const labelY = topY + sectionHeight / 2;
      
      ctx.fillText(label, labelX, labelY);
    }
  });
}

// Export the functions
export { createFunnelChart, createPyramidChart };