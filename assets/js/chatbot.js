/**
 * ============================================================================
 * CHATBOT.JS — AI CONVERSATIONAL ASSISTANT CONTROLLER
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Architecture: UI/UX Pro Max AI-Native Interface + Serverless Proxy
 * ============================================================================
 */

export function initChatbot() {
  const launcher = document.querySelector('.chat-launcher');
  const panel = document.querySelector('.chat-panel');
  const closeBtn = document.querySelector('.chat-close-btn');
  const chatBody = document.querySelector('.chat-body');
  const input = document.querySelector('.chat-input');
  const sendBtn = document.querySelector('.chat-send-btn');
  const promptPills = document.querySelectorAll('.prompt-pill');

  if (!launcher || !panel) return;

  // Toggle open/close
  const toggleChat = () => {
    const isActive = panel.classList.toggle('active');
    launcher.setAttribute('aria-expanded', String(isActive));
    if (isActive) {
      input?.focus();
    }
  };

  launcher.addEventListener('click', toggleChat);
  closeBtn?.addEventListener('click', toggleChat);

  // Close with Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('active')) {
      toggleChat();
      launcher.focus();
    }
  });

  // Handle suggested prompts
  promptPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const text = pill.textContent.trim();
      if (input) {
        input.value = text;
        sendMessage();
      }
    });
  });

  // Handle message sending
  const sendMessage = async () => {
    if (!input) return;
    const userText = input.value.trim();
    if (!userText) return;

    // Render user message bubble
    appendMessage(userText, 'user');
    input.value = '';

    // Show typing indicator
    const typingIndicator = appendTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      typingIndicator.remove();

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      appendMessage(data.reply || "I'm Shanto's portfolio assistant. How can I help you?", 'bot');
    } catch (err) {
      console.warn('Chat API offline or placeholder response:', err);
      typingIndicator.remove();
      appendMessage(
        "I am Shanto Paul's personal portfolio assistant. The backend AI function is currently connecting. You can explore Shanto's projects and education across this site!",
        'bot',
        true
      );
    }
  };

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function appendMessage(text, sender, isFallback = false) {
    if (!chatBody) return null;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble-${sender} ${isFallback ? 'chat-bubble-fallback' : ''}`;
    bubble.textContent = text;
    chatBody.appendChild(bubble);
    chatBody.scrollTop = chatBody.scrollHeight;
    return bubble;
  }

  function appendTypingIndicator() {
    const el = document.createElement('div');
    el.className = 'chat-bubble chat-bubble-bot typing-indicator';
    el.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    chatBody?.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }
}
