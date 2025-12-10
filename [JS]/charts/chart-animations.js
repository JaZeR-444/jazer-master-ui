// Chart animation utilities
function animateChartCreation(chartFunction, container, data, options = {}) {
  const {
    duration = 1000,
    easing = 'easeOutCubic'
  } = options;
  
  // Store the original data and create a copy to animate
  const animatedData = JSON.parse(JSON.stringify(data));
  
  // For this example, we'll assume the data has numerical values we can animate
  if (Array.isArray(data) && data.length > 0) {
    // Animate each data point from 0 to its actual value
    animatedData.forEach(item => {
      if (typeof item.value === 'number') {
        item.value = 0; // Start from 0
      }
    });
  } else if (data.values && Array.isArray(data.values)) {
    // For data with values array
    animatedData.values = data.values.map(() => 0);
  } else if (data.series && Array.isArray(data.series)) {
    // For multi-series data
    animatedData.series = data.series.map(series => ({
      ...series,
      data: series.data.map(item => ({ ...item, value: 0 }))
    }));
  }
  
  // Initial render with 0 values
  chartFunction(container, animatedData, options);
  
  // Animate values
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply easing function
    let easedProgress;
    switch (easing) {
      case 'easeInQuad':
        easedProgress = progress * progress;
        break;
      case 'easeOutQuad':
        easedProgress = progress * (2 - progress);
        break;
      case 'easeInOutQuad':
        easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        break;
      case 'easeOutCubic':
        easedProgress = --progress * progress * progress + 1;
        break;
      default:
        easedProgress = progress; // linear
    }
    
    // Update the animated data
    if (Array.isArray(data) && data.length > 0) {
      for (let i = 0; i < animatedData.length; i++) {
        if (typeof data[i].value === 'number') {
          animatedData[i].value = data[i].value * easedProgress;
        }
      }
    } else if (data.values && Array.isArray(data.values)) {
      for (let i = 0; i < animatedData.values.length; i++) {
        animatedData.values[i] = data.values[i] * easedProgress;
      }
    } else if (data.series && Array.isArray(data.series)) {
      for (let s = 0; s < animatedData.series.length; s++) {
        for (let i = 0; i < animatedData.series[s].data.length; i++) {
          animatedData.series[s].data[i].value = data.series[s].data[i].value * easedProgress;
        }
      }
    }
    
    // Redraw the chart
    chartFunction(container, animatedData, options);
    
    // Continue animation if not complete
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  // Start animation
  requestAnimationFrame(animate);
}

function animateChartValueChange(chartFunction, container, newData, options = {}) {
  const {
    duration = 1000,
    easing = 'easeOutCubic'
  } = options;
  
  // Store the new data and start animation
  const animate = (oldData) => {
    let progress = 0;
    const startTime = Date.now();
    
    const update = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Apply easing
      let easedProgress;
      switch (easing) {
        case 'easeOutCubic':
          easedProgress = --progress * progress * progress + 1;
          break;
        default:
          easedProgress = progress;
      }
      
      // Interpolate between old and new data
      const interpolatedData = interpolateData(oldData, newData, easedProgress);
      
      // Redraw the chart
      chartFunction(container, interpolatedData, options);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  };
  
  // Get current data from the chart container (simplified implementation)
  // In a real implementation, we'd need to track the current chart data
  animate(getCurrentChartData(container) || newData);
}

// Helper function to interpolate between two data sets
function interpolateData(oldData, newData, progress) {
  // Create a deep copy of new data
  const interpolated = JSON.parse(JSON.stringify(newData));
  
  // Interpolate values
  if (Array.isArray(oldData) && Array.isArray(newData)) {
    for (let i = 0; i < Math.min(oldData.length, newData.length); i++) {
      if (typeof oldData[i].value === 'number' && typeof newData[i].value === 'number') {
        interpolated[i].value = oldData[i].value + (newData[i].value - oldData[i].value) * progress;
      }
    }
  } else if (oldData.values && newData.values && Array.isArray(oldData.values) && Array.isArray(newData.values)) {
    for (let i = 0; i < Math.min(oldData.values.length, newData.values.length); i++) {
      if (typeof oldData.values[i] === 'number' && typeof newData.values[i] === 'number') {
        interpolated.values[i] = oldData.values[i] + (newData.values[i] - oldData.values[i]) * progress;
      }
    }
  } else if (oldData.series && newData.series && Array.isArray(oldData.series) && Array.isArray(newData.series)) {
    for (let s = 0; s < Math.min(oldData.series.length, newData.series.length); s++) {
      for (let i = 0; i < Math.min(oldData.series[s].data.length, newData.series[s].data.length); i++) {
        if (typeof oldData.series[s].data[i].value === 'number' && typeof newData.series[s].data[i].value === 'number') {
          interpolated.series[s].data[i].value = 
            oldData.series[s].data[i].value + 
            (newData.series[s].data[i].value - oldData.series[s].data[i].value) * progress;
        }
      }
    }
  }
  
  return interpolated;
}

// Helper function to get current chart data (simplified - in reality this would be more complex)
function getCurrentChartData(container) {
  // This is a placeholder - in a real implementation, 
  // this would need to extract the current data from the existing chart
  return null;
}

// Fade in animation for chart elements
function fadeChartIn(chartFunction, container, data, options = {}) {
  const {
    duration = 1000
  } = options;
  
  // Initially hide the chart container
  container.style.opacity = '0';
  
  // Render the chart
  chartFunction(container, data, options);
  
  // Fade in the container
  container.style.transition = `opacity ${duration}ms ease-in-out`;
  container.style.opacity = '1';
}

export { animateChartCreation, animateChartValueChange, fadeChartIn };