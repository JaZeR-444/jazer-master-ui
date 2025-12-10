// Pie chart component
function createPieChart(container, data, options = {}) {
  const {
    width = 400,
    height = 400,
    radius = Math.min(width, height) / 2 - 20,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997']
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.translate(width / 2, height / 2); // Move origin to center

  let startAngle = -Math.PI / 2; // Start from top
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Draw each slice
  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const color = colors[i % colors.length];

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Update start angle for next slice
    startAngle += sliceAngle;
  });

  // Draw labels
  startAngle = -Math.PI / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const labelAngle = startAngle + sliceAngle / 2;
    
    // Position label in the middle of the slice
    const labelRadius = radius * 0.7;
    const x = Math.cos(labelAngle) * labelRadius;
    const y = Math.sin(labelAngle) * labelRadius;
    
    ctx.fillText(item.label, x, y);
    
    startAngle += sliceAngle;
  });
}

// Donut chart component
function createDonutChart(container, data, options = {}) {
  const {
    width = 400,
    height = 400,
    outerRadius = Math.min(width, height) / 2 - 20,
    innerRadius = Math.min(width, height) / 2 - 80,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997']
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.translate(width / 2, height / 2); // Move origin to center

  let startAngle = -Math.PI / 2; // Start from top
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Draw each slice
  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const color = colors[i % colors.length];

    // Draw slice as arc
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, startAngle, startAngle + sliceAngle);
    ctx.arc(0, 0, innerRadius, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Update start angle for next slice
    startAngle += sliceAngle;
  });

  // Draw labels
  startAngle = -Math.PI / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#333';
  ctx.font = '12px Arial';

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const labelAngle = startAngle + sliceAngle / 2;
    
    // Position label in the middle of the slice
    const labelRadius = (outerRadius + innerRadius) / 2;
    const x = Math.cos(labelAngle) * labelRadius;
    const y = Math.sin(labelAngle) * labelRadius;
    
    ctx.fillText(item.label, x, y);
    
    startAngle += sliceAngle;
  });
}

export { createPieChart, createDonutChart };