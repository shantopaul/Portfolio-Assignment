/**
 * ============================================================================
 * MAIN.JS — APPLICATION ENTRY POINT & MODULE ORCHESTRATOR
 * Project: Personal Portfolio Website — Shanto Paul (DIU)
 * Course: SE 236 — Desktop & Web Programming Lab
 * ============================================================================
 */

import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initProjects } from './projects.js';
import { initContactForm } from './contact.js';
import { initChatbot } from './chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Shanto Paul Portfolio Application [Phase 1 Foundation Ready]');

  // Initialize Core Services
  initTheme();
  initNavigation();
  initAnimations();
  initProjects();
  initContactForm();
  initChatbot();

  // Dynamic Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
