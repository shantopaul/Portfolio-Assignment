/**
 * ============================================================================
 * CONTACT.JS — FORM VALIDATION & CLIENT-SIDE SANITIZATION
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * ============================================================================
 */

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusMsg = document.getElementById('contact-status-msg');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot spam check
    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('Bot submission blocked via honeypot field.');
      return;
    }

    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-email');
    const messageInput = form.querySelector('#contact-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Validation
    let isValid = true;

    if (!nameInput.value.trim()) {
      showFieldError(nameInput, 'Please provide your name.');
      isValid = false;
    } else {
      clearFieldError(nameInput);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      showFieldError(emailInput, 'Please provide a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput);
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showFieldError(messageInput, 'Message must be at least 10 characters.');
      isValid = false;
    } else {
      clearFieldError(messageInput);
    }

    if (!isValid) return;

    // Submission UI State
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        form.reset();
        if (statusMsg) {
          statusMsg.className = 'contact-status-msg success';
          statusMsg.textContent = 'Thank you! Your message has been sent successfully.';
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      if (statusMsg) {
        statusMsg.className = 'contact-status-msg error';
        statusMsg.textContent = 'Unable to send message right now. Please email directly.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Message`;
      }
    }
  });
}

function showFieldError(input, message) {
  input.classList.add('error');
  const errorEl = input.parentElement.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

function clearFieldError(input) {
  input.classList.remove('error');
  const errorEl = input.parentElement.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}
