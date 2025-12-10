// Enhanced phone input component with country selection and formatting

class PhoneInput {
  constructor(input, options = {}) {
    this.input = typeof input === 'string' ? document.querySelector(input) : input;
    this.options = {
      defaultCountry: options.defaultCountry || 'US',
      onlyCountries: options.onlyCountries || [],
      preferredCountries: options.preferredCountries || ['US', 'GB'],
      allowDropdown: options.allowDropdown !== false,
      autoPlaceholder: options.autoPlaceholder || 'polite',
      autoFormat: options.autoFormat !== false,
      initialCountry: options.initialCountry || 'auto',
      nationalMode: options.nationalMode !== false,
      separateDialCode: options.separateDialCode || false,
      ...options
    };
    
    this.countries = this.getCountries();
    this.selectedCountry = this.getCountryData(this.options.defaultCountry);
    
    this.init();
  }
  
  init() {
    // Create the phone input container
    this.createContainer();
    
    // Add event listeners
    this.setupEventListeners();
  }
  
  createContainer() {
    // Create wrapper div
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'phone-input-container';
    
    // Create country selector if allowed
    if (this.options.allowDropdown) {
      this.createCountrySelector();
    }
    
    // Create the input field
    this.input.classList.add('phone-number-input');
    this.input.setAttribute('type', 'tel');
    this.input.setAttribute('placeholder', this.getPlaceholder());
    
    // Wrap the input and country selector
    this.input.parentNode.insertBefore(this.wrapper, this.input);
    this.wrapper.appendChild(this.input);
    
    if (this.countrySelector) {
      this.wrapper.insertBefore(this.countrySelector, this.input);
    }
  }
  
  createCountrySelector() {
    this.countrySelector = document.createElement('div');
    this.countrySelector.className = 'country-selector';
    
    // Create selected country display
    this.selectedFlag = document.createElement('div');
    this.selectedFlag.className = 'selected-flag';
    this.selectedFlag.innerHTML = this.getCountryFlag(this.selectedCountry.iso2);
    this.selectedFlag.appendChild(document.createElement('div')).className = 'arrow';
    
    // Create dropdown container
    this.countryList = document.createElement('div');
    this.countryList.className = 'country-list';
    this.countryList.style.display = 'none';
    
    // Add countries to the list
    this.renderCountryList();
    
    this.countrySelector.appendChild(this.selectedFlag);
    this.countrySelector.appendChild(this.countryList);
  }
  
  renderCountryList() {
    // Clear existing list
    this.countryList.innerHTML = '';
    
    // Add preferred countries first
    if (this.options.preferredCountries.length > 0) {
      this.options.preferredCountries.forEach(countryCode => {
        const country = this.getCountryData(countryCode);
        if (country) {
          this.addCountryToDropdown(country);
        }
      });
      
      // Add divider
      const divider = document.createElement('div');
      divider.className = 'divider';
      this.countryList.appendChild(divider);
    }
    
    // Add all countries or filtered countries
    const countriesToDisplay = this.options.onlyCountries.length > 0 
      ? this.options.onlyCountries.map(code => this.getCountryData(code)).filter(c => c) 
      : this.countries;
    
    countriesToDisplay.forEach(country => {
      this.addCountryToDropdown(country);
    });
  }
  
  addCountryToDropdown(country) {
    const countryElement = document.createElement('div');
    countryElement.className = 'country';
    countryElement.dataset.countryCode = country.iso2;
    
    countryElement.innerHTML = `
      <div class="flag">${this.getCountryFlag(country.iso2)}</div>
      <span class="country-name">${country.name}</span>
      <span class="dial-code">+${country.dialCode}</span>
    `;
    
    countryElement.addEventListener('click', () => {
      this.selectCountry(country.iso2);
    });
    
    this.countryList.appendChild(countryElement);
  }
  
  getCountryFlag(iso2) {
    // Using Unicode regional indicators for flags
    const base = 0x1F1A5; // Base code for regional indicators
    const flag = String.fromCodePoint(
      base + iso2.charCodeAt(0) - 65,
      base + iso2.charCodeAt(1) - 65
    );
    return flag;
  }
  
  selectCountry(countryCode) {
    this.selectedCountry = this.getCountryData(countryCode);
    this.selectedFlag.innerHTML = this.getCountryFlag(this.selectedCountry.iso2);
    this.selectedFlag.appendChild(document.createElement('div')).className = 'arrow';
    
    // Update placeholder
    if (this.options.autoPlaceholder !== false) {
      this.input.setAttribute('placeholder', this.getPlaceholder());
    }
    
    // Format the phone number if it has a value
    if (this.options.autoFormat && this.input.value) {
      this.formatNumber();
    }
    
    // Hide dropdown
    this.countryList.style.display = 'none';
    
    // Trigger custom event
    this.input.dispatchEvent(new CustomEvent('country-change', {
      detail: { country: this.selectedCountry }
    }));
  }
  
  toggleCountryDropdown() {
    if (this.countryList.style.display === 'block') {
      this.countryList.style.display = 'none';
    } else {
      this.renderCountryList();
      this.countryList.style.display = 'block';
    }
  }
  
  setupEventListeners() {
    // Country selector click
    if (this.countrySelector) {
      this.selectedFlag.addEventListener('click', () => {
        this.toggleCountryDropdown();
      });
    }
    
    // Format number as user types
    if (this.options.autoFormat) {
      this.input.addEventListener('input', () => {
        this.formatNumber();
      });
    }
    
    // Close dropdown on blur
    this.input.addEventListener('blur', () => {
      setTimeout(() => {
        if (this.countryList) {
          this.countryList.style.display = 'none';
        }
      }, 200);
    });
    
    // Handle document clicks to close dropdown
    document.addEventListener('click', (e) => {
      if (this.countryList && !this.wrapper.contains(e.target)) {
        this.countryList.style.display = 'none';
      }
    });
  }
  
  formatNumber() {
    let value = this.input.value.replace(/\D/g, ''); // Remove all non-digits
    
    // Apply formatting based on country
    switch (this.selectedCountry.iso2) {
      case 'US':
        // Format US numbers as (123) 456-7890
        if (value.length >= 6) {
          value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
          value = value.replace(/(\d{3})(\d+)/, '($1) $2');
        }
        break;
      case 'GB':
        // Format UK numbers as +44 XXXX XXXXXX
        if (value.length > 4) {
          value = value.replace(/(\d{4})(\d{6})/, '$1 $2');
        }
        break;
      case 'FR':
        // Format French numbers as XX XX XX XX XX
        if (value.length > 2) {
          value = value.replace(/(\d{2})(\d{2})/, '$1 $2');
        }
        if (value.length > 5) {
          value = value.replace(/(\d{2})\s(\d{2})(\d{2})/, '$1 $2 $3');
        }
        if (value.length > 8) {
          value = value.replace(/(\d{2})\s(\d{2})\s(\d{2})(\d{2})/, '$1 $2 $3 $4');
        }
        if (value.length > 11) {
          value = value.replace(/(\d{2})\s(\d{2})\s(\d{2})\s(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }
        break;
      // Add more countries as needed
      default:
        // If the country doesn't have specific formatting, just add spaces every 3 digits
        value = value.replace(/(\d{3})/g, '$1 ').trim();
        break;
    }
    
    this.input.value = value;
  }
  
  getPlaceholder() {
    // Return an example number for the selected country as placeholder
    // In a real implementation, you might want to fetch actual examples
    switch (this.selectedCountry.iso2) {
      case 'US':
        return '(201) 555-0123';
      case 'GB':
        return '1234 567890';
      case 'FR':
        return '01 23 45 67 89';
      default:
        return 'Enter phone number';
    }
  }
  
  // Get complete phone number with country code
  getFullNumber() {
    const number = this.input.value.replace(/\D/g, '');
    return `+${this.selectedCountry.dialCode}${number}`;
  }
  
  // Set phone number (with or without country code)
  setNumber(phoneNumber) {
    // Remove country code if present
    let number = phoneNumber.replace(/\D/g, '');
    if (phoneNumber.startsWith('+')) {
      // Try to identify country from the phone number
      this.countries.forEach(country => {
        if (phoneNumber.startsWith(`+${country.dialCode}`)) {
          this.selectCountry(country.iso2);
          number = number.substring(country.dialCode.length);
          return;
        }
      });
    }
    
    // Set the input value and format it
    this.input.value = number;
    if (this.options.autoFormat) {
      this.formatNumber();
    }
  }
  
  // Get country data by ISO code
  getCountryData(iso2) {
    return this.countries.find(country => country.iso2 === iso2);
  }
  
  // Get countries list
  getCountries() {
    return [
      { name: 'United States', iso2: 'US', dialCode: '1' },
      { name: 'United Kingdom', iso2: 'GB', dialCode: '44' },
      { name: 'France', iso2: 'FR', dialCode: '33' },
      { name: 'Germany', iso2: 'DE', dialCode: '49' },
      { name: 'Canada', iso2: 'CA', dialCode: '1' },
      { name: 'Australia', iso2: 'AU', dialCode: '61' },
      { name: 'Japan', iso2: 'JP', dialCode: '81' },
      { name: 'China', iso2: 'CN', dialCode: '86' },
      { name: 'India', iso2: 'IN', dialCode: '91' },
      { name: 'Brazil', iso2: 'BR', dialCode: '55' },
      { name: 'Russia', iso2: 'RU', dialCode: '7' },
      { name: 'Mexico', iso2: 'MX', dialCode: '52' },
      { name: 'South Africa', iso2: 'ZA', dialCode: '27' },
      { name: 'Egypt', iso2: 'EG', dialCode: '20' },
      { name: 'Nigeria', iso2: 'NG', dialCode: '234' },
      { name: 'Kenya', iso2: 'KE', dialCode: '254' },
      // Add more countries as needed
    ];
  }
  
  // Validate phone number format
  validate() {
    const number = this.input.value.replace(/\D/g, '');
    const dialCode = this.selectedCountry.dialCode;
    
    // Simple validation - check if the number has enough digits
    // More sophisticated validation would be needed for production
    return number.length >= 7 && number.length <= 15;
  }
}

// Export the PhoneInput class
export default PhoneInput;