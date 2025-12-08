// Animation sequencer utility for chaining animations

class AnimationSequencer {
  constructor() {
    this.sequences = [];
    this.active = false;
  }

  add(element, animationFunction, duration = 300, delay = 0) {
    this.sequences.push({
      element,
      animationFunction,
      duration,
      delay
    });
    return this;
  }

  async play() {
    if (this.active) return;
    
    this.active = true;
    
    for (const seq of this.sequences) {
      await new Promise(resolve => {
        setTimeout(() => {
          seq.animationFunction(seq.element, seq.duration);
          setTimeout(resolve, seq.duration);
        }, seq.delay);
      });
    }
    
    this.active = false;
    this.sequences = [];
  }

  async parallel() {
    if (this.active) return;
    
    this.active = true;
    
    const promises = this.sequences.map(seq => {
      return new Promise(resolve => {
        setTimeout(() => {
          seq.animationFunction(seq.element, seq.duration);
          setTimeout(resolve, seq.duration);
        }, seq.delay);
      });
    });
    
    await Promise.all(promises);
    
    this.active = false;
    this.sequences = [];
  }

  clear() {
    this.sequences = [];
    this.active = false;
  }

  // Predefined animation sequences
  static async fadeInSequence(elements, duration = 300) {
    const sequencer = new AnimationSequencer();
    
    elements.forEach((el, i) => {
      sequencer.add(el, (element) => {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        element.offsetHeight;
        element.style.opacity = '1';
      }, duration, i * 100);
    });
    
    await sequencer.play();
  }

  static async slideInSequence(elements, direction = 'left', duration = 300) {
    const sequencer = new AnimationSequencer();
    const translateValue = direction === 'left' ? '-100px' : 
                          direction === 'right' ? '100px' : 
                          direction === 'up' ? '-100px' : '100px';
    const translateProperty = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
    
    elements.forEach((el, i) => {
      sequencer.add(el, (element) => {
        element.style.transform = `${translateProperty}(${translateValue})`;
        element.style.transition = `transform ${duration}ms ease`;
        element.offsetHeight;
        element.style.transform = `${translateProperty}(0)`;
      }, duration, i * 100);
    });
    
    await sequencer.play();
  }
}

export default AnimationSequencer;