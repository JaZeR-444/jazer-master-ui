// Form helper utilities

function serializeForm(form) {
  const formData = new FormData(form);
  const object = {};
  for (const [key, value] of formData.entries()) {
    object[key] = value;
  }
  return object;
}

function populateForm(form, data) {
  for (const key in data) {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) {
      if (field.type === 'checkbox' || field.type === 'radio') {
        field.checked = Boolean(data[key]);
      } else if (field.tagName === 'SELECT') {
        field.value = data[key];
      } else {
        field.value = data[key];
      }
    }
  }
}

function resetForm(form) {
  form.reset();
  // Clear any validation error messages
  const errorElements = form.querySelectorAll('.error-message');
  errorElements.forEach(el => el.remove());
}

function disableForm(form) {
  const inputs = form.querySelectorAll('input, textarea, select, button');
  inputs.forEach(input => {
    input.disabled = true;
  });
}

function enableForm(form) {
  const inputs = form.querySelectorAll('input, textarea, select, button');
  inputs.forEach(input => {
    input.disabled = false;
  });
}

function getFormErrors(form) {
  const errors = [];
  const invalidInputs = form.querySelectorAll(':invalid');
  invalidInputs.forEach(input => {
    const error = {
      name: input.name,
      value: input.value,
      validity: input.validity,
      message: input.validationMessage
    };
    errors.push(error);
  });
  return errors;
}

export { serializeForm, populateForm, resetForm, disableForm, enableForm, getFormErrors };