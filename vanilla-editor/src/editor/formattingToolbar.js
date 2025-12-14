/**
 * Toolbar de Formato Contextual - Estilo Microsoft Office
 * Aparece al seleccionar texto y permite formato rápido
 */

export class FormattingToolbar {
    constructor() {
        this.toolbar = null;
        this.selectedElement = null;
        this.isVisible = false;
        this.googleFonts = [
            'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
            'Raleway', 'Ubuntu', 'Playfair Display', 'Merriweather', 'Oswald'
        ];
        this.init();
    }

    init() {
        this.createToolbar();
        this.attachEventListeners();
        this.loadGoogleFonts();
    }

    loadGoogleFonts() {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Open+Sans:wght@300;400;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;700&family=Poppins:wght@300;400;700&family=Raleway:wght@300;400;700&family=Ubuntu:wght@300;400;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@300;400;700&family=Oswald:wght@300;400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }

    createToolbar() {
        this.toolbar = document.createElement('div');
        this.toolbar.id = 'formatting-toolbar';
        this.toolbar.className = 'formatting-toolbar';
        this.toolbar.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px;
            display: none;
            gap: 4px;
            align-items: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            z-index: 100000;
            user-select: none;
        `;

        this.toolbar.innerHTML = `
            <select id="fmt-font-family" class="fmt-select" title="Fuente">
                ${this.googleFonts.map(font => `<option value="${font}" style="font-family: ${font}">${font}</option>`).join('')}
            </select>
            
            <select id="fmt-font-size" class="fmt-select" title="Tamaño">
                ${[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72].map(size => 
                    `<option value="${size}px">${size}</option>`
                ).join('')}
            </select>
            
            <div class="fmt-divider"></div>
            
            <button class="fmt-btn" data-action="bold" title="Negrita (Ctrl+B)">
                <strong>B</strong>
            </button>
            
            <button class="fmt-btn" data-action="italic" title="Cursiva (Ctrl+I)">
                <em>I</em>
            </button>
            
            <button class="fmt-btn" data-action="underline" title="Subrayado (Ctrl+U)">
                <u>U</u>
            </button>
            
            <div class="fmt-divider"></div>
            
            <div class="fmt-color-picker-wrapper">
                <button class="fmt-btn fmt-color-btn" id="fmt-text-color-btn" title="Color de texto">
                    <span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #ccc; background: #000000; border-radius: 2px;"></span>
                </button>
                <input type="color" id="fmt-text-color" value="#000000" style="display: none;">
            </div>
            
            <div class="fmt-color-picker-wrapper">
                <button class="fmt-btn fmt-color-btn" id="fmt-bg-color-btn" title="Color de fondo">
                    <span style="display: inline-block; width: 16px; height: 16px; border: 1px solid #ccc; background: transparent; border-radius: 2px;"></span>
                </button>
                <input type="color" id="fmt-bg-color" value="#ffffff" style="display: none;">
            </div>
            
            <div class="fmt-divider"></div>
            
            <select id="fmt-text-align" class="fmt-select" title="Alineación">
                <option value="left">← Izquierda</option>
                <option value="center">↔ Centro</option>
                <option value="right">→ Derecha</option>
                <option value="justify">⇔ Justificar</option>
            </select>
            
            <div class="fmt-divider"></div>
            
            <button class="fmt-btn" data-action="increase-size" title="Aumentar tamaño">
                A+
            </button>
            
            <button class="fmt-btn" data-action="decrease-size" title="Disminuir tamaño">
                A-
            </button>
        `;

        document.body.appendChild(this.toolbar);
        this.addStyles();
    }

    addStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .formatting-toolbar {
                display: flex !important;
            }
            
            .fmt-select {
                padding: 6px 8px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                background: white;
                font-size: 13px;
                cursor: pointer;
                outline: none;
                transition: all 0.2s;
            }
            
            .fmt-select:hover {
                border-color: #cbd5e1;
                background: #f8fafc;
            }
            
            .fmt-select:focus {
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }
            
            #fmt-font-family {
                min-width: 140px;
            }
            
            #fmt-font-size {
                width: 70px;
            }
            
            #fmt-text-align {
                width: 120px;
            }
            
            .fmt-btn {
                width: 32px;
                height: 32px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                transition: all 0.2s;
                outline: none;
            }
            
            .fmt-btn:hover {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            
            .fmt-btn:active,
            .fmt-btn.active {
                background: #e0e7ff;
                border-color: #2563eb;
                color: #2563eb;
            }
            
            .fmt-divider {
                width: 1px;
                height: 24px;
                background: #e2e8f0;
                margin: 0 4px;
            }
            
            .fmt-color-picker-wrapper {
                position: relative;
            }
            
            .fmt-color-btn span {
                pointer-events: none;
            }
        `;
        document.head.appendChild(styles);
    }

    attachEventListeners() {
        // Font family
        const fontSelect = this.toolbar.querySelector('#fmt-font-family');
        fontSelect.addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.fontFamily = e.target.value;
                this.notifyChange();
            }
        });

        // Font size
        const sizeSelect = this.toolbar.querySelector('#fmt-font-size');
        sizeSelect.addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.fontSize = e.target.value;
                this.notifyChange();
            }
        });

        // Text align
        const alignSelect = this.toolbar.querySelector('#fmt-text-align');
        alignSelect.addEventListener('change', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.textAlign = e.target.value;
                this.notifyChange();
            }
        });

        // Format buttons
        this.toolbar.querySelectorAll('.fmt-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.applyFormat(action);
            });
        });

        // Color pickers
        const textColorBtn = this.toolbar.querySelector('#fmt-text-color-btn');
        const textColorInput = this.toolbar.querySelector('#fmt-text-color');
        textColorBtn.addEventListener('click', () => textColorInput.click());
        textColorInput.addEventListener('input', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.color = e.target.value;
                textColorBtn.querySelector('span').style.background = e.target.value;
                this.notifyChange();
            }
        });

        const bgColorBtn = this.toolbar.querySelector('#fmt-bg-color-btn');
        const bgColorInput = this.toolbar.querySelector('#fmt-bg-color');
        bgColorBtn.addEventListener('click', () => bgColorInput.click());
        bgColorInput.addEventListener('input', (e) => {
            if (this.selectedElement) {
                this.selectedElement.style.backgroundColor = e.target.value;
                bgColorBtn.querySelector('span').style.background = e.target.value;
                this.notifyChange();
            }
        });

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!this.toolbar.contains(e.target) && !e.target.closest('.canvas-element')) {
                this.hide();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.selectedElement) return;
            
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.applyFormat('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.applyFormat('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.applyFormat('underline');
                        break;
                }
            }
        });
    }

    applyFormat(action) {
        if (!this.selectedElement) return;

        const style = this.selectedElement.style;
        
        switch(action) {
            case 'bold':
                style.fontWeight = style.fontWeight === 'bold' ? 'normal' : 'bold';
                break;
            case 'italic':
                style.fontStyle = style.fontStyle === 'italic' ? 'normal' : 'italic';
                break;
            case 'underline':
                style.textDecoration = style.textDecoration === 'underline' ? 'none' : 'underline';
                break;
            case 'increase-size':
                const currentSize = parseFloat(window.getComputedStyle(this.selectedElement).fontSize);
                style.fontSize = (currentSize + 2) + 'px';
                break;
            case 'decrease-size':
                const currentSize2 = parseFloat(window.getComputedStyle(this.selectedElement).fontSize);
                style.fontSize = Math.max(8, currentSize2 - 2) + 'px';
                break;
        }
        
        this.updateButtonStates();
        this.notifyChange();
    }

    show(element, x, y) {
        this.selectedElement = element;
        this.toolbar.style.display = 'flex';
        this.isVisible = true;
        
        // Posicionar cerca del elemento
        const toolbarRect = this.toolbar.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        let left = elementRect.left + (elementRect.width / 2) - (toolbarRect.width / 2);
        let top = elementRect.top - toolbarRect.height - 10;
        
        // Ajustar si se sale de la pantalla
        if (left < 10) left = 10;
        if (left + toolbarRect.width > window.innerWidth - 10) {
            left = window.innerWidth - toolbarRect.width - 10;
        }
        if (top < 10) {
            top = elementRect.bottom + 10;
        }
        
        this.toolbar.style.left = left + 'px';
        this.toolbar.style.top = top + 'px';
        
        // Actualizar valores actuales
        this.updateCurrentValues();
        this.updateButtonStates();
    }

    hide() {
        this.toolbar.style.display = 'none';
        this.isVisible = false;
        this.selectedElement = null;
    }

    updateCurrentValues() {
        if (!this.selectedElement) return;
        
        const computed = window.getComputedStyle(this.selectedElement);
        
        // Font family
        const fontFamily = computed.fontFamily.split(',')[0].replace(/['"]/g, '');
        const fontSelect = this.toolbar.querySelector('#fmt-font-family');
        fontSelect.value = fontFamily;
        
        // Font size
        const fontSize = computed.fontSize;
        const sizeSelect = this.toolbar.querySelector('#fmt-font-size');
        sizeSelect.value = fontSize;
        
        // Text align
        const textAlign = computed.textAlign;
        const alignSelect = this.toolbar.querySelector('#fmt-text-align');
        alignSelect.value = textAlign;
        
        // Colors
        const color = this.rgbToHex(computed.color);
        const bgColor = this.rgbToHex(computed.backgroundColor);
        
        this.toolbar.querySelector('#fmt-text-color').value = color;
        this.toolbar.querySelector('#fmt-text-color-btn span').style.background = color;
        
        this.toolbar.querySelector('#fmt-bg-color').value = bgColor;
        this.toolbar.querySelector('#fmt-bg-color-btn span').style.background = bgColor;
    }

    updateButtonStates() {
        if (!this.selectedElement) return;
        
        const computed = window.getComputedStyle(this.selectedElement);
        
        // Bold
        const boldBtn = this.toolbar.querySelector('[data-action="bold"]');
        boldBtn.classList.toggle('active', computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700);
        
        // Italic
        const italicBtn = this.toolbar.querySelector('[data-action="italic"]');
        italicBtn.classList.toggle('active', computed.fontStyle === 'italic');
        
        // Underline
        const underlineBtn = this.toolbar.querySelector('[data-action="underline"]');
        underlineBtn.classList.toggle('active', computed.textDecoration.includes('underline'));
    }

    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;
        if (rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
        
        const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return '#000000';
        
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    notifyChange() {
        // Actualizar panel de propiedades
        if (window.updatePropertiesPanel) {
            window.updatePropertiesPanel(this.selectedElement);
        }
        
        // Guardar en historial
        if (window.undoRedoManager) {
            window.undoRedoManager.saveState();
        }
    }
}

// Exportar instancia global
export const formattingToolbar = new FormattingToolbar();
window.formattingToolbar = formattingToolbar;
