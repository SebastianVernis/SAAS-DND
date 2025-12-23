/**
 * Modal de Aceptación Legal
 * Muestra términos y condiciones en el primer uso
 */

export class LegalModal {
    constructor() {
        this.accepted = false;
        this.init();
    }

    init() {
        this.checkAcceptance();
        this.addLegalLinks();
    }

    checkAcceptance() {
        const accepted = localStorage.getItem('legalTermsAccepted');
        
        if (!accepted) {
            // Primera vez que usa la aplicación
            this.showModal();
        } else {
            this.accepted = true;
        }
    }

    showModal() {
        const modal = document.createElement('div');
        modal.id = 'legal-modal';
        modal.className = 'legal-modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div class="legal-modal-content" style="
                background: white;
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: slideInUp 0.4s ease;
            ">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🎨</div>
                    <h2 style="margin: 0 0 10px 0; font-size: 28px; color: #1e293b;">
                        Bienvenido a Editor HTML Drag & Drop
                    </h2>
                    <p style="color: #64748b; font-size: 16px; margin: 0;">
                        Tu herramienta visual para crear páginas web
                    </p>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #475569;">
                        📋 Antes de comenzar
                    </h3>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
                        Para usar esta aplicación, necesitas aceptar nuestros términos y condiciones. 
                        Por favor, tómate un momento para revisarlos.
                    </p>
                    
                    <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                        <a href="legal/terms.html" target="_blank" style="
                            flex: 1;
                            padding: 12px;
                            background: white;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            text-align: center;
                            text-decoration: none;
                            color: #475569;
                            font-weight: 600;
                            transition: all 0.3s;
                            display: block;
                        " onmouseover="this.style.borderColor='#667eea'; this.style.color='#667eea';" 
                           onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#475569';">
                            📜 Términos y Condiciones
                        </a>
                        
                        <a href="legal/privacy.html" target="_blank" style="
                            flex: 1;
                            padding: 12px;
                            background: white;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            text-align: center;
                            text-decoration: none;
                            color: #475569;
                            font-weight: 600;
                            transition: all 0.3s;
                            display: block;
                        " onmouseover="this.style.borderColor='#667eea'; this.style.color='#667eea';" 
                           onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#475569';">
                            🔒 Política de Privacidad
                        </a>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #475569;">
                        ✨ Características principales:
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 14px; line-height: 1.8;">
                        <li>Editor visual drag & drop</li>
                        <li>Plantillas profesionales prediseñadas</li>
                        <li>Exportación de código HTML/CSS/JS</li>
                        <li>Integración opcional con GitHub</li>
                        <li>Almacenamiento local seguro</li>
                        <li>Sin recopilación de datos personales</li>
                    </ul>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                        <strong>⚠️ Importante:</strong> Esta aplicación almacena tus proyectos localmente 
                        en tu navegador. Te recomendamos hacer respaldos regulares exportando tus proyectos 
                        o usando la integración con Git.
                    </p>
                </div>
                
                <label style="
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    cursor: pointer;
                    padding: 15px;
                    background: #f8fafc;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    border: 2px solid #e2e8f0;
                    transition: all 0.3s;
                " id="acceptance-label">
                    <input type="checkbox" id="accept-terms-checkbox" style="
                        width: 20px;
                        height: 20px;
                        margin-top: 2px;
                        cursor: pointer;
                        flex-shrink: 0;
                    ">
                    <span style="color: #475569; font-size: 14px; line-height: 1.6;">
                        He leído y acepto los 
                        <a href="legal/terms.html" target="_blank" style="color: #667eea; text-decoration: underline;">
                            Términos y Condiciones
                        </a> 
                        y la 
                        <a href="legal/privacy.html" target="_blank" style="color: #667eea; text-decoration: underline;">
                            Política de Privacidad
                        </a>
                    </span>
                </label>
                
                <div style="display: flex; gap: 12px;">
                    <button id="decline-btn" style="
                        flex: 1;
                        padding: 14px;
                        border: 2px solid #e2e8f0;
                        border-radius: 8px;
                        background: white;
                        color: #64748b;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        Rechazar
                    </button>
                    
                    <button id="accept-btn" disabled style="
                        flex: 2;
                        padding: 14px;
                        border: none;
                        border-radius: 8px;
                        background: #cbd5e1;
                        color: white;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: not-allowed;
                        transition: all 0.3s;
                    ">
                        Aceptar y Continuar
                    </button>
                </div>
                
                <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
                    Al aceptar, podrás comenzar a crear páginas web increíbles 🚀
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.attachModalEvents();
    }

    attachModalEvents() {
        const checkbox = document.getElementById('accept-terms-checkbox');
        const acceptBtn = document.getElementById('accept-btn');
        const declineBtn = document.getElementById('decline-btn');
        const label = document.getElementById('acceptance-label');
        
        // Habilitar botón cuando se marca el checkbox
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                acceptBtn.disabled = false;
                acceptBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                acceptBtn.style.cursor = 'pointer';
                label.style.borderColor = '#667eea';
                label.style.background = '#ede9fe';
            } else {
                acceptBtn.disabled = true;
                acceptBtn.style.background = '#cbd5e1';
                acceptBtn.style.cursor = 'not-allowed';
                label.style.borderColor = '#e2e8f0';
                label.style.background = '#f8fafc';
            }
        });
        
        // Botón aceptar
        acceptBtn.addEventListener('click', () => {
            if (checkbox.checked) {
                this.acceptTerms();
            }
        });
        
        // Botón rechazar
        declineBtn.addEventListener('click', () => {
            this.declineTerms();
        });
        
        // Hover effects
        acceptBtn.addEventListener('mouseover', () => {
            if (!acceptBtn.disabled) {
                acceptBtn.style.transform = 'translateY(-2px)';
                acceptBtn.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            }
        });
        
        acceptBtn.addEventListener('mouseout', () => {
            acceptBtn.style.transform = 'translateY(0)';
            acceptBtn.style.boxShadow = 'none';
        });
        
        declineBtn.addEventListener('mouseover', () => {
            declineBtn.style.borderColor = '#ef4444';
            declineBtn.style.color = '#ef4444';
        });
        
        declineBtn.addEventListener('mouseout', () => {
            declineBtn.style.borderColor = '#e2e8f0';
            declineBtn.style.color = '#64748b';
        });
    }

    acceptTerms() {
        localStorage.setItem('legalTermsAccepted', 'true');
        localStorage.setItem('legalTermsAcceptedDate', new Date().toISOString());
        this.accepted = true;
        
        const modal = document.getElementById('legal-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
        
        // Mostrar mensaje de bienvenida
        this.showWelcomeMessage();
    }

    declineTerms() {
        const confirmed = confirm(
            'Si no aceptas los términos y condiciones, no podrás usar la aplicación.\n\n' +
            '¿Estás seguro de que deseas salir?'
        );
        
        if (confirmed) {
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    text-align: center;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                ">
                    <div style="font-size: 80px; margin-bottom: 20px;">😔</div>
                    <h1 style="font-size: 32px; margin-bottom: 15px;">Términos no aceptados</h1>
                    <p style="font-size: 18px; margin-bottom: 30px; opacity: 0.9;">
                        Necesitas aceptar los términos y condiciones para usar esta aplicación.
                    </p>
                    <button onclick="location.reload()" style="
                        padding: 14px 28px;
                        background: white;
                        color: #667eea;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.3s;
                    " onmouseover="this.style.transform='scale(1.05)'" 
                       onmouseout="this.style.transform='scale(1)'">
                        Volver a intentar
                    </button>
                </div>
            `;
        }
    }

    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 100000;
            animation: slideInRight 0.5s ease;
            max-width: 350px;
        `;
        
        welcome.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="font-size: 40px;">🎉</div>
                <div>
                    <h3 style="margin: 0 0 5px 0; font-size: 18px;">¡Bienvenido!</h3>
                    <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                        Comienza a crear páginas web increíbles
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(welcome);
        
        setTimeout(() => {
            welcome.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => welcome.remove(), 500);
        }, 4000);
    }

    addLegalLinks() {
        // Agregar enlaces en el footer si existe
        const footer = document.querySelector('footer') || document.querySelector('.footer');
        
        if (footer) {
            const legalLinks = document.createElement('div');
            legalLinks.style.cssText = `
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                text-align: center;
                font-size: 13px;
            `;
            
            legalLinks.innerHTML = `
                <a href="legal/terms.html" target="_blank" style="color: #64748b; text-decoration: none; margin: 0 15px;">
                    Términos y Condiciones
                </a>
                <span style="color: #cbd5e1;">|</span>
                <a href="legal/privacy.html" target="_blank" style="color: #64748b; text-decoration: none; margin: 0 15px;">
                    Política de Privacidad
                </a>
            `;
            
            footer.appendChild(legalLinks);
        }
    }
}

// Estilos CSS para animaciones
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideInUp {
        from {
            transform: translateY(50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(styles);

// Exportar instancia global
export const legalModal = new LegalModal();
window.legalModal = legalModal;
