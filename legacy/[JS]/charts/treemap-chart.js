// Treemap chart component
function createTreemapChart(container, data, options = {}) {
  const {
    width = 800,
    height = 600,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997', '#6610f2', '#e83e8c'],
    padding = 4,
    showLabels = true,
    labelColor = '#fff'
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Calculate total value for size calculation
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Create a copy of the data and sort by value (largest first)
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Create the treemap layout (simplified Squarified algorithm)
  const layout = squarify(sortedData, total, 0, 0, width, height, padding);
  
  // Draw each rectangle
  layout.forEach((item, index) => {
    const { x, y, w, h, dataItem } = item;
    
    // Draw the rectangle
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, w, h);
    
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    // Draw label if requested and if the box is large enough
    if (showLabels && w > 30 && h > 20) {
      ctx.fillStyle = labelColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      // Add some padding to the text
      const textX = x + 5;
      const textY = y + 5;
      
      ctx.fillText(dataItem.label || dataItem.value, textX, textY);
    }
  });
}

// Simplified squarified treemap algorithm
function squarify(data, totalValue, x, y, width, height, padding) {
  const result = [];
  let currentX = x;
  let currentY = y;
  let remainingWidth = width;
  let remainingHeight = height;
  
  // Calculate the area for each item
  data.forEach((item, index) => {
    // Calculate the proportion of the total this item represents
    const proportion = item.value / totalValue;
    
    // Determine whether to layout horizontally or vertically
    // (This is a simplified approach - a full implementation would calculate aspect ratios)
    let rectWidth, rectHeight;
    
    if (remainingWidth > remainingHeight) {
      // Layout horizontally
      rectWidth = width * proportion;
      rectHeight = height;
    } else {
      // Layout vertically
      rectWidth = width;
      rectHeight = height * proportion;
    }
    
    // Ensure the rectangle fits within available space
    if (rectWidth > remainingWidth) rectWidth = remainingWidth;
    if (rectHeight > remainingHeight) rectHeight = remainingHeight;
    
    // Add padding
    rectWidth -= 2 * padding;
    rectHeight -= 2 * padding;
    
    // Add the rectangle to the result
    result.push({
      x: currentX + padding,
      y: currentY + padding,
      w: Math.max(0, rectWidth),
      h: Math.max(0, rectHeight),
      dataItem: item
    });
    
    // Update the remaining space
    if (remainingWidth > remainingHeight) {
      currentX += rectWidth + 2 * padding;
      remainingWidth -= rectWidth + 2 * padding;
    } else {
      currentY += rectHeight + 2 * padding;
      remainingHeight -= rectHeight + 2 * padding;
    }
  });
  
  return result;
}

// Nested treemap (hierarchical treemap)
function createNestedTreemap(container, hierarchyData, options = {}) {
  const {
    width = 800,
    height = 600,
    colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#20c997'],
    padding = 4,
    showLabels = true,
    labelColor = '#fff'
  } = options;

  // Clear container
  container.innerHTML = '';

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  
  // Draw nested rectangles based on hierarchy
  const drawNested = (data, x, y, w, h, depth = 0) => {
    if (!data.children || data.children.length === 0) return;
    
    // Calculate total value of children
    const total = data.children.reduce((sum, child) => sum + child.value, 0);
    
    // Add a border for the parent node
    ctx.strokeStyle = depth === 0 ? '#666' : '#999';
    ctx.lineWidth = depth === 0 ? 3 : 1;
    ctx.strokeRect(x, y, w, h);
    
    // Draw labels for parent nodes
    if (showLabels) {
      ctx.fillStyle = '#333';
      ctx.font = depth === 0 ? 'bold 16px Arial' : '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(data.name || 'Parent', x + 5, y + 15);
    }
    
    // Calculate layout for children
    let currentX = x + padding;
    let currentY = y + padding;
    let remainingWidth = w - 2 * padding;
    let remainingHeight = h - 2 * padding;
    
    data.children.forEach((child, index) => {
      // Calculate child dimensions based on its value
      const proportion = child.value / total;
      let childWidth, childHeight;
      
      // Alternate between horizontal and vertical layouts based on depth
      if (depth % 2 === 0) {
        childWidth = remainingWidth * proportion;
        childHeight = remainingHeight;
      } else {
        childWidth = remainingWidth;
        childHeight = remainingHeight * proportion;
      }
      
      // Draw the child rectangle
      ctx.fillStyle = colors[(depth * 3 + index) % colors.length];
      ctx.fillRect(currentX, currentY, childWidth - 2 * padding, childHeight - 2 * padding);
      
      // Draw border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, currentY, childWidth - 2 * padding, childHeight - 2 * padding);
      
      // Draw label for the child
      if (showLabels && childWidth > 30 && childHeight > 20) {
        ctx.fillStyle = labelColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(child.name || child.label || child.value, currentX + 5, currentY + 5);
      }
      
      // Update position for next child
      if (depth % 2 === 0) {
        currentX += childWidth;
        remainingWidth -= childWidth;
      } else {
        currentY += childHeight;
        remainingHeight -= childHeight;
      }
      
      // Recursively draw nested children if they exist
      if (child.children && child.children.length > 0) {
        drawNested(
          child, 
          currentX - childWidth + 2 * padding, 
          currentY - childHeight + 2 * padding, 
          childWidth - 2 * padding, 
          childHeight - 2 * padding, 
          depth + 1
        );
      }
    });
  };
  
  // Start drawing from the top-level data
  drawNested(hierarchyData, 0, 0, width, height);
}

// Export the functions
export { createTreemapChart, createNestedTreemap };