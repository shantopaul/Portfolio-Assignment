/**
 * ============================================================================
 * CHATBOT.JS — AI CONVERSATIONAL ASSISTANT CONTROLLER & STATE MACHINE
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * Architecture: UI/UX Pro Max AI-Native Interface + Session State Machine
 * Standards: WCAG 2.1 AA Keyboard Access, Zero-Hallucination Guardrails
 * ============================================================================
 */

const STORAGE_KEY = 'sp_portfolio_chat_session';
const RATE_LIMIT_MS = 1000;

// State Machine Store
const chatState = {
  isOpen: false,
  isTyping: false,
  lastSentTimestamp: 0,
  messages: [],
  knowledgeBase: null
};

/**
 * Initializes the AI Chatbot component and binds event handlers.
 */
export async function initChatbot() {
  const launcher = document.querySelector('.chat-launcher');
  const panel = document.querySelector('.chat-panel');
  const closeBtn = document.querySelector('.chat-close-btn');
  const clearBtn = document.querySelector('.chat-clear-btn');
  const chatBody = document.querySelector('.chat-body');
  const input = document.querySelector('.chat-input');
  const sendBtn = document.querySelector('.chat-send-btn');
  const promptPills = document.querySelectorAll('.prompt-pill');

  if (!launcher || !panel) return;

  // 1. Preload local verified knowledge base for intelligent fallback
  loadVerifiedKnowledge();

  // 2. Restore session history if present
  restoreChatSession(chatBody);

  // 3. Open / Close Toggle Controller
  const openChat = () => {
    chatState.isOpen = true;
    panel.classList.add('active');
    launcher.setAttribute('aria-expanded', 'true');
    // Focus input on desktop; avoid forced virtual keyboard occlusion on mobile
    if (window.innerWidth >= 768) {
      setTimeout(() => input?.focus(), 150);
    }
  };

  const closeChat = () => {
    chatState.isOpen = false;
    panel.classList.remove('active');
    launcher.setAttribute('aria-expanded', 'false');
  };

  const toggleChat = () => {
    if (panel.classList.contains('active')) {
      closeChat();
    } else {
      openChat();
    }
  };

  launcher.addEventListener('click', toggleChat);
  closeBtn?.addEventListener('click', closeChat);

  // External launcher triggers (Hero CTA, Tile CTA, etc.)
  document.querySelectorAll('[data-action="open-chatbot"]').forEach((trigger) => {
    trigger.addEventListener('click', openChat);
  });

  // 4. Keyboard Shortcuts: Escape to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('active')) {
      closeChat();
      launcher.focus();
    }
  });

  // 5. Restart Conversation Handler
  clearBtn?.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEY);
    chatState.messages = [];
    if (chatBody) {
      chatBody.innerHTML = `
        <div class="chat-bubble chat-bubble-bot">
          Hi! I'm Shanto Paul's personal portfolio AI assistant. Ask me anything about Shanto's studies at DIU, technical competencies, or featured projects!
          <span class="chat-msg-time">${formatTime(new Date())}</span>
        </div>
      `;
    }
  });

  // 6. Handle Suggested Prompts (Single-tap dispatch)
  promptPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const promptText = pill.getAttribute('data-prompt') || pill.textContent.trim();
      if (input) {
        input.value = promptText;
        dispatchUserMessage();
      }
    });
  });

  // 7. Message Dispatch Controller
  const dispatchUserMessage = async () => {
    if (!input || chatState.isTyping) return;

    const userText = input.value.trim();
    if (!userText) return;

    // Rate Limiting Debounce
    const now = Date.now();
    if (now - chatState.lastSentTimestamp < RATE_LIMIT_MS) {
      return;
    }
    chatState.lastSentTimestamp = now;

    // Append User Message to UI & State
    appendMessage(chatBody, userText, 'user');
    chatState.messages.push({ role: 'user', content: userText, timestamp: now });
    persistSession();

    input.value = '';
    input.focus();

    // Set UI Typing State
    chatState.isTyping = true;
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
    }
    const typingIndicatorEl = appendTypingIndicator(chatBody);

    try {
      // Dispatch to Netlify Serverless Backend with conversation history
      const assistantReply = await queryAssistant(userText, chatState.messages);
      typingIndicatorEl.remove();

      appendMessage(chatBody, assistantReply, 'bot');
      chatState.messages.push({ role: 'assistant', content: assistantReply, timestamp: Date.now() });
      persistSession();
    } catch (err) {
      console.warn('Backend serverless unreachable or offline. Falling back to local verified knowledge engine:', err);
      typingIndicatorEl.remove();

      const fallbackReply = generateVerifiedLocalAnswer(userText, chatState.knowledgeBase);
      appendMessage(chatBody, fallbackReply, 'bot');
      chatState.messages.push({ role: 'assistant', content: fallbackReply, timestamp: Date.now() });
      persistSession();
    } finally {
      chatState.isTyping = false;
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
      }
    }
  };

  sendBtn?.addEventListener('click', dispatchUserMessage);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      dispatchUserMessage();
    }
  });
}

/**
 * Loads verified JSON files for client knowledge fallback.
 */
async function loadVerifiedKnowledge() {
  try {
    const [infoRes, skillsRes, projRes] = await Promise.all([
      fetch('assets/data/personal-info.json'),
      fetch('assets/data/skills.json'),
      fetch('assets/data/projects.json')
    ]);

    if (infoRes.ok && skillsRes.ok && projRes.ok) {
      const [personalInfo, skills, projects] = await Promise.all([
        infoRes.json(),
        skillsRes.json(),
        projRes.json()
      ]);
      chatState.knowledgeBase = { personalInfo, skills, projects };
      console.log('🤖 Chatbot verified local knowledge base initialized.');
    }
  } catch (err) {
    console.warn('Notice: Local JSON files preloaded with baseline defaults.', err);
  }
}

/**
 * Queries the Netlify Serverless chat endpoint with conversation history and fallback retry.
 * @param {string} message
 * @param {Array} history
 * @returns {Promise<string>}
 */
async function queryAssistant(message, history = []) {
  const endpoints = ['/api/chat', '/.netlify/functions/chat'];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: history.slice(-6)
        })
      });

      // If rewrite didn't catch /api/chat, attempt direct netlify function endpoint
      if (response.status === 404 && endpoint === '/api/chat') {
        continue;
      }

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        if (data.error && data.error.includes('maximum 10 requests per minute')) {
          return data.error;
        }
        // Any upstream API quota error falls back transparently to Basic Dataset
        throw new Error('Upstream quota limit reached; switching to local Basic Dataset engine');
      }

      if (response.status === 400) {
        const data = await response.json().catch(() => ({}));
        return data.error || 'Please enter a valid message (1–500 characters).';
      }

      if (!response.ok) {
        throw new Error(`Chat API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.reply) {
        throw new Error('Invalid response structure from chat server');
      }

      return data.reply;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Network error connecting to chat service');
}

/**
 * Generates verified client-side responses strictly bounded to the Basic Dataset JSON files
 * whenever the serverless backend or Gemini API key is unavailable.
 * @param {string} query
 * @param {object} kb
 * @returns {string}
 */
function generateVerifiedLocalAnswer(query, kb) {
  const q = query.toLowerCase();
  const info = kb?.personalInfo || {};
  const profile = info.profile || {};
  const education = Array.isArray(info.education) ? info.education : [];
  const experience = Array.isArray(info.experience) ? info.experience : [];
  const interests = Array.isArray(info.interests) ? info.interests : [];
  const contact = info.contact || {};
  const websites = info.websites || {};
  const socials = info.social_links || {};
  const skillCats = kb?.skills?.categories || [];
  const projectsList = kb?.projects?.projects || [];

  // 1. Prompt Injection / Out-of-bounds Defense
  if (
    q.includes('ignore') ||
    q.includes('act as') ||
    q.includes('bypass') ||
    q.includes('system prompt') ||
    q.includes('jailbreak') ||
    q.includes('developer mode')
  ) {
    return '🛡️ I am strictly bounded to Shanto Paul\'s verified academic and portfolio credentials. I cannot modify my system instructions or answer questions outside this scope.';
  }

  // 2. Private / Unlisted Personal Detail Defense
  if (
    q.includes('address') ||
    q.includes('salary') ||
    q.includes('phone') ||
    q.includes('relationship') ||
    q.includes('girlfriend') ||
    q.includes('money') ||
    q.includes('cgpa') ||
    q.includes('gpa')
  ) {
    return '🔒 I do not possess verified information regarding private personal details such as address, phone number, GPA, or salary. Please reach out to Shanto directly at **shanto@shantopaul.com** or via the contact form on this page.';
  }

  // 3. Generic Out-of-Bounds Queries
  if (
    q.includes('weather') ||
    q.includes('capital') ||
    q.includes('math') ||
    q.includes('homework') ||
    q.includes('recipe') ||
    q.includes('president') ||
    q.includes('movie') ||
    q.includes('joke')
  ) {
    return '⚠️ I am strictly bounded as Shanto Paul\'s portfolio assistant and only provide verified facts from his portfolio dataset (education at DIU, skills, projects, experience, and contact details).';
  }

  // 4. Official Website & Domain Inquiries
  if (q.includes('website') || q.includes('web') || q.includes('link') || q.includes('lonk') || q.includes('site') || q.includes('url') || q.includes('domain') || q.includes('github') || q.includes('linkedin')) {
    const official = websites.official_website || 'https://shantopaul.com';
    const assignment = websites.portfolio_assignment || 'https://portfolio-assignment.shantopaul.com';
    const github = socials.github || 'https://github.com/shantopaul';
    const linkedin = socials.linkedin || 'https://linkedin.com/in/shantopauldev';
    return `🌐 **Shanto Paul's Verified Web Links:**\n\n• **Official Website:** [shantopaul.com](${official})\n• **Portfolio Assignment (SE 236):** [portfolio-assignment.shantopaul.com](${assignment})\n• **GitHub Profile:** [github.com/shantopaul](${github})\n• **LinkedIn Profile:** [linkedin.com/in/shantopauldev](${linkedin})`;
  }

  // 5. Education & DIU / HSC / SSC Inquiries
  if (q.includes('diu') || q.includes('study') || q.includes('education') || q.includes('university') || q.includes('semester') || q.includes('daffodil') || q.includes('hsc') || q.includes('ssc') || q.includes('college') || q.includes('school') || q.includes('course') || q.includes('degree')) {
    if (education.length > 0) {
      const lines = education.map((edu) => {
        const standing = edu.current_standing ? ` (${edu.current_standing})` : edu.period ? ` (${edu.period})` : '';
        const courses = Array.isArray(edu.relevant_courses) && edu.relevant_courses.length > 0
          ? ` — Key subjects: ${edu.relevant_courses.slice(0, 3).join(', ')}`
          : '';
        return `• **${edu.degree}${standing}:** ${edu.institution}${courses}`;
      });
      return `🎓 **Academic Background:**\n\n${lines.join('\n')}`;
    }
    return '🎓 **Academic Background:**\n\n• **University:** B.Sc. in Software Engineering (6th Semester, Fall 2026) at **Daffodil International University (DIU)** — including **SE 236: Desktop & Web Programming Lab**, OOP, Data Structures & Algorithms, and DBMS.\n• **HSC (2020–2022):** Savar Govt College (Science Group)\n• **SSC (2018–2020):** Savar Adhar Chandra Government High School (Science Group)';
  }

  // 6. Technical Skills Inquiries
  if (q.includes('skill') || q.includes('language') || q.includes('tech') || q.includes('stack') || q.includes('javascript') || q.includes('python') || q.includes('html') || q.includes('css') || q.includes('java') || q.includes('c++') || q.includes('netlify') || q.includes('tool') || q.includes('frontend') || q.includes('backend')) {
    if (skillCats.length > 0) {
      const catLines = skillCats.map((cat) => {
        const names = (cat.skills || []).map((s) => s.name).join(', ');
        return `• **${cat.title}:** ${names}`;
      });
      return `💻 **Verified Technical Competencies:**\n\n${catLines.join('\n')}`;
    }
    return '💻 **Verified Technical Competencies:**\n\n• **Programming Languages:** JavaScript (ES6+), HTML5, CSS3, Python, C / C++, Java\n• **Frontend & UI:** Responsive Web Design, Bento Box Grid Architecture, DOM Events, WCAG 2.1 AA Accessibility\n• **Backend & Cloud:** Serverless Functions (Netlify), Node.js, RESTful JSON APIs\n• **Tools & AI:** Git & GitHub, VS Code, Google Gemini API, and Prompt Injection Defense.';
  }

  // 7. Projects Inquiries
  if (q.includes('project') || q.includes('portfolio') || q.includes('se 236') || q.includes('examalert') || q.includes('rentverse') || q.includes('demo') || q.includes('built')) {
    if (projectsList.length > 0) {
      const projLines = projectsList.map((p, i) => {
        const tags = Array.isArray(p.tags) ? ` [${p.tags.slice(0, 4).join(', ')}]` : '';
        return `${i + 1}. **${p.title}**${tags}: ${p.short_description}`;
      });
      return `🚀 **Featured Portfolio Projects:**\n\n${projLines.join('\n')}`;
    }
    return '🚀 **Featured Portfolio Projects:**\n\n1. **Personal Portfolio with Domain-Bounded AI Chatbot:** Built for SE 236 at DIU using vanilla HTML5/CSS3/ES6+, Bento Grid layout, and Netlify Serverless Functions connected to Google Gemini API.\n2. **SP ExamAlert:** Smart student exam and deadline notification application.\n3. **RentVerse:** University property and shared student housing discovery platform.';
  }

  // 8. Experience & Roles
  if (q.includes('experience') || q.includes('role') || q.includes('architect') || q.includes('lab') || q.includes('responsibility') || q.includes('responsibilities')) {
    if (experience.length > 0) {
      const expLines = experience.map((exp) => `• **${exp.role}** (${exp.organization}, ${exp.period}): ${exp.description}`);
      return `💼 **Verified Experience & Roles:**\n\n${expLines.join('\n')}`;
    }
    return '💼 **Experience:** Lead Architect & Developer for the **SE 236: Desktop & Web Programming Lab** portfolio project at DIU and Academic Software Lab Contributor across OOP, DSA, and DBMS.';
  }

  // 9. Contact, Email, Resume & Location Inquiries
  if (q.includes('contact') || q.includes('email') || q.includes('mail') || q.includes('hire') || q.includes('internship') || q.includes('location') || q.includes('dhaka') || q.includes('resume') || q.includes('cv') || q.includes('available') || q.includes('opportunity')) {
    const email = contact.email || 'shanto@shantopaul.com';
    const location = contact.location || profile.location || 'Dhaka, Bangladesh';
    const openTo = Array.isArray(contact.open_to) ? contact.open_to.join(', ') : 'Software Engineering internships and academic collaborations';
    return `📫 **Contact & Opportunities:**\n\n• **Email:** ${email}\n• **Location:** ${location}\n• **Open To:** ${openTo}\n• **Resume:** Available via the **Download Resume** button in the About section\n• **Profiles:** [GitHub](${socials.github || 'https://github.com/shantopaul'}) · [LinkedIn](${socials.linkedin || 'https://linkedin.com/in/shantopauldev'})`;
  }

  // 10. Profile / Bio / Basic Dataset Overview (always returns verified info)
  const name = profile.name || 'Shanto Paul';
  const title = profile.display_title || 'Software Engineering Student & Full-Stack Developer';
  const bio = profile.short_bio || 'Currently pursuing a B.Sc. in Software Engineering (6th Semester) at Daffodil International University (DIU).';
  const officialSite = websites.official_website || 'https://shantopaul.com';
  const email = contact.email || 'shanto@shantopaul.com';
  const interestText = interests.length > 0 ? `\n• **Focus Areas:** ${interests.join(', ')}` : '';

  return `👤 **${name} — Verified Portfolio Dataset Summary**\n\n• **Role:** ${title}\n• **Profile:** ${bio}${interestText}\n• **Education:** B.Sc. in Software Engineering at DIU (6th Semester) · HSC: Savar Govt College · SSC: Savar Adhar Chandra Government High School\n• **Official Website:** ${officialSite}\n• **Email:** ${email}\n\nFeel free to ask specifically about **skills**, **projects**, **education**, **experience**, or **contact details**!`;
}

/**
 * Formats markdown into safe semantic HTML.
 * @param {string} rawText
 * @returns {string}
 */
function formatMarkdown(rawText) {
  if (!rawText) return '';

  // 1. First escape HTML to defend against XSS
  let html = escapeHtml(rawText);

  // 2. Extract and preserve links via unique tokens
  const linkPlaceholders = [];

  // Markdown links: [label](url)
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, (match, label, url) => {
    const idx = linkPlaceholders.length;
    linkPlaceholders.push(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${label} <i class="fa-solid fa-arrow-up-right-from-square chat-link-icon" aria-hidden="true"></i></a>`);
    return `@@LINK_${idx}@@`;
  });

  // Standalone raw URLs: https://...
  html = html.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
    const trailing = url.slice(cleanUrl.length);
    const idx = linkPlaceholders.length;
    linkPlaceholders.push(`<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="chat-link">${cleanUrl} <i class="fa-solid fa-arrow-up-right-from-square chat-link-icon" aria-hidden="true"></i></a>` + trailing);
    return `@@LINK_${idx}@@`;
  });

  // 3. Bold text: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // 4. Italic text: *text* or _text_
  html = html.replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>');

  // 5. Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');

  // 6. Numbered lists: lines starting with numbers
  html = html.replace(/^[\s]*(\d+)\.\s+(.+)$/gm, '<li class="chat-ol-item"><span class="chat-num">$1.</span> $2</li>');
  html = html.replace(/((?:<li class="chat-ol-item">.*?<\/li>[\r\n\s]*)+)/g, '<ol class="chat-ol">$1</ol>');

  // 7. Bullet lists: lines starting with •, -, or *
  html = html.replace(/^[\s]*[•\-\*]\s+(.+)$/gm, '<li class="chat-list-item">$1</li>');
  html = html.replace(/((?:<li class="chat-list-item">.*?<\/li>[\r\n\s]*)+)/g, '<ul class="chat-list">$1</ul>');

  // 8. Clean trailing line breaks inside lists
  html = html.replace(/(?:<ol class="chat-ol">.*?<\/ol>|<ul class="chat-list">.*?<\/ul>)/gs, (match) => {
    return match.replace(/[\r\n]+/g, '');
  });

  html = html.replace(/\n\n+/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');

  // 9. Restore links
  html = html.replace(/@@LINK_(\d+)@@/g, (m, idx) => linkPlaceholders[Number(idx)]);

  return html;
}

/**
 * Appends a formatted message bubble to the chat container.
 * @param {HTMLElement} container
 * @param {string} text
 * @param {'user'|'bot'} sender
 */
function appendMessage(container, text, sender) {
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${sender}`;

  const formattedContent = sender === 'bot' ? formatMarkdown(text) : escapeHtml(text).replace(/\n/g, '<br>');

  bubble.innerHTML = `
    ${formattedContent}
    <span class="chat-msg-time">${formatTime(new Date())}</span>
  `;

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

/**
 * Appends animated 3-dot typing indicator.
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
function appendTypingIndicator(container) {
  const el = document.createElement('div');
  el.className = 'chat-bubble chat-bubble-bot typing-indicator';
  el.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  container?.appendChild(el);
  if (container) container.scrollTop = container.scrollHeight;
  return el;
}

/**
 * Restores conversation from sessionStorage.
 * @param {HTMLElement} container
 */
function restoreChatSession(container) {
  if (!container) return;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const savedMessages = JSON.parse(raw);
    if (Array.isArray(savedMessages) && savedMessages.length > 0) {
      chatState.messages = savedMessages;
      container.innerHTML = '';
      savedMessages.forEach((msg) => {
        appendMessage(container, msg.content, msg.role === 'user' ? 'user' : 'bot');
      });
    }
  } catch (err) {
    console.warn('Unable to load chat session from storage:', err);
  }
}

/**
 * Saves current conversation to sessionStorage.
 */
function persistSession() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chatState.messages.slice(-20)));
  } catch (err) {
    console.warn('Unable to persist chat session:', err);
  }
}

/**
 * Formats time to HH:MM AM/PM.
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Escapes HTML characters for security.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
