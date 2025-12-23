/**
 * Sistema de Autoguardado con Git
 * Integración con GitHub API usando Personal Access Token
 * Autoguardado cada 2 minutos con commits automáticos
 */

export class GitAutoSave {
    constructor() {
        this.enabled = false;
        this.token = null;
        this.repo = null;
        this.owner = null;
        this.branch = 'main';
        this.autoSaveInterval = null;
        this.autoSaveDelay = 120000; // 2 minutos
        this.lastSaveTime = null;
        this.pendingChanges = false;
        this.init();
    }

    init() {
        this.loadConfig();
        this.createConfigPanel();
        this.addMenuOption();
        
        if (this.enabled && this.token) {
            this.startAutoSave();
        }
        
        // Detectar cambios en el canvas
        this.watchForChanges();
    }

    loadConfig() {
        const config = localStorage.getItem('gitAutoSaveConfig');
        if (config) {
            try {
                const data = JSON.parse(config);
                this.enabled = data.enabled || false;
                this.token = data.token || null;
                this.repo = data.repo || null;
                this.owner = data.owner || null;
                this.branch = data.branch || 'main';
                this.autoSaveDelay = data.autoSaveDelay || 120000;
            } catch (e) {
                console.error('Error loading Git config:', e);
            }
        }
    }

    saveConfig() {
        const config = {
            enabled: this.enabled,
            token: this.token,
            repo: this.repo,
            owner: this.owner,
            branch: this.branch,
            autoSaveDelay: this.autoSaveDelay
        };
        localStorage.setItem('gitAutoSaveConfig', JSON.stringify(config));
    }

    addMenuOption() {
        // Buscar el menú de Archivo
        const fileMenu = Array.from(document.querySelectorAll('.toolbar-dropdown-menu'))
            .find(menu => menu.previousElementSibling?.textContent.includes('Archivo'));
        
        if (!fileMenu) return;
        
        // Agregar divider
        const divider = document.createElement('div');
        divider.className = 'dropdown-divider';
        fileMenu.appendChild(divider);
        
        // Botón de configuración de Git
        const gitBtn = document.createElement('button');
        gitBtn.className = 'dropdown-item';
        gitBtn.innerHTML = '🔄 Configurar Git Auto-Save';
        gitBtn.onclick = () => this.showConfigPanel();
        fileMenu.appendChild(gitBtn);
        
        // Botón de commit manual
        const commitBtn = document.createElement('button');
        commitBtn.className = 'dropdown-item';
        commitBtn.id = 'git-manual-commit-btn';
        commitBtn.innerHTML = '💾 Commit Manual a Git';
        commitBtn.onclick = () => this.manualCommit();
        fileMenu.appendChild(commitBtn);
    }

    createConfigPanel() {
        const panel = document.createElement('div');
        panel.id = 'git-config-panel';
        panel.className = 'modal-overlay';
        panel.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 100000;
            align-items: center;
            justify-content: center;
        `;
        
        panel.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #1e293b;">
                    🔄 Configuración Git Auto-Save
                </h2>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="git-enable-checkbox" style="width: 20px; height: 20px;">
                        <span style="font-weight: 600;">Activar Auto-Save con Git</span>
                    </label>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">
                        Personal Access Token
                    </label>
                    <input type="password" id="git-token-input" 
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                    <small style="color: #64748b; display: block; margin-top: 4px;">
                        Crea un token en: GitHub → Settings → Developer settings → Personal access tokens
                    </small>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">
                        Usuario/Organización
                    </label>
                    <input type="text" id="git-owner-input" 
                        placeholder="tu-usuario"
                        style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">
                        Nombre del Repositorio
                    </label>
                    <input type="text" id="git-repo-input" 
                        placeholder="mi-proyecto"
                        style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">
                        Branch
                    </label>
                    <input type="text" id="git-branch-input" 
                        value="main"
                        style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #475569;">
                        Intervalo de Auto-Save (minutos)
                    </label>
                    <input type="number" id="git-interval-input" 
                        value="2" min="1" max="60"
                        style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px;">
                </div>
                
                <div id="git-status-message" style="
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    display: none;
                "></div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="git-test-connection-btn" style="
                        padding: 10px 20px;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        background: white;
                        color: #475569;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        🔍 Probar Conexión
                    </button>
                    <button id="git-cancel-btn" style="
                        padding: 10px 20px;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        background: white;
                        color: #475569;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Cancelar
                    </button>
                    <button id="git-save-btn" style="
                        padding: 10px 20px;
                        border: none;
                        border-radius: 6px;
                        background: #2563eb;
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Guardar Configuración
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.attachPanelEvents();
    }

    attachPanelEvents() {
        const panel = document.getElementById('git-config-panel');
        
        // Cargar valores actuales
        document.getElementById('git-enable-checkbox').checked = this.enabled;
        document.getElementById('git-token-input').value = this.token || '';
        document.getElementById('git-owner-input').value = this.owner || '';
        document.getElementById('git-repo-input').value = this.repo || '';
        document.getElementById('git-branch-input').value = this.branch || 'main';
        document.getElementById('git-interval-input').value = this.autoSaveDelay / 60000;
        
        // Botón guardar
        document.getElementById('git-save-btn').onclick = () => {
            this.enabled = document.getElementById('git-enable-checkbox').checked;
            this.token = document.getElementById('git-token-input').value.trim();
            this.owner = document.getElementById('git-owner-input').value.trim();
            this.repo = document.getElementById('git-repo-input').value.trim();
            this.branch = document.getElementById('git-branch-input').value.trim() || 'main';
            this.autoSaveDelay = parseInt(document.getElementById('git-interval-input').value) * 60000;
            
            this.saveConfig();
            
            if (this.enabled && this.token) {
                this.startAutoSave();
                this.showStatus('✅ Configuración guardada. Auto-Save activado.', 'success');
            } else {
                this.stopAutoSave();
                this.showStatus('✅ Configuración guardada.', 'success');
            }
            
            setTimeout(() => this.hideConfigPanel(), 2000);
        };
        
        // Botón cancelar
        document.getElementById('git-cancel-btn').onclick = () => {
            this.hideConfigPanel();
        };
        
        // Botón probar conexión
        document.getElementById('git-test-connection-btn').onclick = async () => {
            const token = document.getElementById('git-token-input').value.trim();
            const owner = document.getElementById('git-owner-input').value.trim();
            const repo = document.getElementById('git-repo-input').value.trim();
            
            if (!token || !owner || !repo) {
                this.showStatus('⚠️ Por favor completa todos los campos', 'warning');
                return;
            }
            
            this.showStatus('🔄 Probando conexión...', 'info');
            
            const success = await this.testConnection(token, owner, repo);
            if (success) {
                this.showStatus('✅ Conexión exitosa!', 'success');
            } else {
                this.showStatus('❌ Error de conexión. Verifica tus credenciales.', 'error');
            }
        };
        
        // Cerrar al hacer clic fuera
        panel.onclick = (e) => {
            if (e.target === panel) {
                this.hideConfigPanel();
            }
        };
    }

    showConfigPanel() {
        const panel = document.getElementById('git-config-panel');
        if (panel) {
            panel.style.display = 'flex';
        }
    }

    hideConfigPanel() {
        const panel = document.getElementById('git-config-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('git-status-message');
        if (!statusDiv) return;
        
        const colors = {
            success: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
            error: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
            warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
            info: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' }
        };
        
        const color = colors[type] || colors.info;
        
        statusDiv.style.display = 'block';
        statusDiv.style.background = color.bg;
        statusDiv.style.color = color.text;
        statusDiv.style.border = `1px solid ${color.border}`;
        statusDiv.textContent = message;
    }

    async testConnection(token, owner, repo) {
        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Git connection test failed:', error);
            return false;
        }
    }

    async commitToGit(message) {
        if (!this.token || !this.owner || !this.repo) {
            console.error('Git not configured');
            return false;
        }
        
        try {
            // Obtener el contenido actual del proyecto
            const projectData = this.getProjectData();
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(projectData, null, 2))));
            
            // Obtener el SHA del archivo actual (si existe)
            const filePath = 'project.json';
            let sha = null;
            
            try {
                const getResponse = await fetch(
                    `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}?ref=${this.branch}`,
                    {
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (getResponse.ok) {
                    const data = await getResponse.json();
                    sha = data.sha;
                }
            } catch (e) {
                // Archivo no existe, se creará
            }
            
            // Crear o actualizar el archivo
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${filePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: message,
                        content: content,
                        branch: this.branch,
                        ...(sha && { sha })
                    })
                }
            );
            
            if (response.ok) {
                this.lastSaveTime = new Date();
                this.pendingChanges = false;
                this.showToast('✅ Guardado en Git exitoso', 'success');
                return true;
            } else {
                const error = await response.json();
                console.error('Git commit failed:', error);
                this.showToast('❌ Error al guardar en Git', 'error');
                return false;
            }
        } catch (error) {
            console.error('Git commit error:', error);
            this.showToast('❌ Error de conexión con Git', 'error');
            return false;
        }
    }

    getProjectData() {
        const canvas = document.getElementById('canvas');
        return {
            version: '1.0',
            timestamp: new Date().toISOString(),
            html: canvas ? canvas.innerHTML : '',
            metadata: {
                title: document.title,
                canvasSize: {
                    width: canvas?.style.width || 'auto',
                    height: canvas?.style.height || 'auto'
                }
            }
        };
    }

    async manualCommit() {
        const message = prompt('Mensaje del commit:', `Manual save - ${new Date().toLocaleString()}`);
        if (message) {
            const success = await this.commitToGit(message);
            if (success) {
                console.log('Manual commit successful');
            }
        }
    }

    startAutoSave() {
        this.stopAutoSave(); // Limpiar intervalo anterior
        
        this.autoSaveInterval = setInterval(() => {
            if (this.pendingChanges) {
                const message = `Auto-save - ${new Date().toLocaleString()}`;
                this.commitToGit(message);
            }
        }, this.autoSaveDelay);
        
        console.log(`Git Auto-Save started (every ${this.autoSaveDelay / 60000} minutes)`);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('Git Auto-Save stopped');
        }
    }

    watchForChanges() {
        // Observar cambios en el canvas
        const canvas = document.getElementById('canvas');
        if (!canvas) return;
        
        const observer = new MutationObserver(() => {
            this.pendingChanges = true;
        });
        
        observer.observe(canvas, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    showToast(message, type) {
        // Reutilizar sistema de toast existente si está disponible
        if (window.showToast) {
            window.showToast(message);
        } else {
            console.log(message);
        }
    }
}

// Exportar instancia global
export const gitAutoSave = new GitAutoSave();
window.gitAutoSave = gitAutoSave;
