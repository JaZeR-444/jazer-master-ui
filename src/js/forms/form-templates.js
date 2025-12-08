// Form templates for common use cases

// Contact form template
function createContactForm(container, options = {}) {
  const formHTML = `
    <form class="contact-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input type="text" id="name" name="name" required placeholder="Enter your name">
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required placeholder="Enter your email">
      </div>
      
      <div class="form-group">
        <label for="subject">Subject</label>
        <input type="text" id="subject" name="subject" required placeholder="Enter subject">
      </div>
      
      <div class="form-group">
        <label for="message">Message</label>
        <textarea id="message" name="message" rows="5" required placeholder="Enter your message"></textarea>
      </div>
      
      <div class="form-group">
        <button type="submit">Send Message</button>
      </div>
    </form>
  `;
  
  // Insert the form HTML into the container
  const element = typeof container === 'string' ? 
    document.querySelector(container) : container;
  element.innerHTML = formHTML;
  
  // Add event listener if provided
  const form = element.querySelector('.contact-form');
  if (options.onSubmit) {
    form.addEventListener('submit', options.onSubmit);
  }
  
  return form;
}

// Login form template
function createLoginForm(container, options = {}) {
  const formHTML = `
    <form class="login-form">
      <div class="form-group">
        <label for="username">Username or Email</label>
        <input type="text" id="username" name="username" required placeholder="Enter your username or email">
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required placeholder="Enter your password">
        <div class="form-hint">
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
      </div>
      
      <div class="form-group checkbox-group">
        <label>
          <input type="checkbox" name="remember"> Remember me
        </label>
      </div>
      
      <div class="form-group">
        <button type="submit">Sign In</button>
      </div>
      
      ${options.showSignupLink ? 
        `<div class="form-footer">
          <p>Don't have an account? <a href="#" class="signup-link">Sign up</a></p>
        </div>` : ''}
    </form>
  `;
  
  // Insert the form HTML into the container
  const element = typeof container === 'string' ? 
    document.querySelector(container) : container;
  element.innerHTML = formHTML;
  
  // Add event listener if provided
  const form = element.querySelector('.login-form');
  if (options.onSubmit) {
    form.addEventListener('submit', options.onSubmit);
  }
  
  return form;
}

// Registration form template
function createRegistrationForm(container, options = {}) {
  const formHTML = `
    <form class="registration-form">
      <div class="form-row">
        <div class="form-group half-width">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" required placeholder="Enter first name">
        </div>
        
        <div class="form-group half-width">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" required placeholder="Enter last name">
        </div>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required placeholder="Enter email address">
      </div>
      
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required placeholder="Choose a username">
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required placeholder="Create a password">
        <div class="password-strength-meter">
          <div class="strength-bar"></div>
          <div class="strength-text">Password strength</div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password">
      </div>
      
      ${options.requireTerms ? 
        `<div class="form-group checkbox-group">
          <label>
            <input type="checkbox" name="terms" required> I agree to the <a href="#" target="_blank">Terms of Service</a> and <a href="#" target="_blank">Privacy Policy</a>
          </label>
        </div>` : ''}
      
      <div class="form-group">
        <button type="submit">Create Account</button>
      </div>
      
      ${options.showLoginLink ? 
        `<div class="form-footer">
          <p>Already have an account? <a href="#" class="login-link">Log in</a></p>
        </div>` : ''}
    </form>
  `;
  
  // Insert the form HTML into the container
  const element = typeof container === 'string' ? 
    document.querySelector(container) : container;
  element.innerHTML = formHTML;
  
  // Add event listener if provided
  const form = element.querySelector('.registration-form');
  if (options.onSubmit) {
    form.addEventListener('submit', options.onSubmit);
  }
  
  return form;
}

// Payment form template
function createPaymentForm(container, options = {}) {
  const formHTML = `
    <form class="payment-form">
      <div class="form-group">
        <label for="cardName">Name on Card</label>
        <input type="text" id="cardName" name="cardName" required placeholder="Enter name as it appears on card">
      </div>
      
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input type="text" id="cardNumber" name="cardNumber" required placeholder="1234 5678 9012 3456" maxlength="19">
      </div>
      
      <div class="form-row">
        <div class="form-group half-width">
          <label for="cardExpiry">Expiry Date</label>
          <input type="text" id="cardExpiry" name="cardExpiry" required placeholder="MM/YY" maxlength="5">
        </div>
        
        <div class="form-group half-width">
          <label for="cardCVC">CVC</label>
          <input type="text" id="cardCVC" name="cardCVC" required placeholder="123" maxlength="3">
        </div>
      </div>
      
      <div class="form-group">
        <label for="billingAddress">Billing Address</label>
        <input type="text" id="billingAddress" name="billingAddress" required placeholder="Enter your address">
      </div>
      
      <div class="form-row">
        <div class="form-group half-width">
          <label for="city">City</label>
          <input type="text" id="city" name="city" required placeholder="City">
        </div>
        
        <div class="form-group half-width">
          <label for="zipCode">ZIP Code</label>
          <input type="text" id="zipCode" name="zipCode" required placeholder="ZIP/Postal Code">
        </div>
      </div>
      
      <div class="form-group">
        <button type="submit">Complete Payment</button>
      </div>
    </form>
  `;
  
  // Insert the form HTML into the container
  const element = typeof container === 'string' ? 
    document.querySelector(container) : container;
  element.innerHTML = formHTML;
  
  // Add event listener if provided
  const form = element.querySelector('.payment-form');
  if (options.onSubmit) {
    form.addEventListener('submit', options.onSubmit);
  }
  
  return form;
}

// Survey/Feedback form template
function createSurveyForm(container, questions, options = {}) {
  let questionsHTML = '';
  
  questions.forEach((question, index) => {
    let questionHTML = `<div class="form-group question-group" data-question="${index}">`;
    questionHTML += `<label>${question.question}</label>`;
    
    if (question.type === 'text') {
      questionHTML += `<textarea name="question_${index}" rows="3" placeholder="${question.placeholder || 'Enter your answer'}"></textarea>`;
    } else if (question.type === 'radio') {
      question.options.forEach((option, optionIndex) => {
        questionHTML += `
          <div class="radio-option">
            <input type="radio" id="q${index}_opt${optionIndex}" name="question_${index}" value="${option}">
            <label for="q${index}_opt${optionIndex}">${option}</label>
          </div>
        `;
      });
    } else if (question.type === 'checkbox') {
      question.options.forEach((option, optionIndex) => {
        questionHTML += `
          <div class="checkbox-option">
            <input type="checkbox" id="q${index}_opt${optionIndex}" name="question_${index}" value="${option}">
            <label for="q${index}_opt${optionIndex}">${option}</label>
          </div>
        `;
      });
    } else if (question.type === 'rating') {
      // Create star rating UI
      for (let i = 1; i <= 5; i++) {
        questionHTML += `
          <div class="rating-option">
            <input type="radio" id="q${index}_rating${i}" name="question_${index}" value="${i}">
            <label for="q${index}_rating${i}">${i} star${i > 1 ? 's' : ''}</label>
          </div>
        `;
      }
    }
    
    questionHTML += '</div>';
    questionsHTML += questionHTML;
  });
  
  const formHTML = `
    <form class="survey-form">
      <h2>${options.title || 'Survey Form'}</h2>
      
      ${options.description ? `<p class="survey-description">${options.description}</p>` : ''}
      
      ${questionsHTML}
      
      <div class="form-group">
        <button type="submit">${options.submitButtonText || 'Submit Survey'}</button>
      </div>
    </form>
  `;
  
  // Insert the form HTML into the container
  const element = typeof container === 'string' ? 
    document.querySelector(container) : container;
  element.innerHTML = formHTML;
  
  // Add event listener if provided
  const form = element.querySelector('.survey-form');
  if (options.onSubmit) {
    form.addEventListener('submit', options.onSubmit);
  }
  
  return form;
}

// Search form template
function createSearchForm(container, options = {}) {
  const formHTML = `
    <form class="search-form">
      <div class="form-row">
        <div class="form-group full-width">
          <div class="search-input-container">
            <input type="text" name="search" required placeholder="${options.placeholder || 'Search...'}">
            <button type="submit" class="search-btn">
              <span class="search-icon">🔍</span>
            </button>
          </div>
        </div>
      </div>
      ${options.showFilters ? 
        `<div class="search-filters">
          <div class="filter-group">
            <label><input type="checkbox" name="filter1"> Filter 1</label>
            <label><input type="checkbox" name="filter2"> Filter 2</label>
            <label><input type="checkbox" name="filter3"> Filter 3</label>
          </div>
        </div>` : ''}
    </form>
  `;
  
  // Insert the form HTML into the container
  const element = typeof container === 'string' ? 
    document.querySelector(container) : container;
  element.innerHTML = formHTML;
  
  // Add event listener if provided
  const form = element.querySelector('.search-form');
  if (options.onSubmit) {
    form.addEventListener('submit', options.onSubmit);
  }
  
  return form;
}

// Export the form template functions
export { 
  createContactForm, 
  createLoginForm, 
  createRegistrationForm, 
  createPaymentForm, 
  createSurveyForm, 
  createSearchForm 
};