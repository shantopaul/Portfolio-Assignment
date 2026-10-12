/**
 * ============================================================================
 * CONTACT.JS — CLIENT-SIDE VALIDATION, ANTI-SPAM & SUBMISSION ENGINE
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * Standards: WCAG 2.1 AA Accessible Forms, RFC 5322 Email Validation
 * ============================================================================
 */

export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = form.querySelector('#contact-name');
  const emailInput = form.querySelector('#contact-email');
  const subjectInput = form.querySelector('#contact-subject');
  const messageInput = form.querySelector('#contact-message');
  const charCounter = form.querySelector('#message-char-counter');
  const statusMsg = document.getElementById('contact-status-msg');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Real-time character counter for message
  if (messageInput && charCounter) {
    const updateCharCount = () => {
      const length = messageInput.value.length;
      charCounter.textContent = `${length} / 1000 characters`;
      if (length > 1000) {
        charCounter.style.color = 'var(--error)';
      } else {
        charCounter.style.color = 'var(--text-muted)';
      }
    };
    messageInput.addEventListener('input', updateCharCount);
    updateCharCount();
  }

  // Real-time field validation listeners
  if (nameInput) {
    nameInput.addEventListener('blur', () => validateName(nameInput));
    nameInput.addEventListener('input', () => {
      if (nameInput.classList.contains('error')) validateName(nameInput);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('blur', () => validateEmail(emailInput));
    emailInput.addEventListener('input', () => {
      if (emailInput.classList.contains('error')) validateEmail(emailInput);
    });
  }

  if (subjectInput) {
    subjectInput.addEventListener('blur', () => validateSubject(subjectInput));
    subjectInput.addEventListener('input', () => {
      if (subjectInput.classList.contains('error')) validateSubject(subjectInput);
    });
  }

  if (messageInput) {
    messageInput.addEventListener('blur', () => validateMessage(messageInput));
    messageInput.addEventListener('input', () => {
      if (messageInput.classList.contains('error')) validateMessage(messageInput);
    });
  }

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Anti-spam honeypot detection
    const honeypot = form.querySelector('input[name="bot-field"], input[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('🛡️ Bot submission rejected by honeypot filter.');
      return;
    }

    // 2. Validate all fields
    const isNameValid = validateName(nameInput);
    const isEmailValid = validateEmail(emailInput);
    const isSubjectValid = validateSubject(subjectInput);
    const isMessageValid = validateMessage(messageInput);

    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
      // Focus first invalid input
      if (!isNameValid) nameInput?.focus();
      else if (!isEmailValid) emailInput?.focus();
      else if (!isSubjectValid) subjectInput?.focus();
      else if (!isMessageValid) messageInput?.focus();
      return;
    }

    // 3. UI Loading state
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : 'Send Message';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending message...`;
    }

    if (statusMsg) {
      statusMsg.style.display = 'none';
      statusMsg.className = 'contact-status-msg';
      statusMsg.textContent = '';
    }

    try {
      const formData = new FormData(form);
      const encodedData = new URLSearchParams(formData).toString();

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodedData
      });

      if (response.ok || response.status === 200 || response.status === 204) {
        form.reset();
        if (charCounter) charCounter.textContent = '0 / 1000 characters';

        if (statusMsg) {
          statusMsg.className = 'contact-status-msg success';
          statusMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully. I'll get back to you shortly.`;
          statusMsg.style.display = 'flex';
        }
      } else {
        throw new Error(`Submission failed with status: ${response.status}`);
      }
    } catch (err) {
      console.warn('Notice: Form submission endpoint unavailable, providing graceful feedback.', err);
      if (statusMsg) {
        statusMsg.className = 'contact-status-msg error';
        statusMsg.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Unable to deliver message via form endpoint right now. Please email directly at <strong>your.email@example.com</strong>.`;
        statusMsg.style.display = 'flex';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    }
  });
}

function validateName(input) {
  if (!input) return true;
  const val = input.value.trim();
  const namePattern = /^[A-Za-z\s.'-]+$/;

  if (val.length === 0) {
    showFieldError(input, 'Please enter your name.');
    return false;
  }
  if (val.length < 2) {
    showFieldError(input, 'Name must be at least 2 characters.');
    return false;
  }
  if (!namePattern.test(val)) {
    showFieldError(input, 'Name should contain letters and standard characters only.');
    return false;
  }

  clearFieldError(input);
  return true;
}

function validateEmail(input) {
  if (!input) return true;
  const val = input.value.trim();
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (val.length === 0) {
    showFieldError(input, 'Please enter your email address.');
    return false;
  }
  if (!emailPattern.test(val)) {
    showFieldError(input, 'Please enter a valid email address (e.g., name@example.com).');
    return false;
  }

  clearFieldError(input);
  return true;
}

function validateSubject(input) {
  if (!input) return true;
  const val = input.value.trim();

  if (val.length === 0) {
    showFieldError(input, 'Please enter a subject.');
    return false;
  }
  if (val.length < 3) {
    showFieldError(input, 'Subject must be at least 3 characters.');
    return false;
  }

  clearFieldError(input);
  return true;
}

function validateMessage(input) {
  if (!input) return true;
  const val = input.value.trim();

  if (val.length === 0) {
    showFieldError(input, 'Please enter your message.');
    return false;
  }
  if (val.length < 10) {
    showFieldError(input, 'Message must be at least 10 characters.');
    return false;
  }
  if (val.length > 1000) {
    showFieldError(input, 'Message cannot exceed 1000 characters.');
    return false;
  }

  clearFieldError(input);
  return true;
}

function showFieldError(input, message) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const formGroup = input.closest('.form-group') || input.parentElement;
  const errorEl = formGroup?.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function clearFieldError(input) {
  input.classList.remove('error');
  input.setAttribute('aria-invalid', 'false');
  const formGroup = input.closest('.form-group') || input.parentElement;
  const errorEl = formGroup?.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}
