// Physics-based animation utilities

function springAnimation(element, targetX, targetY, options = {}) {
  const {
    tension = 170,
    friction = 26,
    precision = 0.1,
    duration = 1000
  } = options;
  
  const startX = parseFloat(element.style.left || 0);
  const startY = parseFloat(element.style.top || 0);
  
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = 0;
  
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Apply spring physics (simplified)
    const fx = -tension * (x - targetX) - friction * dx;
    const fy = -tension * (y - targetY) - friction * dy;
    
    dx += fx * 0.016; // Assuming 60fps
    dy += fy * 0.016;
    x += dx * 0.016;
    y += dy * 0.016;
    
    element.style.left = `${startX + x}px`;
    element.style.top = `${startY + y}px`;
    
    // Continue animation if not at target with sufficient precision
    if (Math.abs(x - targetX) > precision || Math.abs(y - targetY) > precision) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function gravityAnimation(element, options = {}) {
  const {
    gravity = 0.5,
    bounceFactor = 0.7,
    initialVelocityY = 0,
    initialVelocityX = 0
  } = options;
  
  const containerHeight = window.innerHeight;
  const elementHeight = element.offsetHeight;
  
  let y = 0;
  let x = 0;
  let velocityY = initialVelocityY;
  let velocityX = initialVelocityX;
  
  function update() {
    velocityY += gravity;
    y += velocityY;
    x += velocityX;
    
    // Check for collision with bottom
    if (y + elementHeight > containerHeight) {
      y = containerHeight - elementHeight;
      velocityY = -velocityY * bounceFactor;
      
      // Stop animation if bounce is too small
      if (Math.abs(velocityY) < 1) {
        velocityY = 0;
      }
    }
    
    element.style.transform = `translate(${x}px, ${y}px)`;
    
    // Continue if there's still movement
    if (Math.abs(velocityY) > 0.1 || Math.abs(velocityX) > 0.1 || y + elementHeight < containerHeight) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

function pendulumAnimation(element, options = {}) {
  const {
    length = 100, // Length of the pendulum
    gravity = 9.8,
    angle = 30, // Initial angle in degrees
    damping = 0.99
  } = options;
  
  let angleRad = angle * Math.PI / 180;
  let angularVelocity = 0;
  const centerX = element.offsetLeft + element.offsetWidth / 2;
  
  function update() {
    // Calculate angular acceleration
    const angularAcceleration = -(gravity / length) * Math.sin(angleRad);
    
    // Update velocity and position
    angularVelocity += angularAcceleration;
    angularVelocity *= damping; // Apply damping
    angleRad += angularVelocity;
    
    // Calculate new position
    const x = centerX + length * Math.sin(angleRad);
    const y = length * (1 - Math.cos(angleRad)); // Approximate vertical position
    
    element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y}px)`;
    
    // Continue animation
    requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
}

// Elastic animation based on physics
function elasticAnimation(element, property, startValue, endValue, options = {}) {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    precision = 0.1
  } = options;
  
  let value = startValue;
  let velocity = 0;
  
  function update() {
    // Calculate force using Hooke's law: F = -kx
    const displacement = value - endValue;
    const force = -stiffness * displacement - damping * velocity;
    
    // Calculate acceleration: a = F/m
    const acceleration = force / mass;
    
    // Update velocity and position
    velocity += acceleration;
    value += velocity;
    
    // Apply the property value to the element
    if (property === 'left' || property === 'top' || property === 'right' || property === 'bottom') {
      element.style[property] = `${value}px`;
    } else if (property === 'opacity') {
      element.style[property] = value;
    } else if (property === 'transform') {
      element.style.transform = `scale(${value})`;
    }
    
    // Continue animation if not at target with sufficient precision
    if (Math.abs(displacement) > precision) {
      requestAnimationFrame(update);
    }
  }
  
  requestAnimationFrame(update);
}

export { springAnimation, gravityAnimation, pendulumAnimation, elasticAnimation };