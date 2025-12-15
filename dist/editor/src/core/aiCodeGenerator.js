/**
 * AICodeGenerator - Traduce diseño visual a código usando Blackbox AI
 * @module AICodeGenerator
 */
class AICodeGenerator {
  constructor() {
    this.apiKey = null;
    this.endpoint = 'https://api.blackbox.ai/v1/chat/completions';
    this.model = 'blackbox'; // o 'claude-3-sonnet' cuando esté disponible
    this.isConfigured = false;
    this.maxTokens = 4000;
    this.temperature = 0.7;

    this.init();
  }

  /**
   * Inicializa el generador
   */
  init() {
    this.loadApiKey();
    this.setupUI();
  }

  /**
   * Carga API key desde localStorage
   */
  loadApiKey() {
    const stored = localStorage.getItem('dragndrop_blackbox_api_key');
    if (stored) {
      this.apiKey = stored;
      this.isConfigured = true;
    }
  }

  /**
   * Guarda API key
   * @param {string} apiKey - API key de Blackbox
   */
  saveApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('dragndrop_blackbox_api_key', apiKey);
    this.isConfigured = true;

    if (window.showToast) {
      window.showToast('API Key guardada correctamente');
    }
  }

  /**
   * Configura UI para AI features
   */
  setupUI() {
    // UI se agregará en index.html
  }

  /**
   * Genera código HTML desde descripción en lenguaje natural
   * @param {string} description - Descripción del componente/página
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Código generado
   */
  async generateFromDescription(description, options = {}) {
    if (!this.isConfigured) {
      throw new Error('API Key no configurada. Configure primero en Settings.');
    }

    const prompt = this.buildPrompt(description, options);

    try {
      const response = await this.callBlackboxAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generando código:', error);
      throw error;
    }
  }

  /**
   * Genera código desde screenshot/imagen del canvas
   * @param {string} imageData - Base64 image data
   * @param {Object} options - Opciones
   * @returns {Promise<Object>} Código generado
   */
  async generateFromImage(imageData, options = {}) {
    if (!this.isConfigured) {
      throw new Error('API Key no configurada');
    }

    const prompt = this.buildImagePrompt(imageData, options);

    try {
      const response = await this.callBlackboxAPI(prompt, { includeImage: true, imageData });
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generando desde imagen:', error);
      throw error;
    }
  }

  /**
   * Mejora código existente
   * @param {string} code - Código HTML actual
   * @param {string} instruction - Qué mejorar
   * @returns {Promise<Object>} Código mejorado
   */
  async improveCode(code, instruction) {
    if (!this.isConfigured) {
      throw new Error('API Key no configurada');
    }

    const prompt = `Mejora este código HTML/CSS siguiendo esta instrucción: "${instruction}"

Código actual:
\`\`\`html
${code}
\`\`\`

Retorna el código mejorado manteniendo la estructura general pero aplicando la mejora solicitada.
Solo retorna el código, sin explicaciones.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error mejorando código:', error);
      throw error;
    }
  }

  /**
   * Genera componente desde descripción
   * @param {string} description - Descripción del componente
   * @param {string} type - Tipo de componente (navbar, hero, card, etc)
   * @returns {Promise<Object>} Componente generado
   */
  async generateComponent(description, type = 'custom') {
    const prompt = `Genera un componente ${type} en HTML/CSS vanilla basado en esta descripción:

"${description}"

Requisitos:
- HTML semántico y limpio
- CSS inline (styles en atributos style)
- Responsive (usar flexbox/grid)
- Accesible (ARIA labels apropiados)
- Sin frameworks (vanilla JavaScript si necesario)
- Colores modernos y profesionales
- No usar clases externas (todo inline)

Retorna solo el código HTML del componente, listo para insertar en el editor.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      const parsed = this.parseResponse(response);

      return {
        type: type,
        html: parsed.code,
        description: description,
        generated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generando componente:', error);
      throw error;
    }
  }

  /**
   * Construye prompt optimizado para Blackbox
   * @param {string} description - Descripción del usuario
   * @param {Object} options - Opciones
   * @returns {string} Prompt construido
   */
  buildPrompt(description, options = {}) {
    const {
      framework = 'vanilla',
      responsive = true,
      accessibility = true,
      includeJS = false,
      style = 'modern',
    } = options;

    return `Genera código HTML/CSS profesional para:

"${description}"

Especificaciones:
- Framework: ${framework} (no usar librerías externas)
- Responsive: ${responsive ? 'Sí - usar flexbox/grid' : 'No requerido'}
- Accesibilidad: ${accessibility ? 'WCAG 2.1 AA compliant' : 'Básica'}
- JavaScript: ${includeJS ? 'Incluir si es necesario' : 'Solo HTML/CSS'}
- Estilo: ${style} (clean, profesional)

Formato de respuesta:
\`\`\`html
[Tu código aquí]
\`\`\`

\`\`\`css
[CSS separado si aplica]
\`\`\`

\`\`\`javascript
[JavaScript si aplica]
\`\`\`

Genera código production-ready, limpio y bien estructurado.`;
  }

  /**
   * Construye prompt para análisis de imagen
   * @param {string} imageData - Base64 image
   * @param {Object} options - Opciones
   * @returns {string} Prompt
   */
  buildImagePrompt(imageData, options = {}) {
    return `Analiza esta imagen de diseño web y genera el código HTML/CSS exacto para replicarla.

Imagen adjunta: [imagen en base64]

Instrucciones:
- Replica la estructura visual exactamente
- Usa colores similares (extráelos de la imagen)
- Mantén proporciones y espaciado
- HTML semántico
- CSS inline o en <style>
- Responsive
- Sin frameworks

Retorna el código completo listo para usar.`;
  }

  /**
   * Llama a Blackbox AI API
   * @param {string} prompt - Prompt a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta de la API
   */
  async callBlackboxAPI(prompt, options = {}) {
    const requestBody = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'Eres un experto en desarrollo web. Generas código HTML, CSS y JavaScript limpio, semántico y production-ready. Siempre sigues best practices y estándares web modernos.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: false,
    };

    // Si incluye imagen, agregar al mensaje
    if (options.includeImage && options.imageData) {
      requestBody.messages[1].content = [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: options.imageData,
          },
        },
      ];
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Blackbox API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
      );
    }

    return await response.json();
  }

  /**
   * Parsea respuesta de Blackbox API
   * @param {Object} response - Respuesta de API
   * @returns {Object} Código parseado
   */
  parseResponse(response) {
    const content = response.choices?.[0]?.message?.content || '';

    // Extraer bloques de código
    const htmlMatch = content.match(/```html\n([\s\S]*?)```/);
    const cssMatch = content.match(/```css\n([\s\S]*?)```/);
    const jsMatch = content.match(/```javascript\n([\s\S]*?)```/);

    return {
      html: htmlMatch ? htmlMatch[1].trim() : content.trim(),
      css: cssMatch ? cssMatch[1].trim() : null,
      js: jsMatch ? jsMatch[1].trim() : null,
      raw: content,
    };
  }

  /**
   * Genera código desde elemento seleccionado en canvas
   * @param {HTMLElement} element - Elemento del canvas
   * @param {string} instruction - Qué hacer con el elemento
   * @returns {Promise<Object>} Código generado
   */
  async modifyElement(element, instruction) {
    const currentHTML = element.outerHTML;

    const prompt = `Modifica este elemento HTML según la instrucción:

Instrucción: "${instruction}"

HTML actual:
\`\`\`html
${currentHTML}
\`\`\`

Retorna el HTML modificado manteniendo la estructura general.
Solo el código, sin explicaciones.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error modificando elemento:', error);
      throw error;
    }
  }

  /**
   * Genera página completa desde descripción
   * @param {string} description - Descripción de la página
   * @param {string} pageType - Tipo de página (landing, blog, portfolio, etc)
   * @returns {Promise<Object>} Página generada
   */
  async generateFullPage(description, pageType = 'landing') {
    const prompt = `Genera una página web completa tipo "${pageType}" basada en:

"${description}"

Requisitos:
- HTML5 semántico completo
- CSS moderno (Flexbox/Grid)
- Responsive (mobile-first)
- Secciones típicas de ${pageType}:
  ${this.getTypicalSections(pageType)}
- Colores profesionales y modernos
- Tipografía clara y legible
- CTAs claros
- Optimizado para SEO
- Accesible (WCAG 2.1 AA)

Formato de respuesta:
\`\`\`html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Título apropiado]</title>
    <style>
        [CSS aquí]
    </style>
</head>
<body>
    [Contenido aquí]
</body>
</html>
\`\`\`

Genera código production-ready.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error generando página:', error);
      throw error;
    }
  }

  /**
   * Obtiene secciones típicas por tipo de página
   * @param {string} pageType - Tipo de página
   * @returns {string} Descripción de secciones
   */
  getTypicalSections(pageType) {
    const sections = {
      landing:
        '- Hero con CTA\n  - Features (3-6 items)\n  - Social proof\n  - CTA final\n  - Footer',
      blog: '- Header con navegación\n  - Hero article\n  - Artículos recientes\n  - Sidebar\n  - Footer',
      portfolio: '- Hero personal\n  - Proyectos destacados\n  - Skills\n  - Contacto\n  - Footer',
      ecommerce:
        '- Header con carrito\n  - Hero/Banner\n  - Productos destacados\n  - Categorías\n  - Footer',
      saas: '- Navbar\n  - Hero con demo\n  - Features\n  - Pricing\n  - Testimonials\n  - CTA\n  - Footer',
    };

    return sections[pageType] || sections['landing'];
  }

  /**
   * Optimiza código generado
   * @param {Object} code - Código generado {html, css, js}
   * @returns {Promise<Object>} Código optimizado
   */
  async optimizeCode(code) {
    const prompt = `Optimiza este código para performance y best practices:

HTML:
\`\`\`html
${code.html}
\`\`\`

${code.css ? `CSS:\n\`\`\`css\n${code.css}\n\`\`\`` : ''}

${code.js ? `JavaScript:\n\`\`\`javascript\n${code.js}\n\`\`\`` : ''}

Optimizaciones a aplicar:
- Minificar espacios innecesarios
- Mejorar semántica HTML
- Optimizar selectores CSS
- Reducir redundancia
- Mejorar accesibilidad
- SEO optimization

Retorna el código optimizado en el mismo formato.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error optimizando código:', error);
      throw error;
    }
  }

  /**
   * Convierte diseño del canvas actual a código limpio
   * @returns {Promise<Object>} Código del canvas
   */
  async canvasToCode() {
    const canvas = document.getElementById('canvas');
    if (!canvas) {
      throw new Error('Canvas no encontrado');
    }

    // Capturar HTML actual del canvas
    const currentHTML = canvas.innerHTML;

    // Crear screenshot del canvas para contexto visual
    const screenshot = await this.captureCanvasScreenshot();

    const prompt = `Analiza este HTML generado por un editor visual y conviértelo a código production-ready limpio:

HTML actual (generado por editor):
\`\`\`html
${currentHTML}
\`\`\`

Instrucciones:
1. Remover clases del editor (canvas-element, selected, etc)
2. Remover atributos del editor (draggable, data-component-type)
3. Remover botones de delete
4. Limpiar IDs autogenerados (element-XXX) por IDs semánticos
5. Organizar código con indentación correcta
6. Extraer CSS inline a <style> cuando sea apropiado
7. Agregar comentarios para secciones principales
8. Optimizar para SEO (meta tags apropiados)
9. Hacer responsive si no lo es

Retorna HTML completo production-ready.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      const parsed = this.parseResponse(response);

      return {
        ...parsed,
        screenshot: screenshot,
        original: currentHTML,
      };
    } catch (error) {
      console.error('Error convirtiendo canvas:', error);
      throw error;
    }
  }

  /**
   * Captura screenshot del canvas
   * @returns {Promise<string>} Base64 image data
   */
  async captureCanvasScreenshot() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return null;

    // Si html2canvas está disponible
    if (typeof html2canvas !== 'undefined') {
      try {
        const canvasElement = await html2canvas(canvas);
        return canvasElement.toDataURL('image/png');
      } catch (error) {
        console.error('Error capturando screenshot:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Genera variaciones de un componente
   * @param {HTMLElement} element - Elemento base
   * @param {number} count - Número de variaciones
   * @returns {Promise<Array>} Array de variaciones
   */
  async generateVariations(element, count = 3) {
    const baseHTML = element.outerHTML;

    const prompt = `Genera ${count} variaciones de este componente HTML:

\`\`\`html
${baseHTML}
\`\`\`

Cada variación debe:
- Mantener la estructura general
- Cambiar colores/estilos
- Tener personalidad diferente (elegante, moderno, minimalista, etc)
- Ser igualmente funcional

Retorna las ${count} variaciones separadas por "---VARIATION---".`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      const content = response.choices?.[0]?.message?.content || '';

      // Separar variaciones
      const variations = content
        .split('---VARIATION---')
        .map(v => v.trim())
        .filter(v => v.length > 0)
        .map((html, index) => ({
          id: `variation-${index}`,
          html: this.extractCodeBlock(html),
          index: index,
        }));

      return variations;
    } catch (error) {
      console.error('Error generando variaciones:', error);
      throw error;
    }
  }

  /**
   * Extrae bloque de código de markdown
   * @param {string} text - Texto con código
   * @returns {string} Código extraído
   */
  extractCodeBlock(text) {
    const match = text.match(/```(?:html)?\n([\s\S]*?)```/);
    return match ? match[1].trim() : text.trim();
  }

  /**
   * Corrige errores de HTML
   * @param {string} html - HTML con posibles errores
   * @returns {Promise<Object>} HTML corregido
   */
  async fixHTMLErrors(html) {
    const prompt = `Corrige errores de sintaxis y estructura en este HTML:

\`\`\`html
${html}
\`\`\`

Correcciones a aplicar:
- Cerrar tags abiertos
- Corregir anidamiento
- Validar atributos
- Arreglar comillas
- Hacer válido HTML5

Retorna HTML corregido.`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error corrigiendo HTML:', error);
      throw error;
    }
  }

  /**
   * Genera sugerencias de mejora para código
   * @param {string} code - Código a analizar
   * @returns {Promise<Array>} Array de sugerencias
   */
  async suggestImprovements(code) {
    const prompt = `Analiza este código HTML/CSS y sugiere mejoras:

\`\`\`html
${code}
\`\`\`

Analiza:
- Accesibilidad
- Performance
- SEO
- Semántica
- Best practices
- Responsive design

Retorna lista de sugerencias en formato:
1. [Mejora] - [Razón] - [Prioridad: Alta/Media/Baja]`;

    try {
      const response = await this.callBlackboxAPI(prompt);
      const content = response.choices?.[0]?.message?.content || '';

      // Parsear sugerencias
      const suggestions = content
        .split('\n')
        .filter(line => /^\d+\./.test(line))
        .map(line => {
          const parts = line.split(' - ');
          return {
            improvement: parts[0]?.replace(/^\d+\.\s*/, ''),
            reason: parts[1] || '',
            priority: parts[2] || 'Media',
          };
        });

      return suggestions;
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      throw error;
    }
  }

  /**
   * Verifica si está configurado
   * @returns {boolean} True si tiene API key
   */
  isReady() {
    return this.isConfigured && this.apiKey !== null;
  }

  /**
   * Muestra diálogo de configuración
   */
  showConfigDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚙️ Configurar AI Code Generator</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Blackbox API Key:</label>
                        <input type="password" id="blackboxApiKey" placeholder="sk-..." value="${this.apiKey || ''}">
                        <small style="color: var(--text-secondary); display: block; margin-top: 4px;">
                            Obtén tu API key en: <a href="https://www.blackbox.ai/api" target="_blank">blackbox.ai/api</a>
                        </small>
                    </div>
                    <div class="form-group">
                        <label>Modelo:</label>
                        <select id="aiModel">
                            <option value="blackbox" ${this.model === 'blackbox' ? 'selected' : ''}>Blackbox (Rápido)</option>
                            <option value="claude-3-sonnet" ${this.model === 'claude-3-sonnet' ? 'selected' : ''}>Claude 3 Sonnet (Preciso)</option>
                            <option value="gpt-4" ${this.model === 'gpt-4' ? 'selected' : ''}>GPT-4 (Potente)</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button class="btn primary" onclick="window.aiCodeGenerator.saveConfig()">Guardar</button>
                        <button class="btn" onclick="this.closest('.modal').remove()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  /**
   * Guarda configuración desde diálogo
   */
  saveConfig() {
    const apiKey = document.getElementById('blackboxApiKey')?.value;
    const model = document.getElementById('aiModel')?.value;

    if (apiKey && apiKey.trim()) {
      this.saveApiKey(apiKey.trim());
      this.model = model || 'blackbox';

      // Cerrar modal
      const modal = document.querySelector('.modal');
      if (modal) modal.remove();

      if (window.showToast) {
        window.showToast('Configuración guardada. AI Code Generator listo!');
      }
    } else {
      alert('Por favor ingresa una API key válida');
    }
  }

  /**
   * Muestra diálogo de generación de componente
   */
  showGenerateDialog() {
    if (!this.isReady()) {
      this.showConfigDialog();
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal ai-generate-modal';
    modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>🤖 Generar con AI</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Describe lo que quieres crear:</label>
                        <textarea id="aiPrompt" rows="4" style="width: 100%; padding: 10px; border: 1px solid var(--border-primary); border-radius: 6px; font-family: inherit; resize: vertical;" placeholder="Ej: Un hero section moderno con gradiente azul, título grande, subtítulo y dos botones (primario y secundario)"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tipo de componente:</label>
                        <select id="aiComponentType" style="width: 100%; padding: 10px; border: 1px solid var(--border-primary); border-radius: 6px;">
                            <option value="custom">Personalizado</option>
                            <option value="navbar">Navbar</option>
                            <option value="hero">Hero Section</option>
                            <option value="card">Card</option>
                            <option value="footer">Footer</option>
                            <option value="form">Formulario</option>
                            <option value="gallery">Galería</option>
                            <option value="pricing">Pricing Table</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button class="btn primary" onclick="window.aiCodeGenerator.executeGeneration()" id="generateBtn">
                            ✨ Generar
                        </button>
                        <button class="btn" onclick="this.closest('.modal').remove()">Cancelar</button>
                    </div>
                    <div id="aiGenerationResult" style="margin-top: 20px; display: none;">
                        <h4>Código Generado:</h4>
                        <pre style="background: var(--bg-secondary); padding: 15px; border-radius: 6px; overflow-x: auto; max-height: 300px;"><code id="generatedCode"></code></pre>
                        <div style="margin-top: 10px;">
                            <button class="btn primary" onclick="window.aiCodeGenerator.insertGeneratedCode()">Insertar en Canvas</button>
                            <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('generatedCode').textContent)">Copiar Código</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  /**
   * Ejecuta generación desde diálogo
   */
  async executeGeneration() {
    const prompt = document.getElementById('aiPrompt')?.value;
    const type = document.getElementById('aiComponentType')?.value;
    const btn = document.getElementById('generateBtn');

    if (!prompt || !prompt.trim()) {
      alert('Por favor describe lo que quieres crear');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Generando...';
    }

    try {
      const result = await this.generateComponent(prompt.trim(), type);

      // Mostrar resultado
      const resultDiv = document.getElementById('aiGenerationResult');
      const codeEl = document.getElementById('generatedCode');

      if (resultDiv && codeEl) {
        codeEl.textContent = result.html;
        resultDiv.style.display = 'block';
        this.lastGenerated = result.html;
      }

      if (window.showToast) {
        window.showToast('Código generado con AI');
      }
    } catch (error) {
      alert(`Error generando código: ${error.message}`);
      console.error(error);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✨ Generar';
      }
    }
  }

  /**
   * Inserta código generado en canvas
   */
  insertGeneratedCode() {
    if (!this.lastGenerated) return;

    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    // Crear elemento temporal
    const temp = document.createElement('div');
    temp.innerHTML = this.lastGenerated;
    const element = temp.firstElementChild;

    if (element) {
      // Agregar ID y clases del editor
      element.id = 'element-' + window.elementIdCounter++;
      element.classList.add('canvas-element');

      // Agregar funcionalidad del editor
      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = e => {
        e.stopPropagation();
        if (window.deleteElement) {
          window.deleteElement(element);
        }
      };
      element.appendChild(deleteBtn);

      // Eventos
      element.addEventListener('click', e => {
        e.stopPropagation();
        if (window.selectElement) {
          window.selectElement(element);
        }
      });

      element.addEventListener('dblclick', e => {
        e.stopPropagation();
        if (window.makeElementEditable) {
          window.makeElementEditable(element);
        }
      });

      // Agregar al canvas
      canvas.appendChild(element);

      // Cerrar modal
      const modal = document.querySelector('.ai-generate-modal');
      if (modal) modal.remove();

      if (window.showToast) {
        window.showToast('Componente AI insertado en canvas');
      }
    }
  }

  /**
   * Muestra estado de configuración
   * @returns {Object} Estado
   */
  getStatus() {
    return {
      configured: this.isConfigured,
      model: this.model,
      endpoint: this.endpoint,
      hasApiKey: this.apiKey !== null,
    };
  }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AICodeGenerator;
}

window.AICodeGenerator = AICodeGenerator;

export default AICodeGenerator;
