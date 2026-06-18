// validation.js – client‑side form validation for Life Hope web pages

/** Utility to show an error message next to an input */
function showError(input, message) {
  let errorEl = input.parentNode.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    input.parentNode.appendChild(errorEl);
  }
  errorEl.textContent = message;
  input.classList.add('invalid');
}

/** Clear any error for an input */
function clearError(input) {
  const errorEl = input.parentNode.querySelector('.error-message');
  if (errorEl) errorEl.textContent = '';
  input.classList.remove('invalid');
}

/** Validate email format */
function isValidEmail(email) {
  // Simple RFC‑5322 email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/** Validate phone (basic) */
function isValidPhone(phone) {
  const re = /^\+?\d{7,15}$/; // allows optional + and 7‑15 digits
  return re.test(phone);
}

/** Login form validation */
function validateLoginForm(event) {
  const form = event.target;
  const emailInput = form.querySelector('input[name="email"]');
  const passwordInput = form.querySelector('input[name="password"]');
  let valid = true;

  // Email check
  if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
    showError(emailInput, 'Please enter a valid email address');
    valid = false;
  } else {
    clearError(emailInput);
  }

  // Password check (min 6 chars)
  if (!passwordInput.value.trim() || passwordInput.value.trim().length < 6) {
    showError(passwordInput, 'Password must be at least 6 characters');
    valid = false;
  } else {
    clearError(passwordInput);
  }

  if (!valid) {
    event.preventDefault(); // stop form submission
  } else {
    event.preventDefault();
    alert('Login form is valid! (Backend integration pending)');
  }
}

/** Register form validation */
function validateRegisterForm(event) {
  const form = event.target;
  const nameInput = form.querySelector('input[name="fullName"]');
  const emailInput = form.querySelector('input[name="email"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const organSelect = form.querySelector('select[name="organ"]');
  let valid = true;

  if (!nameInput.value.trim()) {
    showError(nameInput, 'Full name is required');
    valid = false;
  } else {
    clearError(nameInput);
  }

  if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
    showError(emailInput, 'Enter a valid email');
    valid = false;
  } else {
    clearError(emailInput);
  }

  if (!phoneInput.value.trim() || !isValidPhone(phoneInput.value.trim())) {
    showError(phoneInput, 'Enter a valid phone number');
    valid = false;
  } else {
    clearError(phoneInput);
  }

  if (!organSelect.value) {
    showError(organSelect, 'Select an organ to donate');
    valid = false;
  } else {
    clearError(organSelect);
  }

  if (!valid) {
    event.preventDefault();
  } else {
    event.preventDefault();
    alert('Registration form is valid! (Backend integration pending)');
  }
}

// Attach listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm);
  }
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', validateRegisterForm);
  }
});
