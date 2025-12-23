/**
 * TutorialEngine - Interactive tutorial system
 * Guides users through the application features
 */

import { tutorialSteps, getTutorialStepByIndex, getTotalSteps } from './steps.js';
import { Spotlight } from './spotlight.js';

export class TutorialEngine {
  constructor() {
    this.currentStepIndex = 0;
    this.isActive = false;
    this.spotlight = new Spotlight();
    this.tooltip = null;
    this.completedSteps = new Set();

    // Load progress
    this.loadProgress();
  }

  /**
   * Start tutorial
   * @param {number} startIndex - Starting step index
   */
  start(startIndex = 0) {
    this.currentStepIndex = startIndex;
    this.isActive = true;

    this.dispatchEvent('tutorial:start', { stepIndex: startIndex });

    this.showStep(this.currentStepIndex);
  }

  /**
   * Show tutorial step
   * @param {number} index - Step index
   */
  showStep(index) {
    const step = getTutorialStepByIndex(index);

    if (!step) {
      console.error('Tutorial step not found:', index);
      return;
    }

    this.currentStepIndex = index;

    // Remove previous highlight
    this.spotlight.removeHighlight();

    // Create or update tooltip
    this.showTooltip(step);

    // Highlight target element if specified
    if (step.target && step.highlight) {
      setTimeout(() => {
        this.spotlight.highlight(step.target, {
          padding: 8,
          allowClicks: step.action?.type === 'click',
        });
      }, 100);
    }

    // Dispatch step event
    this.dispatchEvent('tutorial:step', {
      stepIndex: index,
      step,
      progress: Math.round(((index + 1) / getTotalSteps()) * 100),
    });

    // Save progress
    this.saveProgress();
  }

  /**
   * Show tooltip
   * @param {Object} step - Tutorial step
   */
  showTooltip(step) {
    // Remove existing tooltip
    if (this.tooltip) {
      this.tooltip.remove();
    }

    // Create tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'tutorial-tooltip';
    this.tooltip.className = 'tutorial-tooltip';

    // Build tooltip content
    const progress = Math.round(((this.currentStepIndex + 1) / getTotalSteps()) * 100);

    this.tooltip.innerHTML = `
      <div class="tutorial-tooltip-header">
        <h3>${step.title}</h3>
        <button class="tutorial-close-btn" onclick="window.tutorial.skip()">✕</button>
      </div>
      <div class="tutorial-tooltip-body">
        <p>${step.description}</p>
      </div>
      <div class="tutorial-tooltip-footer">
        <div class="tutorial-progress">
          <div class="tutorial-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="tutorial-progress-text">${this.currentStepIndex + 1} / ${getTotalSteps()}</div>
        <div class="tutorial-buttons">
          ${this.renderButtons(step.buttons)}
        </div>
      </div>
    `;

    // Position tooltip
    this.positionTooltip(step);

    document.body.appendChild(this.tooltip);

    // Animate in
    setTimeout(() => {
      this.tooltip.classList.add('tutorial-tooltip-visible');
    }, 10);
  }

  /**
   * Render tooltip buttons
   * @param {Array} buttons - Button definitions
   * @returns {string} HTML string
   */
  renderButtons(buttons) {
    if (!buttons || buttons.length === 0) {
      return '<button class="tutorial-btn tutorial-btn-primary" onclick="window.tutorial.next()">Siguiente</button>';
    }

    return buttons
      .map(btn => {
        const className = btn.primary ? 'tutorial-btn tutorial-btn-primary' : 'tutorial-btn';
        const onclick = `window.tutorial.${btn.action}()`;
        return `<button class="${className}" onclick="${onclick}">${btn.text}</button>`;
      })
      .join('');
  }

  /**
   * Position tooltip
   * @param {Object} step - Tutorial step
   */
  positionTooltip(step) {
    if (!this.tooltip) return;

    const position = step.position || 'center';

    // Reset positioning
    this.tooltip.style.position = 'fixed';
    this.tooltip.style.top = '';
    this.tooltip.style.left = '';
    this.tooltip.style.right = '';
    this.tooltip.style.bottom = '';
    this.tooltip.style.transform = '';

    if (position === 'center') {
      this.tooltip.style.top = '50%';
      this.tooltip.style.left = '50%';
      this.tooltip.style.transform = 'translate(-50%, -50%)';
    } else if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();

        switch (position) {
          case 'top':
            this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
            this.tooltip.style.bottom = `${window.innerHeight - rect.top + 20}px`;
            this.tooltip.style.transform = 'translateX(-50%)';
            break;
          case 'bottom':
            this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
            this.tooltip.style.top = `${rect.bottom + 20}px`;
            this.tooltip.style.transform = 'translateX(-50%)';
            break;
          case 'left':
            this.tooltip.style.right = `${window.innerWidth - rect.left + 20}px`;
            this.tooltip.style.top = `${rect.top + rect.height / 2}px`;
            this.tooltip.style.transform = 'translateY(-50%)';
            break;
          case 'right':
            this.tooltip.style.left = `${rect.right + 20}px`;
            this.tooltip.style.top = `${rect.top + rect.height / 2}px`;
            this.tooltip.style.transform = 'translateY(-50%)';
            break;
        }
      }
    }
  }

  /**
   * Go to next step
   */
  next() {
    if (this.currentStepIndex < getTotalSteps() - 1) {
      this.completedSteps.add(this.currentStepIndex);
      this.showStep(this.currentStepIndex + 1);
    } else {
      this.complete();
    }
  }

  /**
   * Go to previous step
   */
  prev() {
    if (this.currentStepIndex > 0) {
      this.showStep(this.currentStepIndex - 1);
    }
  }

  /**
   * Skip tutorial
   */
  skip() {
    if (confirm('¿Estás seguro de que quieres saltar el tutorial?')) {
      this.stop();
      this.dispatchEvent('tutorial:skipped', { stepIndex: this.currentStepIndex });
    }
  }

  /**
   * Complete tutorial
   */
  complete() {
    this.completedSteps.add(this.currentStepIndex);
    this.stop();

    this.dispatchEvent('tutorial:complete', {
      completedSteps: Array.from(this.completedSteps),
      totalSteps: getTotalSteps(),
    });

    // Mark tutorial as completed
    localStorage.setItem('tutorial_completed', 'true');

    // Show completion message
    this.showCompletionMessage();
  }

  /**
   * Stop tutorial
   */
  stop() {
    this.isActive = false;

    // Remove tooltip
    if (this.tooltip) {
      this.tooltip.classList.remove('tutorial-tooltip-visible');
      setTimeout(() => {
        if (this.tooltip && this.tooltip.parentNode) {
          this.tooltip.parentNode.removeChild(this.tooltip);
        }
        this.tooltip = null;
      }, 300);
    }

    // Remove spotlight
    this.spotlight.removeHighlight();

    this.saveProgress();
  }

  /**
   * Reset tutorial
   */
  reset() {
    this.currentStepIndex = 0;
    this.completedSteps.clear();
    localStorage.removeItem('tutorial_progress');
    localStorage.removeItem('tutorial_completed');

    this.dispatchEvent('tutorial:reset');
  }

  /**
   * Check if tutorial is completed
   * @returns {boolean} Completion status
   */
  isCompleted() {
    return localStorage.getItem('tutorial_completed') === 'true';
  }

  /**
   * Show completion message
   */
  showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'tutorial-completion-message';
    message.innerHTML = `
      <div class="tutorial-completion-content">
        <div class="tutorial-completion-icon">🎉</div>
        <h2>¡Tutorial Completado!</h2>
        <p>Ya conoces todas las funciones básicas del editor.</p>
        <p>¡Ahora puedes crear páginas increíbles!</p>
        <button class="tutorial-btn tutorial-btn-primary" onclick="this.parentElement.parentElement.remove()">
          ¡Empezar a Crear!
        </button>
      </div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.classList.add('tutorial-completion-visible');
    }, 10);
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    const progress = {
      currentStepIndex: this.currentStepIndex,
      completedSteps: Array.from(this.completedSteps),
      timestamp: Date.now(),
    };

    localStorage.setItem('tutorial_progress', JSON.stringify(progress));
  }

  /**
   * Load progress from localStorage
   */
  loadProgress() {
    try {
      const data = localStorage.getItem('tutorial_progress');
      if (data) {
        const progress = JSON.parse(data);
        this.currentStepIndex = progress.currentStepIndex || 0;
        this.completedSteps = new Set(progress.completedSteps || []);
      }
    } catch (error) {
      console.error('Error loading tutorial progress:', error);
    }
  }

  /**
   * Dispatch custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event detail
   */
  dispatchEvent(eventName, detail = {}) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.tutorial = new TutorialEngine();
}

export default TutorialEngine;
