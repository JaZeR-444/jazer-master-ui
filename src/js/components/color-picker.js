/**
 * Color Picker Component
 * Advanced color selection with multiple input methods and palette options
 * Compatible with jazer-brand.css styling for color picker components
 */

class ColorPicker {
  /**
   * Creates a new color picker instance
   * @param {HTMLElement} container - Container element for the color picker
   * @param {Object} options - Configuration options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      // Color picker type: 'hue' (hue-based), 'wheel' (color wheel), 'preset' (preset colors), 'advanced' (all options)
      type: 'hue',
      
      // Initial color
      initialColor: '#00f2ea', // Default to jazer brand color
      
      // Preset color palettes
      presetPalettes: [
        ['#00f2ea', '#4facfe', '#00bbf9', '#f0008c', '#ff8c52'],
        ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'],
        ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
      ],
      
      // Palette selection options
      showPresets: true,
      showCustomPalette: false,
      showRecentColors: true,
      recentColorsLimit: 10,
      
      // Advanced options
      showAlpha: true,
      showHex: true,
      showRgb: true,
      showHsl: true,
      
      // Output format
      outputFormat: 'hex', // 'hex', 'rgb', 'hsl', 'hsv'
      
      // Events
      onChange: null,
      onOpen: null,
      onClose: null,
      
      ...options
    };

    this.currentColor = this.hexToRgba(this.options.initialColor);
    this.isOpen = false;
    this.recentColors = [];
    this.customPalette = [];
    
    // Create UI elements
    this.colorPicker = null;
    this.colorPreview = null;
    this.colorInput = null;
    this.hueSlider = null;
    this.alphaSlider = null;
    this.previewDisplay = null;
    this.pickerCanvas = null;
    
    this.init();
  }

  /**
   * Initializes the color picker
   */
  init() {
    // Create the color picker structure
    this.createPickerStructure();
    
    // Bind events
    this.bindEvents();
    
    // Add dynamic styles
    this.addDynamicStyles();
    
    // Render initial state based on type
    this.render();
  }

  /**
   * Creates the color picker structure
   */
  createPickerStructure() {
    // Create main picker container
    this.colorPicker = document.createElement('div');
    this.colorPicker.classList.add('color-picker');
    this.colorPicker.classList.add(`color-picker-${this.options.type}`);
    
    // Create header with color preview
    const header = document.createElement('div');
    header.classList.add('color-picker-header');
    
    this.colorPreview = document.createElement('div');
    this.colorPreview.classList.add('color-preview');
    this.colorPreview.style.backgroundColor = this.rgbaToHex(this.currentColor);
    
    header.appendChild(this.colorPreview);
    
    // Add color value display
    this.colorValueDisplay = document.createElement('div');
    this.colorValueDisplay.classList.add('color-value-display');
    this.colorValueDisplay.textContent = this.formatColor(this.currentColor, this.options.outputFormat);
    header.appendChild(this.colorValueDisplay);
    
    this.colorPicker.appendChild(header);
    
    // Create content container based on picker type
    switch (this.options.type) {
      case 'hue':
        this.createHuePicker();
        break;
      case 'wheel':
        this.createWheelPicker();
        break;
      case 'preset':
        this.createPresetPicker();
        break;
      case 'advanced':
        this.createAdvancedPicker();
        break;
      default:
        this.createHuePicker();
    }
    
    // Create input for manual color entry
    if (this.options.showHex) {
      this.colorInput = document.createElement('input');
      this.colorInput.type = 'text';
      this.colorInput.classList.add('color-input');
      this.colorInput.value = this.formatColor(this.currentColor, 'hex');
      this.colorInput.placeholder = 'Enter color code';
      
      this.colorPicker.appendChild(this.colorInput);
    }
    
    // Create presets if enabled
    if (this.options.showPresets) {
      this.createPresetSection();
    }
    
    // Create custom palette if enabled
    if (this.options.showCustomPalette) {
      this.createCustomPaletteSection();
    }
    
    // Create recent colors if enabled
    if (this.options.showRecentColors) {
      this.createRecentColorsSection();
    }
    
    // Add to container
    this.container.appendChild(this.colorPicker);
  }

  /**
   * Creates the hue-based picker
   */
  createHuePicker() {
    // Create saturation/lightness area
    this.saturationLightnessArea = document.createElement('div');
    this.saturationLightnessArea.classList.add('saturation-lightness-area');
    
    // Create color handle
    this.colorHandle = document.createElement('div');
    this.colorHandle.classList.add('color-handle');
    this.saturationLightnessArea.appendChild(this.colorHandle);
    
    // Create hue slider
    this.hueSliderContainer = document.createElement('div');
    this.hueSliderContainer.classList.add('hue-slider-container');
    
    this.hueSlider = document.createElement('input');
    this.hueSlider.type = 'range';
    this.hueSlider.min = '0';
    this.hueSlider.max = '360';
    this.hueSlider.value = this.currentColor.hsl.h;
    this.hueSlider.classList.add('hue-slider');
    this.hueSliderContainer.appendChild(this.hueSlider);
    
    if (this.options.showAlpha) {
      // Create alpha slider
      this.alphaSliderContainer = document.createElement('div');
      this.alphaSliderContainer.classList.add('alpha-slider-container');
      
      this.alphaSlider = document.createElement('input');
      this.alphaSlider.type = 'range';
      this.alphaSlider.min = '0';
      this.alphaSlider.max = '1';
      this.alphaSlider.step = '0.01';
      this.alphaSlider.value = this.currentColor.a;
      this.alphaSlider.classList.add('alpha-slider');
      this.alphaSliderContainer.appendChild(this.alphaSlider);
    }
    
    this.colorPicker.appendChild(this.saturationLightnessArea);
    this.colorPicker.appendChild(this.hueSliderContainer);
    if (this.alphaSlider) {
      this.colorPicker.appendChild(this.alphaSliderContainer);
    }
  }

  /**
   * Creates the color wheel picker
   */
  createWheelPicker() {
    // Create color wheel canvas
    this.wheelCanvas = document.createElement('canvas');
    this.wheelCanvas.classList.add('color-wheel');
    this.wheelCanvas.width = 200;
    this.wheelCanvas.height = 200;
    
    this.colorPicker.appendChild(this.wheelCanvas);
    
    // Create brightness slider
    this.brightnessSlider = document.createElement('input');
    this.brightnessSlider.type = 'range';
    this.brightnessSlider.min = '0';
    this.brightnessSlider.max = '100';
    this.brightnessSlider.value = '50';
    this.brightnessSlider.classList.add('brightness-slider');
    
    if (this.options.showAlpha) {
      this.alphaSlider = document.createElement('input');
      this.alphaSlider.type = 'range';
      this.alphaSlider.min = '0';
      this.alphaSlider.max = '1';
      this.alphaSlider.step = '0.01';
      this.alphaSlider.value = this.currentColor.a;
      this.alphaSlider.classList.add('alpha-slider');
    }
    
    this.colorPicker.appendChild(this.brightnessSlider);
    if (this.alphaSlider) {
      this.colorPicker.appendChild(this.alphaSlider);
    }
    
    // Draw the color wheel
    this.drawColorWheel();
  }

  /**
   * Creates the preset colors picker
   */
  createPresetPicker() {
    // Create palette grid
    this.paletteGrid = document.createElement('div');
    this.paletteGrid.classList.add('palette-grid');
    
    // Add preset palettes
    this.options.presetPalettes.forEach((palette, paletteIndex) => {
      palette.forEach((color, colorIndex) => {
        const colorBox = document.createElement('div');
        colorBox.classList.add('preset-color-box');
        colorBox.style.backgroundColor = color;
        colorBox.dataset.color = color;
        
        colorBox.addEventListener('click', () => {
          this.setColor(color);
        });
        
        this.paletteGrid.appendChild(colorBox);
      });
    });
    
    this.colorPicker.appendChild(this.paletteGrid);
  }

  /**
   * Creates the advanced picker with multiple input methods
   */
  createAdvancedPicker() {
    // Create all components
    this.createHuePicker();
    
    // Create RGB input fields
    if (this.options.showRgb) {
      this.rgbInputsContainer = document.createElement('div');
      this.rgbInputsContainer.classList.add('rgb-inputs-container');
      
      ['r', 'g', 'b'].forEach(channel => {
        const channelInput = document.createElement('input');
        channelInput.type = 'number';
        channelInput.min = '0';
        channelInput.max = '255';
        channelInput.value = this.currentColor[channel];
        channelInput.dataset.channel = channel;
        channelInput.classList.add('rgb-channel-input');
        channelInput.placeholder = channel.toUpperCase();
        
        this.rgbInputsContainer.appendChild(channelInput);
      });
      
      this.colorPicker.appendChild(this.rgbInputsContainer);
    }
    
    // Create HSL input fields
    if (this.options.showHsl) {
      this.hslInputsContainer = document.createElement('div');
      this.hslInputsContainer.classList.add('hsl-inputs-container');
      
      ['h', 's', 'l'].forEach((channel, index) => {
        const channelInput = document.createElement('input');
        channelInput.type = 'number';
        channelInput.min = channel === 'h' ? '0' : '0';
        channelInput.max = channel === 'h' ? '360' : '100';
        channelInput.value = this.currentColor.hsl[channel];
        channelInput.dataset.channel = channel;
        channelInput.classList.add('hsl-channel-input');
        channelInput.placeholder = channel.toUpperCase();
        
        this.hslInputsContainer.appendChild(channelInput);
      });
      
      this.colorPicker.appendChild(this.hslInputsContainer);
    }
    
    // Create format selector
    this.formatSelector = document.createElement('select');
    this.formatSelector.classList.add('format-selector');
    
    ['hex', 'rgb', 'hsl', 'hsv'].forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      if (format === this.options.outputFormat) {
        option.selected = true;
      }
      this.formatSelector.appendChild(option);
    });
    
    this.colorPicker.appendChild(this.formatSelector);
  }

  /**
   * Creates the preset colors section
   */
  createPresetSection() {
    if (this.options.presetPalettes.length === 0) return;
    
    this.presetSection = document.createElement('div');
    this.presetSection.classList.add('preset-section');
    
    const heading = document.createElement('h4');
    heading.textContent = 'Preset Colors';
    this.presetSection.appendChild(heading);
    
    this.presetGrid = document.createElement('div');
    this.presetGrid.classList.add('preset-grid');
    
    // Add preset palettes
    this.options.presetPalettes.forEach((palette, paletteIndex) => {
      palette.forEach((color, colorIndex) => {
        const colorBox = document.createElement('div');
        colorBox.classList.add('preset-color-box');
        colorBox.style.backgroundColor = color;
        colorBox.dataset.color = color;
        
        colorBox.addEventListener('click', () => {
          this.setColor(color);
        });
        
        this.presetGrid.appendChild(colorBox);
      });
    });
    
    this.presetSection.appendChild(this.presetGrid);
    this.colorPicker.appendChild(this.presetSection);
  }

  /**
   * Creates the custom palette section
   */
  createCustomPaletteSection() {
    this.customPaletteSection = document.createElement('div');
    this.customPaletteSection.classList.add('custom-palette-section');
    
    const heading = document.createElement('h4');
    heading.textContent = 'Custom Palette';
    this.customPaletteSection.appendChild(heading);
    
    this.customPaletteGrid = document.createElement('div');
    this.customPaletteGrid.classList.add('custom-palette-grid');
    
    // Add color boxes for custom palette
    for (let i = 0; i < 10; i++) {
      const colorBox = document.createElement('div');
      colorBox.classList.add('custom-palette-color-box');
      colorBox.dataset.index = i;
      
      colorBox.addEventListener('click', () => {
        if (this.customPalette[i]) {
          this.setColor(this.customPalette[i]);
        }
      });
      
      this.customPaletteGrid.appendChild(colorBox);
    }
    
    this.customPaletteSection.appendChild(this.customPaletteGrid);
    
    // Add button to add current color to palette
    this.addToPaletteButton = document.createElement('button');
    this.addToPaletteButton.classList.add('add-to-palette-button');
    this.addToPaletteButton.textContent = 'Add to Palette';
    
    this.addToPaletteButton.addEventListener('click', () => {
      this.addToCustomPalette(this.currentColor);
    });
    
    this.customPaletteSection.appendChild(this.addToPaletteButton);
    this.colorPicker.appendChild(this.customPaletteSection);
  }

  /**
   * Creates the recent colors section
   */
  createRecentColorsSection() {
    this.recentColorsSection = document.createElement('div');
    this.recentColorsSection.classList.add('recent-colors-section');
    
    const heading = document.createElement('h4');
    heading.textContent = 'Recent Colors';
    this.recentColorsSection.appendChild(heading);
    
    this.recentColorsGrid = document.createElement('div');
    this.recentColorsGrid.classList.add('recent-colors-grid');
    
    this.recentColorsSection.appendChild(this.recentColorsGrid);
    this.colorPicker.appendChild(this.recentColorsSection);
  }

  /**
   * Binds events to the color picker
   */
  bindEvents() {
    // Bind events based on picker type
    switch (this.options.type) {
      case 'hue':
        this.bindHuePickerEvents();
        break;
      case 'wheel':
        this.bindWheelPickerEvents();
        break;
      case 'preset':
        this.bindPresetPickerEvents();
        break;
      case 'advanced':
        this.bindAdvancedPickerEvents();
        break;
    }
    
    // Bind input events for manual color entry
    if (this.colorInput) {
      this.colorInput.addEventListener('change', (e) => {
        this.handleColorInputChange(e);
      });
      
      this.colorInput.addEventListener('input', (e) => {
        this.handleColorInput(e);
      });
    }
    
    // Bind format selector change
    if (this.formatSelector) {
      this.formatSelector.addEventListener('change', (e) => {
        this.options.outputFormat = e.target.value;
        this.updateColorDisplay();
      });
    }
  }

  /**
   * Binds events for hue-based picker
   */
  bindHuePickerEvents() {
    // Hue slider
    this.hueSlider.addEventListener('input', () => {
      this.currentColor.hsl.h = parseInt(this.hueSlider.value);
      this.updateFromHSL();
    });
    
    // Alpha slider
    if (this.alphaSlider) {
      this.alphaSlider.addEventListener('input', () => {
        this.currentColor.a = parseFloat(this.alphaSlider.value);
        this.updateColorPreview();
      });
    }
    
    // Saturation/lightness area
    this.saturationLightnessArea.addEventListener('mousedown', (e) => {
      this.handleSaturationLightnessMouseDown(e);
    });
    
    // Add mousemove and mouseup listeners to document
    document.addEventListener('mousemove', this.handleSaturationLightnessMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleSaturationLightnessMouseUp.bind(this));
  }

  /**
   * Binds events for color wheel picker
   */
  bindWheelPickerEvents() {
    // Color wheel canvas
    this.wheelCanvas.addEventListener('mousedown', (e) => {
      this.handleWheelMouseDown(e);
    });
    
    // Brightness slider
    this.brightnessSlider.addEventListener('input', () => {
      // Update color based on brightness
      this.currentColor.hsl.l = parseInt(this.brightnessSlider.value);
      this.updateFromHSL();
    });
    
    // Alpha slider
    if (this.alphaSlider) {
      this.alphaSlider.addEventListener('input', () => {
        this.currentColor.a = parseFloat(this.alphaSlider.value);
        this.updateColorPreview();
      });
    }
    
    // Add mousemove and mouseup listeners to document
    document.addEventListener('mousemove', this.handleWheelMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleWheelMouseUp.bind(this));
  }

  /**
   * Binds events for advanced picker
   */
  bindAdvancedPickerEvents() {
    // RGB inputs
    if (this.rgbInputsContainer) {
      ['r', 'g', 'b'].forEach(channel => {
        const input = this.rgbInputsContainer.querySelector(`[data-channel="${channel}"]`);
        input.addEventListener('input', () => {
          this.currentColor[channel] = parseInt(input.value);
          this.updateFromRGB();
        });
      });
    }
    
    // HSL inputs
    if (this.hslInputsContainer) {
      ['h', 's', 'l'].forEach(channel => {
        const input = this.hslInputsContainer.querySelector(`[data-channel="${channel}"]`);
        input.addEventListener('input', () => {
          this.currentColor.hsl[channel] = channel === 'h' ? parseInt(input.value) : parseInt(input.value);
          this.updateFromHSL();
        });
      });
    }
  }

  /**
   * Handles saturation/lightness area mouse down
   * @param {Event} e - Mouse event
   */
  handleSaturationLightnessMouseDown(e) {
    this.isDraggingSaturationLightness = true;
    this.updateSaturationLightness(e);
  }

  /**
   * Handles saturation/lightness area mouse move
   * @param {Event} e - Mouse event
   */
  handleSaturationLightnessMouseMove(e) {
    if (!this.isDraggingSaturationLightness) return;
    this.updateSaturationLightness(e);
  }

  /**
   * Handles saturation/lightness area mouse up
   */
  handleSaturationLightnessMouseUp() {
    this.isDraggingSaturationLightness = false;
  }

  /**
   * Updates saturation and lightness based on mouse position
   * @param {Event} e - Mouse event
   */
  updateSaturationLightness(e) {
    const rect = this.saturationLightnessArea.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    
    // Calculate saturation and lightness
    const saturation = Math.round((x / rect.width) * 100);
    const lightness = Math.round(((rect.height - y) / rect.height) * 100);
    
    // Update color
    this.currentColor.hsl.s = saturation;
    this.currentColor.hsl.l = lightness;
    
    // Update handle position
    this.colorHandle.style.left = `${x}px`;
    this.colorHandle.style.top = `${y}px`;
    
    this.updateFromHSL();
  }

  /**
   * Handles wheel mouse down
   * @param {Event} e - Mouse event
   */
  handleWheelMouseDown(e) {
    this.isDraggingWheel = true;
    this.updateWheelColor(e);
  }

  /**
   * Handles wheel mouse move
   * @param {Event} e - Mouse event
   */
  handleWheelMouseMove(e) {
    if (!this.isDraggingWheel) return;
    this.updateWheelColor(e);
  }

  /**
   * Handles wheel mouse up
   */
  handleWheelMouseUp() {
    this.isDraggingWheel = false;
  }

  /**
   * Updates color based on position on the wheel
   * @param {Event} e - Mouse event
   */
  updateWheelColor(e) {
    const rect = this.wheelCanvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    // Calculate angle and distance from center
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    const distance = Math.min(Math.sqrt(x * x + y * y), centerX);
    const maxDistance = Math.min(centerX, centerY);
    
    // Calculate hue and saturation
    const hue = Math.round((angle + 360) % 360);
    const saturation = Math.round((distance / maxDistance) * 100);
    
    // Update color
    this.currentColor.hsl.h = hue;
    this.currentColor.hsl.s = saturation;
    
    this.updateFromHSL();
  }

  /**
   * Handles color input change
   * @param {Event} e - Input event
   */
  handleColorInputChange(e) {
    const value = e.target.value;
    if (this.isValidColor(value)) {
      this.setColor(value);
    }
  }

  /**
   * Handles color input (live updates)
   * @param {Event} e - Input event
   */
  handleColorInput(e) {
    const value = e.target.value;
    if (this.isValidColor(value)) {
      // Update color preview without triggering full update
      const tempColor = this.parseColor(value);
      if (tempColor) {
        this.updateColorPreview(tempColor);
      }
    }
  }

  /**
   * Sets the current color
   * @param {string|Object} color - Color in any format (hex, rgb, hsl) or object
   */
  setColor(color) {
    let newColor;
    
    if (typeof color === 'string') {
      newColor = this.parseColor(color);
    } else if (typeof color === 'object') {
      newColor = { ...color };
    } else {
      return;
    }
    
    if (newColor) {
      this.currentColor = newColor;
      this.updatePickerFromColor();
      
      // Add to recent colors
      this.addToRecentColors(this.currentColor);
      
      // Execute change callback
      if (this.options.onChange) {
        this.options.onChange(this.formatColor(this.currentColor, this.options.outputFormat));
      }
    }
  }

  /**
   * Updates the picker UI from the current color
   */
  updatePickerFromColor() {
    // Update color preview
    this.updateColorPreview();
    
    // Update color value display
    this.updateColorValueDisplay();
    
    // Update UI based on picker type
    switch (this.options.type) {
      case 'hue':
        this.updateHuePickerFromColor();
        break;
      case 'wheel':
        this.updateWheelPickerFromColor();
        break;
      case 'advanced':
        this.updateAdvancedPickerFromColor();
        break;
    }
  }

  /**
   * Updates hue picker from the current color
   */
  updateHuePickerFromColor() {
    // Update hue slider
    this.hueSlider.value = this.currentColor.hsl.h;
    
    // Update alpha slider if enabled
    if (this.alphaSlider) {
      this.alphaSlider.value = this.currentColor.a;
    }
    
    // Update saturation/lightness handle position
    const rect = this.saturationLightnessArea.getBoundingClientRect();
    const x = (this.currentColor.hsl.s / 100) * rect.width;
    const y = (1 - this.currentColor.hsl.l / 100) * rect.height;
    
    this.colorHandle.style.left = `${x}px`;
    this.colorHandle.style.top = `${y}px`;
    
    // Update saturation/lightness area background color
    this.saturationLightnessArea.style.background = `hsl(${this.currentColor.hsl.h}, 100%, 50%)`;
  }

  /**
   * Updates wheel picker from the current color
   */
  updateWheelPickerFromColor() {
    // Update brightness slider
    this.brightnessSlider.value = this.currentColor.hsl.l;
    
    // Update alpha slider if enabled
    if (this.alphaSlider) {
      this.alphaSlider.value = this.currentColor.a;
    }
    
    // Redraw the color wheel
    this.drawColorWheel();
  }

  /**
   * Updates advanced picker from the current color
   */
  updateAdvancedPickerFromColor() {
    // Update RGB inputs
    if (this.rgbInputsContainer) {
      ['r', 'g', 'b'].forEach(channel => {
        const input = this.rgbInputsContainer.querySelector(`[data-channel="${channel}"]`);
        if (input) input.value = Math.round(this.currentColor[channel]);
      });
    }
    
    // Update HSL inputs
    if (this.hslInputsContainer) {
      ['h', 's', 'l'].forEach(channel => {
        const input = this.hslInputsContainer.querySelector(`[data-channel="${channel}"]`);
        if (input) input.value = Math.round(this.currentColor.hsl[channel]);
      });
    }
    
    // Update hex input
    if (this.colorInput) {
      this.colorInput.value = this.formatColor(this.currentColor, 'hex');
    }
  }

  /**
   * Updates the color preview element
   * @param {Object} color - Color object to use (optional, defaults to current color)
   */
  updateColorPreview(color) {
    const c = color || this.currentColor;
    this.colorPreview.style.backgroundColor = this.rgbaToHex(c);
  }

  /**
   * Updates the color value display
   */
  updateColorValueDisplay() {
    this.colorValueDisplay.textContent = this.formatColor(this.currentColor, this.options.outputFormat);
  }

  /**
   * Updates color from RGB values
   */
  updateFromRGB() {
    const hsl = this.rgbToHsl(this.currentColor.r, this.currentColor.g, this.currentColor.b);
    this.currentColor.hsl = hsl;
    
    this.updatePickerFromColor();
    
    // Execute change callback
    if (this.options.onChange) {
      this.options.onChange(this.formatColor(this.currentColor, this.options.outputFormat));
    }
  }

  /**
   * Updates color from HSL values
   */
  updateFromHSL() {
    const rgb = this.hslToRgb(this.currentColor.hsl.h, this.currentColor.hsl.s, this.currentColor.hsl.l);
    this.currentColor.r = rgb.r;
    this.currentColor.g = rgb.g;
    this.currentColor.b = rgb.b;
    
    this.updatePickerFromColor();
    
    // Execute change callback
    if (this.options.onChange) {
      this.options.onChange(this.formatColor(this.currentColor, this.options.outputFormat));
    }
  }

  /**
   * Adds a color to the custom palette
   * @param {Object} color - Color object to add
   */
  addToCustomPalette(color) {
    // Convert to hex for storage
    const hexColor = this.rgbaToHex(color);
    
    // Add to custom palette if not already present
    if (!this.customPalette.includes(hexColor)) {
      this.customPalette.unshift(hexColor);
      if (this.customPalette.length > 10) {
        this.customPalette.pop();
      }
      
      // Update UI
      this.updateCustomPaletteDisplay();
    }
  }

  /**
   * Updates the custom palette display
   */
  updateCustomPaletteDisplay() {
    if (!this.customPaletteGrid) return;
    
    const colorBoxes = this.customPaletteGrid.querySelectorAll('.custom-palette-color-box');
    
    colorBoxes.forEach((box, index) => {
      if (this.customPalette[index]) {
        box.style.backgroundColor = this.customPalette[index];
        box.style.display = 'block';
      } else {
        box.style.display = 'none';
      }
    });
  }

  /**
   * Adds a color to recent colors
   * @param {Object} color - Color object to add
   */
  addToRecentColors(color) {
    const hexColor = this.rgbaToHex(color);
    
    // Remove if already exists
    this.recentColors = this.recentColors.filter(c => c !== hexColor);
    
    // Add to beginning
    this.recentColors.unshift(hexColor);
    
    // Limit to max count
    if (this.recentColors.length > this.options.recentColorsLimit) {
      this.recentColors = this.recentColors.slice(0, this.options.recentColorsLimit);
    }
    
    // Update UI
    this.updateRecentColorsDisplay();
  }

  /**
   * Updates the recent colors display
   */
  updateRecentColorsDisplay() {
    if (!this.recentColorsGrid) return;
    
    // Clear current content
    this.recentColorsGrid.innerHTML = '';
    
    // Add color boxes
    this.recentColors.forEach(color => {
      const colorBox = document.createElement('div');
      colorBox.classList.add('recent-color-box');
      colorBox.style.backgroundColor = color;
      colorBox.dataset.color = color;
      
      colorBox.addEventListener('click', () => {
        this.setColor(color);
      });
      
      this.recentColorsGrid.appendChild(colorBox);
    });
  }

  /**
   * Draws the color wheel on the canvas
   */
  drawColorWheel() {
    if (!this.wheelCanvas) return;
    
    const ctx = this.wheelCanvas.getContext('2d');
    const centerX = this.wheelCanvas.width / 2;
    const centerY = this.wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 2; // Subtract border padding
    
    // Create radial gradient for brightness
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Set color based on angle (hue)
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.fill();
    }
    
    // Apply brightness gradient
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.wheelCanvas.width, this.wheelCanvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Draw center circle with current brightness
    const brightnessColor = `hsl(${this.currentColor.hsl.h}, ${this.currentColor.hsl.s}%, ${this.brightnessSlider.value}%)`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = brightnessColor;
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#4facfe';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /**
   * Converts hex color to RGBA object
   * @param {string} hex - Hex color string
   * @returns {Object} RGBA color object
   */
  hexToRgba(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1,
      hsl: this.rgbToHsl(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16))
    } : { r: 0, g: 0, b: 0, a: 1, hsl: { h: 0, s: 0, l: 0 } };
  }

  /**
   * Converts RGBA object to hex string
   * @param {Object} rgba - RGBA color object
   * @returns {string} Hex color string
   */
  rgbaToHex(rgba) {
    const r = Math.round(rgba.r).toString(16).padStart(2, '0');
    const g = Math.round(rgba.g).toString(16).padStart(2, '0');
    const b = Math.round(rgba.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  /**
   * Converts RGB to HSL
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {Object} HSL object
   */
  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Converts HSL to RGB
   * @param {number} h - Hue value (0-360)
   * @param {number} s - Saturation value (0-100)
   * @param {number} l - Lightness value (0-100)
   * @returns {Object} RGB object
   */
  hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    } else {
      r = 0; g = 0; b = 0;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  }

  /**
   * Formats a color object to the specified format
   * @param {Object} color - Color object
   * @param {string} format - Output format ('hex', 'rgb', 'hsl', 'hsv')
   * @returns {string} Formatted color string
   */
  formatColor(color, format) {
    switch (format) {
      case 'rgb':
        return `rgb(${color.r}, ${color.g}, ${color.b})`;
      case 'rgba':
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      case 'hsl':
        return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
      case 'hsla':
        return `hsla(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%, ${color.a})`;
      case 'hsv':
        const hsv = this.rgbToHsv(color.r, color.g, color.b);
        return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
      default: // hex
        return this.rgbaToHex(color);
    }
  }

  /**
   * Converts RGB to HSV
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {Object} HSV object
   */
  rgbToHsv(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }

  /**
   * Parses a color string to a color object
   * @param {string} colorString - Color string in any format
   * @returns {Object|null} Color object or null if invalid
   */
  parseColor(colorString) {
    // Handle hex
    if (colorString.startsWith('#')) {
      return this.hexToRgba(colorString);
    }
    
    // Handle rgb/rgba
    const rgbMatch = colorString.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
      
      return {
        r, g, b, a,
        hsl: this.rgbToHsl(r, g, b)
      };
    }
    
    // Handle hsl/hsla
    const hslMatch = colorString.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (hslMatch) {
      const h = parseInt(hslMatch[1]);
      const s = parseInt(hslMatch[2]);
      const l = parseInt(hslMatch[3]);
      const a = hslMatch[4] ? parseFloat(hslMatch[4]) : 1;
      
      const rgb = this.hslToRgb(h, s, l);
      return {
        r: rgb.r, g: rgb.g, b: rgb.b, a,
        hsl: { h, s, l }
      };
    }
    
    // Try to use DOM to convert named colors
    const tempDiv = document.createElement('div');
    tempDiv.style.color = colorString;
    document.body.appendChild(tempDiv);
    
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    if (computedColor) {
      const rgbValues = computedColor.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        
        return {
          r, g, b, a: rgbValues.length === 4 ? parseFloat(rgbValues[3]) : 1,
          hsl: this.rgbToHsl(r, g, b)
        };
      }
    }
    
    return null;
  }

  /**
   * Checks if a color string is valid
   * @param {string} colorString - Color string to validate
   * @returns {boolean} Whether the color is valid
   */
  isValidColor(colorString) {
    if (!colorString) return false;
    return this.parseColor(colorString) !== null;
  }

  /**
   * Generates a random color
   * @returns {string} Random hex color
   */
  getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return this.rgbaToHex({ r, g, b, a: 1, hsl: this.rgbToHsl(r, g, b) });
  }

  /**
   * Generates a color scheme based on the current color
   * @param {string} schemeType - Type of color scheme ('complementary', 'triadic', 'tetradic', 'analogous', 'monochromatic')
   * @returns {Array} Array of color strings
   */
  generateColorScheme(schemeType) {
    const baseHue = this.currentColor.hsl.h;
    const baseSaturation = this.currentColor.hsl.s;
    const baseLightness = this.currentColor.hsl.l;
    
    let hues = [];
    
    switch (schemeType) {
      case 'complementary':
        hues = [baseHue, (baseHue + 180) % 360];
        break;
      case 'triadic':
        hues = [
          baseHue, 
          (baseHue + 120) % 360, 
          (baseHue + 240) % 360
        ];
        break;
      case 'tetradic':
        hues = [
          baseHue,
          (baseHue + 60) % 360,
          (baseHue + 180) % 360,
          (baseHue + 240) % 360
        ];
        break;
      case 'analogous':
        hues = [
          (baseHue + 330) % 360, // 30 degrees back
          baseHue,
          (baseHue + 30) % 360   // 30 degrees forward
        ];
        break;
      case 'monochromatic':
        // Same hue, different saturation/lightness
        return [
          this.rgbaToHex({ 
            ...this.hslToRgb(baseHue, baseSaturation, 20), 
            hsl: { h: baseHue, s: baseSaturation, l: 20 }, 
            a: 1 
          }),
          this.rgbaToHex({ 
            ...this.hslToRgb(baseHue, baseSaturation, 40), 
            hsl: { h: baseHue, s: baseSaturation, l: 40 }, 
            a: 1 
          }),
          this.rgbaToHex({ 
            ...this.hslToRgb(baseHue, baseSaturation, 60), 
            hsl: { h: baseHue, s: baseSaturation, l: 60 }, 
            a: 1 
          }),
          this.rgbaToHex({ 
            ...this.hslToRgb(baseHue, baseSaturation, 80), 
            hsl: { h: baseHue, s: baseSaturation, l: 80 }, 
            a: 1 
          })
        ];
      default:
        return [this.formatColor(this.currentColor, 'hex')];
    }
    
    // Create colors with the calculated hues
    return hues.map(hue => 
      this.rgbaToHex({ 
        ...this.hslToRgb(hue, baseSaturation, baseLightness), 
        hsl: { h: hue, s: baseSaturation, l: baseLightness }, 
        a: 1 
      })
    );
  }

  /**
   * Gets the contrast ratio between two colors
   * @param {string} color1 - First color
   * @param {string} color2 - Second color
   * @returns {number} Contrast ratio
   */
  getContrastRatio(color1, color2) {
    const color1Rgb = this.parseColor(color1) || { r: 0, g: 0, b: 0 };
    const color2Rgb = this.parseColor(color2) || { r: 255, g: 255, b: 255 };
    
    const lum1 = this.getRelativeLuminance(color1Rgb);
    const lum2 = this.getRelativeLuminance(color2Rgb);
    
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  /**
   * Gets the relative luminance of a color
   * @param {Object} rgb - RGB color object
   * @returns {number} Relative luminance
   */
  getRelativeLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Finds the most readable color from an array of candidate colors
   * @param {string} backgroundColor - Background color
   * @param {Array} candidateColors - Array of candidate colors
   * @param {number} minContrast - Minimum contrast ratio (default: 4.5)
   * @returns {string} Most readable color
   */
  findMostReadableColor(backgroundColor, candidateColors, minContrast = 4.5) {
    let bestColor = candidateColors[0];
    let bestRatio = 0;
    
    for (const color of candidateColors) {
      const ratio = this.getContrastRatio(backgroundColor, color);
      if (ratio > bestRatio && ratio >= minContrast) {
        bestRatio = ratio;
        bestColor = color;
      }
    }
    
    return bestColor;
  }

  /**
   * Adds dynamic styles for the color picker
   */
  addDynamicStyles() {
    if (document.getElementById('color-picker-styles')) return;

    const style = document.createElement('style');
    style.id = 'color-picker-styles';
    style.textContent = `
      .color-picker {
        position: relative;
        width: 300px;
        background: var(--bg-darker, #111);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 5px 15px rgba(0, 242, 234, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .color-picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
      }
      
      .color-preview {
        width: 40px;
        height: 40px;
        border: 2px solid var(--border-lighter, #222);
        border-radius: 6px;
        cursor: pointer;
      }
      
      .color-value-display {
        font-family: monospace;
        font-size: 0.9em;
        color: var(--text-light, #fff);
        padding: 4px 8px;
        background: var(--bg-dark, #0a0a0a);
        border-radius: 4px;
        border: 1px solid var(--border-lighter, #222);
      }
      
      .saturation-lightness-area {
        width: 100%;
        height: 200px;
        position: relative;
        background: linear-gradient(to right, #fff, hsl(0, 100%, 50%)), 
                    linear-gradient(to top, #000, transparent);
        border-radius: 6px;
        margin-bottom: 15px;
        cursor: crosshair;
      }
      
      .color-handle {
        position: absolute;
        width: 12px;
        height: 12px;
        border: 2px solid #fff;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 0 1px #000;
        cursor: pointer;
      }
      
      .hue-slider-container, .alpha-slider-container, .brightness-slider-container {
        margin-bottom: 15px;
      }
      
      .hue-slider, .alpha-slider, .brightness-slider {
        width: 100%;
        height: 20px;
        -webkit-appearance: none;
        background: linear-gradient(to right, 
          #ff0000 0%, #ffff00 17%, #00ff00 33%, 
          #00ffff 50%, #0000ff 67%, #ff00ff 83%, 
          #ff0000 100%);
        border-radius: 10px;
        outline: none;
      }
      
      .alpha-slider, .brightness-slider {
        background: linear-gradient(to right, transparent, #00f2ea);
      }
      
      .hue-slider::-webkit-slider-thumb, 
      .alpha-slider::-webkit-slider-thumb,
      .brightness-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 20px;
        height: 24px;
        border-radius: 4px;
        background: var(--text-light, #fff);
        cursor: pointer;
        border: 1px solid var(--border-default, #4facfe);
      }
      
      .color-wheel {
        width: 200px;
        height: 200px;
        margin: 0 auto 15px;
        border-radius: 50%;
        cursor: crosshair;
      }
      
      .palette-grid, .preset-grid, .custom-palette-grid, .recent-colors-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        margin: 10px 0;
      }
      
      .preset-color-box, .custom-palette-color-box, .recent-color-box {
        height: 30px;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.2s ease;
        border: 1px solid var(--border-lighter, #222);
      }
      
      .preset-color-box:hover, .custom-palette-color-box:hover, .recent-color-box:hover {
        transform: scale(1.1);
      }
      
      .custom-palette-color-box {
        position: relative;
      }
      
      .custom-palette-color-box::after {
        content: '+';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--text-light, #fff);
        font-size: 1.2rem;
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .custom-palette-color-box:hover::after {
        opacity: 0.6;
      }
      
      .color-input {
        width: 100%;
        padding: 10px;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 6px;
        color: var(--text-light, #fff);
        font-family: monospace;
      }
      
      .rgb-inputs-container, .hsl-inputs-container {
        display: flex;
        gap: 10px;
        margin: 10px 0;
      }
      
      .rgb-channel-input, .hsl-channel-input {
        flex: 1;
        padding: 8px;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 4px;
        color: var(--text-light, #fff);
        text-align: center;
      }
      
      .format-selector {
        width: 100%;
        padding: 8px;
        background: var(--bg-dark, #0a0a0a);
        border: 1px solid var(--border-default, #4facfe);
        border-radius: 4px;
        color: var(--text-light, #fff);
        margin-top: 10px;
      }
      
      .add-to-palette-button {
        width: 100%;
        padding: 10px;
        background: var(--bg-accent, #007acc);
        color: var(--text-light, #fff);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s ease;
        margin-top: 10px;
      }
      
      .add-to-palette-button:hover {
        background: var(--bg-accent-hover, #005a9e);
      }
      
      .preset-section, .custom-palette-section, .recent-colors-section {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid var(--border-lighter, #222);
      }
      
      .preset-section h4, .custom-palette-section h4, .recent-colors-section h4 {
        margin: 0 0 10px 0;
        color: var(--text-lighter, #ccc);
        font-size: 1rem;
      }
      
      /* Responsive adjustments */
      @media (max-width: 400px) {
        .color-picker {
          width: calc(100% - 20px);
        }
        
        .palette-grid, .preset-grid, .custom-palette-grid, .recent-colors-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Destroys the color picker and cleans up
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    // Clear the container
    this.container.innerHTML = '';
    this.container.classList.remove('color-picker');
  }
}

/**
 * Initializes all color pickers on the page
 * @param {HTMLElement|Document} container - Container to search for color pickers
 * @returns {Array} Array of initialized color picker instances
 */
function initColorPickers(container = document) {
  const pickerElements = container.querySelectorAll('.color-picker, [data-color-picker]');
  const instances = [];

  pickerElements.forEach(element => {
    if (!element.hasAttribute('data-color-picker-initialized')) {
      element.setAttribute('data-color-picker-initialized', 'true');

      // Get options from data attributes
      const options = {
        type: element.dataset.type || 'hue',
        initialColor: element.dataset.initialColor || '#00f2ea',
        showPresets: element.dataset.showPresets !== 'false',
        showCustomPalette: element.dataset.showCustomPalette === 'true',
        showRecentColors: element.dataset.showRecentColors !== 'false',
        showAlpha: element.dataset.showAlpha !== 'false',
        outputFormat: element.dataset.outputFormat || 'hex',
        ...JSON.parse(element.dataset.options || '{}')
      };

      const instance = new ColorPicker(element, options);
      instances.push(instance);
    }
  });

  return instances;
}

/**
 * Auto-initialize color pickers when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initColorPickers();
  }, 0);
});

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ColorPicker, initColorPickers };
}

// Make available globally
window.ColorPicker = ColorPicker;
window.initColorPickers = initColorPickers;