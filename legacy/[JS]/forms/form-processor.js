// Form processing utilities

class FormProcessor {
  constructor(formElement) {
    this.form = formElement;
    this.onSubmitCallback = null;
    this.onSuccessCallback = null;
    this.onErrorCallback = null;
  }

  setOnSubmit(callback) {
    this.onSubmitCallback = callback;
  }

  setOnSuccess(callback) {
    this.onSuccessCallback = callback;
  }

  setOnError(callback) {
    this.onErrorCallback = callback;
  }

  async process(event) {
    event.preventDefault();

    if (this.onSubmitCallback) {
      this.onSubmitCallback();
    }

    try {
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      
      // Submit the form data
      const response = await this.submitForm(data);
      
      if (response.ok) {
        if (this.onSuccessCallback) {
          this.onSuccessCallback(response);
        }
      } else {
        throw new Error(`Form submission failed with status: ${response.status}`);
      }
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  async submitForm(data) {
    const action = this.form.action || window.location.href;
    const method = this.form.method || 'POST';
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

    return await fetch(action, options);
  }

  attachListener() {
    this.form.addEventListener('submit', this.process.bind(this));
  }
}

export default FormProcessor;