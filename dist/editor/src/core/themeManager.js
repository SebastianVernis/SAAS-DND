/**
 * ThemeManager - Gestiona tema oscuro/claro del editor
 * @module ThemeManager
 */
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.storageKey = 'dragndrop_theme';
    this.init();
  }

  /**
   * Inicializa el gestor de temas
   */
  init() {
    this.loadTheme();
    this.setupToggle();
    this.setupKeyboardShortcut();
    this.watchSystemPreference();
  }

  /**
   * Carga tema guardado o detecta preferencia del sistema
   */
  loadTheme() {
    const saved = localStorage.getItem(this.storageKey);

    if (saved) {
      this.currentTheme = saved;
    } else {
      this.currentTheme = this.detectPreference();
    }

    this.applyTheme(this.currentTheme);
  }

  /**
   * Detecta preferencia de tema del sistema operativo
   * @returns {string} 'dark' o 'light'
   */
  detectPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Observa cambios en preferencia del sistema
   */
  watchSystemPreference() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery.addEventListener('change', e => {
        // Solo aplicar si el usuario no ha configurado manualmente
        if (!localStorage.getItem(this.storageKey)) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(this.currentTheme);
        }
      });
    }
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  toggle() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    this.saveTheme();

    if (window.showToast) {
      window.showToast(`Tema ${this.currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
    }
  }

  /**
   * Aplica el tema al documento
   * @param {string} theme - 'light' o 'dark'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateUI(theme);
  }

  /**
   * Guarda tema en localStorage
   */
  saveTheme() {
    localStorage.setItem(this.storageKey, this.currentTheme);
  }

  /**
   * Actualiza UI del botón de toggle
   * @param {string} theme - Tema actual
   */
  updateUI(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
      btn.setAttribute('aria-label', `Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`);
      btn.classList.toggle('active', theme === 'dark');
    }
  }

  /**
   * Configura el botón de toggle
   */
  setupToggle() {
    // Event listener ya está en HTML con onclick
    // Este método puede usarse para setup adicional si necesario
  }

  /**
   * Configura atajo de teclado Ctrl+Shift+D
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', e => {
      // Ctrl+Shift+D o Cmd+Shift+D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Obtiene el tema actual
   * @returns {string} Tema actual ('light' o 'dark')
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Establece tema específico
   * @param {string} theme - 'light' o 'dark'
   */
  setTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.saveTheme();
    }
  }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}

// Exportar globalmente
window.ThemeManager = ThemeManager;
