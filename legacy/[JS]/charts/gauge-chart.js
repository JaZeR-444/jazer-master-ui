// Gauge chart component
function createGaugeChart(container, value, options = {}) {
  const {
    width = 300,
    height = 200,
    minValue = 0,
    maxValue = 100,
    color = '#007bff',
    backgroundColor = '#e9ecef',
    label = 'Value',
    showValue = true
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
  const centerX = width / 2;
  const centerY = height * 0.8; // Position the gauge lower to show the full arc
  const radius = Math.min(width, height) * 0.4;
  
  // Calculate the angle range (semi-circle - 180 degrees)
  const startAngle = Math.PI; // 180 degrees in radians
  const endAngle = 2 * Math.PI; // 360 degrees in radians
  
  // Calculate the angle for the current value
  const percentage = (value - minValue) / (maxValue - minValue);
  const currentAngle = startAngle + (endAngle - startAngle) * percentage;
  
  // Draw the background arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.strokeStyle = backgroundColor;
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Draw the value arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 20;
  ctx.lineCap = 'round';
  ctx.stroke();
  
  // Draw the needle if needed
  const needleX = centerX + radius * Math.cos(currentAngle);
  const needleY = centerY + radius * Math.sin(currentAngle);
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(needleX, needleY);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  ctx.stroke();
  
  // Draw the needle center
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
  
  // Draw the center circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Draw the value text
  if (showValue) {
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toFixed(1), centerX, centerY - 20);
    
    // Draw the label
    ctx.font = '14px Arial';
    ctx.fillText(label, centerX, centerY + 20);
  }
  
  // Draw min and max labels
  ctx.font = '12px Arial';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  
  // Min label
  const minLabelX = centerX + radius * Math.cos(startAngle) * 0.7;
  const minLabelY = centerY + radius * Math.sin(startAngle) * 0.7;
  ctx.fillText(minValue, minLabelX, minLabelY + 5);
  
  // Max label
  const maxLabelX = centerX + radius * Math.cos(endAngle) * 0.7;
  const maxLabelY = centerY + radius * Math.sin(endAngle) * 0.7;
  ctx.fillText(maxValue, maxLabelX, maxLabelY + 5);
}

// Multiple gauge component
function createMultipleGauges(container, data, options = {}) {
  const {
    width = 800,
    height = 200,
    cols = 3
  } = options;
  
  // Clear container
  container.innerHTML = '';
  
  // Create container for multiple gauges
  const gaugesContainer = document.createElement('div');
  gaugesContainer.style.display = 'flex';
  gaugesContainer.style.flexWrap = 'wrap';
  gaugesContainer.style.justifyContent = 'space-around';
  gaugesContainer.style.width = width + 'px';
  gaugesContainer.style.height = height + 'px';
  
  container.appendChild(gaugesContainer);
  
  // Calculate dimensions for individual gauges
  const gaugeWidth = Math.floor(width / cols);
  const gaugeHeight = height;
  
  // Create individual gauge containers
  data.forEach((gaugeData, index) => {
    const gaugeDiv = document.createElement('div');
    gaugeDiv.style.width = gaugeWidth + 'px';
    gaugeDiv.style.height = gaugeHeight + 'px';
    gaugeDiv.style.display = 'flex';
    gaugeDiv.style.flexDirection = 'column';
    gaugeDiv.style.alignItems = 'center';
    gaugeDiv.style.justifyContent = 'center';
    
    gaugesContainer.appendChild(gaugeDiv);
    
    // Create a sub-container for the canvas
    const canvasContainer = document.createElement('div');
    canvasContainer.style.position = 'relative';
    
    // Set custom options for this gauge
    const gaugeOptions = {
      ...options,
      width: gaugeWidth * 0.8,
      height: gaugeHeight * 0.8,
      label: gaugeData.label || `Gauge ${index + 1}`,
    };
    
    createGaugeChart(canvasContainer, gaugeData.value, gaugeOptions);
    gaugeDiv.appendChild(canvasContainer);
    
    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.style.marginTop = '10px';
    labelDiv.style.fontWeight = 'bold';
    labelDiv.textContent = gaugeData.label || `Gauge ${index + 1}`;
    gaugeDiv.appendChild(labelDiv);
  });
}

// Export the functions
export { createGaugeChart, createMultipleGauges };