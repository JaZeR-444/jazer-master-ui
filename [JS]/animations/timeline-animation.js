// Timeline-based animation utility

class TimelineAnimation {
  constructor() {
    this.animations = [];
    this.currentTime = 0;
    this.duration = 0;
    this.playbackRate = 1;
    this.isPaused = true;
    this.startTime = 0;
    this.animationFrameId = null;
  }

  add(func, startTime, duration) {
    this.animations.push({
      func,
      startTime,
      duration,
      endTime: startTime + duration,
      executed: false
    });
    
    // Update total duration
    this.duration = Math.max(this.duration, startTime + duration);
    
    return this;
  }

  // Predefined animation methods
  animateProperty(element, property, startValue, endValue, startTime, duration) {
    this.add(() => {
      const initialValue = parseFloat(getComputedStyle(element)[property]) || startValue;
      const range = endValue - startValue;
      
      const animation = () => {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        const currentValue = startValue + (range * progress);
        element.style[property] = `${currentValue}${property.includes('opacity') ? '' : 'px'}`;
        
        if (progress < 1) {
          requestAnimationFrame(animation);
        }
      };
      
      animation();
    }, startTime, duration);
    
    return this;
  }

  fadeTo(element, opacity, startTime, duration) {
    return this.animateProperty(element, 'opacity', 1, opacity, startTime, duration);
  }

  moveTo(element, x, y, startTime, duration) {
    this.add(() => {
      const startX = parseFloat(element.style.left) || 0;
      const startY = parseFloat(element.style.top) || 0;
      const deltaX = x - startX;
      const deltaY = y - startY;
      
      const animation = () => {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        element.style.left = `${startX + (deltaX * progress)}px`;
        element.style.top = `${startY + (deltaY * progress)}px`;
        
        if (progress < 1) {
          requestAnimationFrame(animation);
        }
      };
      
      animation();
    }, startTime, duration);
    
    return this;
  }

  play() {
    if (!this.isPaused) return;
    
    this.isPaused = false;
    this.startTime = Date.now() - (this.currentTime * 1000);
    
    const animate = () => {
      if (this.isPaused) return;
      
      this.currentTime = (Date.now() - this.startTime) / 1000;
      
      // Execute animations at appropriate times
      this.animations.forEach(anim => {
        if (this.currentTime >= anim.startTime && this.currentTime <= anim.endTime && !anim.executed) {
          anim.func();
          anim.executed = true;
        }
      });
      
      // Continue animation if timeline hasn't ended
      if (this.currentTime < this.duration) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.isPaused = true;
      }
    };
    
    animate();
  }

  pause() {
    this.isPaused = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  stop() {
    this.pause();
    this.currentTime = 0;
    
    // Reset execution flags
    this.animations.forEach(anim => {
      anim.executed = false;
    });
  }

  seek(time) {
    this.currentTime = Math.min(Math.max(time, 0), this.duration);
  }

  // Callback when animation completes
  onComplete(callback) {
    if (this.currentTime >= this.duration) {
      callback();
    } else {
      // Set up a check for completion
      const checkCompletion = () => {
        if (this.currentTime >= this.duration) {
          callback();
        } else {
          requestAnimationFrame(checkCompletion);
        }
      };
      requestAnimationFrame(checkCompletion);
    }
  }
}

// Export the TimelineAnimation class
export default TimelineAnimation;