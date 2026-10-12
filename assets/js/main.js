/**
 * ============================================================================
 * MAIN.JS — APPLICATION ENTRY POINT & MODULE ORCHESTRATOR
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * ============================================================================
 */

import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAnimations, runTypewriter } from './animations.js';
import { initProjects } from './projects.js';
import { initContactForm } from './contact.js';
import { initChatbot } from './chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Shanto Paul Portfolio Application [Phase 2 Navigation & Hero Ready]');

  // Initialize Core Services
  initTheme();
  initNavigation();
  initAnimations();
  initProjects();
  initContactForm();
  initChatbot();

  // Hero Typewriter Subtitle Runner
  const typewriterEl = document.getElementById('hero-typewriter');
  if (typewriterEl) {
    runTypewriter(
      typewriterEl,
      [
        'Software Engineering Student @ DIU',
        'Full-Stack Web Developer',
        'AI & Desktop Systems Enthusiast',
        'Problem Solver & Tech Explorer'
      ],
      75,
      2200
    );
  }

  // Dynamic Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
