/**
 * Gemini Syntax Validator - v1.0
 *
 * Valida sintaxis de elementos HTML/CSS en tiempo real usando Gemini API.
 * Optimizado para economizar tokens usando gemini-2.0-flash-lite.
 */

class GeminiSyntaxValidator {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
    this.validationQueue = new Map();
    this.debounceTimeout = null;
    this.debounceDelay = 1500; // 1.5s para evitar llamadas excesivas
    this.maxRetries = 2;
    this.enabled = false;

    this.loadApiKey();
  }

  /**
   * Carga la API key desde localStorage
   */
  loadApiKey() {
    this.apiKey = localStorage.getItem('gemini_api_key');
    this.enabled = !!this.apiKey;
  }

  /**
   * Configura la API key
   */
  setApiKey(key) {
    if (!key || key.trim() === '') {
      throw new Error('API key inválida');
    }

    this.apiKey = key.trim();
    localStorage.setItem('gemini_api_key', this.apiKey);
    this.enabled = true;

    console.log('✅ Gemini API key configurada');
  }

  /**
   * Elimina la API key
   */
  removeApiKey() {
    this.apiKey = null;
    this.enabled = false;
    localStorage.removeItem('gemini_api_key');
    console.log('🗑️ Gemini API key eliminada');
  }

  /**
   * Valida si el servicio está habilitado
   */
  isEnabled() {
    return this.enabled && this.apiKey !== null;
  }

  /**
   * Construye el prompt optimizado para corrección sintáctica
   */
  buildPrompt(element, context) {
    const tagName = element.tagName.toLowerCase();
    const elementHTML = element.outerHTML;
    const styles = element.style.cssText;

    // Prompt ultra-conciso para economizar tokens
    return `Fix HTML/CSS syntax only. Return valid code.

Element: <${tagName}>
HTML: ${elementHTML.substring(0, 500)}
Styles: ${styles}
Parent: ${context.parent || 'body'}

Rules:
- Fix syntax errors only
- Keep semantic structure
- Validate CSS properties
- No explanations
- Return only corrected HTML+inline CSS`;
  }

  /**
   * Valida elemento con debounce
   */
  async validateElement(element, context = {}) {
    if (!this.isEnabled()) {
      console.warn('⚠️ Gemini validator no está habilitado');
      return null;
    }

    const elementId = element.id || `temp-${Date.now()}`;

    // Limpiar timeout anterior
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Agregar a la cola
    this.validationQueue.set(elementId, { element, context });

    // Esperar debounce
    return new Promise(resolve => {
      this.debounceTimeout = setTimeout(async () => {
        const results = await this.processBatch();
        resolve(results.get(elementId));
      }, this.debounceDelay);
    });
  }

  /**
   * Procesa batch de validaciones
   */
  async processBatch() {
    if (this.validationQueue.size === 0) {
      return new Map();
    }

    const results = new Map();
    const entries = Array.from(this.validationQueue.entries());

    // Procesar de a uno para mantener contexto preciso
    for (const [id, { element, context }] of entries) {
      try {
        const result = await this.callGeminiAPI(element, context);
        results.set(id, result);
      } catch (error) {
        console.error(`Error validando elemento ${id}:`, error);
        results.set(id, { success: false, error: error.message });
      }
    }

    this.validationQueue.clear();
    return results;
  }

  /**
   * Llama a la API de Gemini
   */
  async callGeminiAPI(element, context, retryCount = 0) {
    const prompt = this.buildPrompt(element, context);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1, // Muy bajo para respuestas deterministas
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 512, // Límite bajo para economizar
        stopSequences: [],
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // Extraer respuesta
      const correctedCode = this.extractCorrectedCode(data);

      return {
        success: true,
        original: element.outerHTML,
        corrected: correctedCode,
        hasChanges: element.outerHTML.trim() !== correctedCode.trim(),
        timestamp: Date.now(),
      };
    } catch (error) {
      // Retry logic
      if (retryCount < this.maxRetries && error.message.includes('429')) {
        console.log(
          `⏳ Rate limit alcanzado, reintentando... (${retryCount + 1}/${this.maxRetries})`
        );
        await this.sleep(2000 * (retryCount + 1)); // Backoff exponencial
        return this.callGeminiAPI(element, context, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Extrae código corregido de la respuesta de Gemini
   */
  extractCorrectedCode(apiResponse) {
    try {
      const candidates = apiResponse.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const content = candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error('No content in response');
      }

      let text = content.parts[0].text.trim();

      // Limpiar markdown code blocks si existen
      text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

      return text;
    } catch (error) {
      console.error('Error extrayendo código corregido:', error);
      throw new Error('No se pudo extraer el código corregido de la respuesta');
    }
  }

  /**
   * Aplica corrección sugerida a un elemento
   */
  applyCorrection(element, correctionResult) {
    if (!correctionResult.success || !correctionResult.hasChanges) {
      return false;
    }

    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = correctionResult.corrected;

      const correctedElement = tempDiv.firstElementChild;
      if (!correctedElement) {
        throw new Error('No se pudo parsear el elemento corregido');
      }

      // Preservar ID y clases del editor
      correctedElement.id = element.id;
      correctedElement.classList.add('canvas-element');
      if (element.classList.contains('selected')) {
        correctedElement.classList.add('selected');
      }

      // Reemplazar elemento
      element.parentNode.replaceChild(correctedElement, element);

      console.log('✅ Corrección aplicada:', correctedElement.outerHTML.substring(0, 100));
      return true;
    } catch (error) {
      console.error('Error aplicando corrección:', error);
      return false;
    }
  }

  /**
   * Muestra sugerencias de corrección en UI
   */
  showCorrectionSuggestion(element, correctionResult) {
    if (!correctionResult.success || !correctionResult.hasChanges) {
      return;
    }

    // Crear badge de sugerencia
    const existingBadge = element.querySelector('.syntax-suggestion-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    const badge = document.createElement('div');
    badge.className = 'syntax-suggestion-badge';
    badge.innerHTML = `
            <span class="badge-icon">💡</span>
            <span class="badge-text">Mejora disponible</span>
            <button class="badge-apply-btn" data-action="apply">Aplicar</button>
            <button class="badge-dismiss-btn" data-action="dismiss">×</button>
        `;

    // Eventos
    badge.querySelector('[data-action="apply"]').addEventListener('click', e => {
      e.stopPropagation();
      this.applyCorrection(element, correctionResult);
      badge.remove();
      if (window.showToast) {
        window.showToast('✅ Corrección aplicada');
      }
    });

    badge.querySelector('[data-action="dismiss"]').addEventListener('click', e => {
      e.stopPropagation();
      badge.remove();
    });

    element.appendChild(badge);
  }

  /**
   * Muestra modal de configuración
   */
  showConfigModal() {
    const modal = document.createElement('div');
    modal.className = 'gemini-config-modal';
    modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ Configuración Gemini API</h3>
                    <button class="modal-close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="config-info">
                        <p>Para habilitar la validación sintáctica automática, necesitas una API key de Google Gemini.</p>
                        <p><strong>Modelo usado:</strong> gemini-2.0-flash-lite (optimizado para bajo costo)</p>
                        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener">
                            🔗 Obtener API Key gratuita
                        </a>
                    </div>
                    
                    <div class="form-group">
                        <label for="gemini-api-key-input">API Key</label>
                        <input 
                            type="password" 
                            id="gemini-api-key-input" 
                            placeholder="AIza..." 
                            value="${this.apiKey || ''}"
                        >
                    </div>
                    
                    <div class="config-status">
                        ${
                          this.isEnabled()
                            ? '<span class="status-enabled">✅ Habilitado</span>'
                            : '<span class="status-disabled">⚠️ Deshabilitado</span>'
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                    ${
                      this.isEnabled()
                        ? '<button class="btn btn-danger" data-action="remove">Eliminar Key</button>'
                        : ''
                    }
                    <button class="btn btn-primary" data-action="save">Guardar</button>
                </div>
            </div>
        `;

    // Eventos
    const closeModal = () => modal.remove();

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    modal.querySelector('[data-action="cancel"]').addEventListener('click', closeModal);

    modal.querySelector('[data-action="save"]').addEventListener('click', () => {
      const input = modal.querySelector('#gemini-api-key-input');
      const key = input.value.trim();

      if (key) {
        try {
          this.setApiKey(key);
          if (window.showToast) {
            window.showToast('✅ API Key guardada correctamente');
          }
          closeModal();
        } catch (error) {
          alert(error.message);
        }
      } else {
        alert('Por favor ingresa una API key válida');
      }
    });

    const removeBtn = modal.querySelector('[data-action="remove"]');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que deseas eliminar la API key?')) {
          this.removeApiKey();
          if (window.showToast) {
            window.showToast('🗑️ API Key eliminada');
          }
          closeModal();
        }
      });
    }

    document.body.appendChild(modal);
  }

  /**
   * Utilidad para esperar
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Estilos para el validador
const validatorStyles = document.createElement('style');
validatorStyles.textContent = `
    /* Badge de sugerencia */
    .syntax-suggestion-badge {
        position: absolute;
        top: -35px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        z-index: 1000;
        animation: suggestBounce 0.5s ease;
        white-space: nowrap;
    }

    @keyframes suggestBounce {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-5px); }
    }

    .syntax-suggestion-badge .badge-icon {
        font-size: 14px;
    }

    .syntax-suggestion-badge .badge-text {
        font-weight: 500;
    }

    .syntax-suggestion-badge button {
        padding: 4px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        transition: all 0.2s;
    }

    .badge-apply-btn {
        background: white;
        color: #667eea;
    }

    .badge-apply-btn:hover {
        background: #f0f0f0;
    }

    .badge-dismiss-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        width: 20px;
        height: 20px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .badge-dismiss-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    /* Modal de configuración */
    .gemini-config-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .gemini-config-modal .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
    }

    .gemini-config-modal .modal-content {
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        position: relative;
        z-index: 10;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
    }

    .gemini-config-modal .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .gemini-config-modal .modal-header h3 {
        margin: 0;
        font-size: 18px;
        color: #1e293b;
    }

    .gemini-config-modal .modal-close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #64748b;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .gemini-config-modal .modal-body {
        padding: 24px;
    }

    .gemini-config-modal .config-info {
        background: #f8fafc;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .gemini-config-modal .config-info p {
        margin: 0 0 10px 0;
        color: #475569;
        font-size: 14px;
        line-height: 1.6;
    }

    .gemini-config-modal .config-info p:last-child {
        margin-bottom: 0;
    }

    .gemini-config-modal .config-info a {
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
        display: inline-block;
        margin-top: 8px;
    }

    .gemini-config-modal .config-info a:hover {
        text-decoration: underline;
    }

    .gemini-config-modal .form-group {
        margin-bottom: 20px;
    }

    .gemini-config-modal .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #1e293b;
        font-size: 14px;
    }

    .gemini-config-modal .form-group input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 14px;
        font-family: monospace;
    }

    .gemini-config-modal .form-group input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .gemini-config-modal .config-status {
        text-align: center;
        padding: 12px;
        border-radius: 6px;
        background: #f8fafc;
    }

    .gemini-config-modal .status-enabled {
        color: #10b981;
        font-weight: 600;
    }

    .gemini-config-modal .status-disabled {
        color: #f59e0b;
        font-weight: 600;
    }

    .gemini-config-modal .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .gemini-config-modal .btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 14px;
        transition: all 0.2s;
    }

    .gemini-config-modal .btn-primary {
        background: #2563eb;
        color: white;
    }

    .gemini-config-modal .btn-primary:hover {
        background: #1d4ed8;
    }

    .gemini-config-modal .btn-secondary {
        background: #f1f5f9;
        color: #475569;
    }

    .gemini-config-modal .btn-secondary:hover {
        background: #e2e8f0;
    }

    .gemini-config-modal .btn-danger {
        background: #ef4444;
        color: white;
    }

    .gemini-config-modal .btn-danger:hover {
        background: #dc2626;
    }
`;

document.head.appendChild(validatorStyles);

// Exportar globalmente
window.GeminiSyntaxValidator = GeminiSyntaxValidator;

export default GeminiSyntaxValidator;
