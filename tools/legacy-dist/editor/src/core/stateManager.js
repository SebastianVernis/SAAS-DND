/**
 * State Manager Module
 * Centralized state management to replace global variables
 * @module core/stateManager
 */

/**
 * State Manager Class
 * Manages application state with validation and change notifications
 */
class StateManager {
    constructor() {
        this.state = {
            // Element management
            selectedElement: null,
            draggedComponentType: null,
            draggedCanvasElement: null,
            elementIdCounter: 0,
            
            // UI state
            currentFilter: 'todas',
            currentView: 'desktop', // desktop, tablet, mobile
            currentTemplate: null,
            
            // Canvas state
            canvasWidth: '100%',
            canvasHeight: 'auto',
            
            // Modules
            fileLoader: null,
            projectManager: null,
            componentExtractor: null,
            
            // Drag & Drop state
            dropIndicator: null,
            isDragging: false,
            dragStartPosition: null,
            
            // Undo/Redo
            history: [],
            historyIndex: -1,
            maxHistorySize: 50,
            
            // Project state
            projectName: 'Untitled Project',
            projectModified: false,
            lastSaved: null,
            
            // UI elements cache
            canvas: null,
            propertiesPanel: null,
            componentsPanel: null,
            templatesGrid: null
        };

        this.observers = new Map();
        this.validators = new Map();
        
        this.setupValidators();
    }

    /**
     * Sets up validators for state properties
     * @private
     */
    setupValidators() {
        // Element ID counter must be non-negative
        this.validators.set('elementIdCounter', (value) => {
            return typeof value === 'number' && value >= 0;
        });

        // Current filter must be a string
        this.validators.set('currentFilter', (value) => {
            return typeof value === 'string';
        });

        // Current view must be valid
        this.validators.set('currentView', (value) => {
            return ['desktop', 'tablet', 'mobile'].includes(value);
        });

        // History index must be valid
        this.validators.set('historyIndex', (value) => {
            return typeof value === 'number' && value >= -1;
        });
    }

    /**
     * Gets a state value
     * @param {string} key - The state key
     * @returns {*} The state value
     */
    get(key) {
        if (!this.state.hasOwnProperty(key)) {
            console.warn(`StateManager: Unknown state key: ${key}`);
            return undefined;
        }
        return this.state[key];
    }

    /**
     * Sets a state value with validation and notification
     * @param {string} key - The state key
     * @param {*} value - The new value
     * @param {boolean} notify - Whether to notify observers (default: true)
     * @returns {boolean} True if value was set successfully
     */
    set(key, value, notify = true) {
        if (!this.state.hasOwnProperty(key)) {
            console.warn(`StateManager: Unknown state key: ${key}`);
            return false;
        }

        // Validate if validator exists
        if (this.validators.has(key)) {
            const validator = this.validators.get(key);
            if (!validator(value)) {
                console.error(`StateManager: Invalid value for ${key}:`, value);
                return false;
            }
        }

        const oldValue = this.state[key];
        
        // Only update if value changed
        if (oldValue === value) {
            return true;
        }

        this.state[key] = value;

        // Notify observers
        if (notify) {
            this.notifyObservers(key, value, oldValue);
        }

        return true;
    }

    /**
     * Sets multiple state values at once
     * @param {Object} updates - Object with key-value pairs to update
     * @param {boolean} notify - Whether to notify observers
     * @returns {boolean} True if all updates succeeded
     */
    setMultiple(updates, notify = true) {
        const results = [];
        
        for (const [key, value] of Object.entries(updates)) {
            results.push(this.set(key, value, notify));
        }

        return results.every(r => r === true);
    }

    /**
     * Gets multiple state values
     * @param {Array<string>} keys - Array of state keys
     * @returns {Object} Object with requested state values
     */
    getMultiple(keys) {
        const result = {};
        
        for (const key of keys) {
            result[key] = this.get(key);
        }

        return result;
    }

    /**
     * Adds an observer for state changes
     * @param {string} key - The state key to observe
     * @param {Function} callback - Callback function (newValue, oldValue) => void
     * @returns {string} Observer ID for removal
     */
    observe(key, callback) {
        if (typeof callback !== 'function') {
            console.error('StateManager: Observer callback must be a function');
            return null;
        }

        if (!this.observers.has(key)) {
            this.observers.set(key, []);
        }

        const observerId = `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.observers.get(key).push({ id: observerId, callback });

        return observerId;
    }

    /**
     * Removes an observer
     * @param {string} observerId - The observer ID to remove
     * @returns {boolean} True if observer was found and removed
     */
    unobserve(observerId) {
        for (const [key, observers] of this.observers.entries()) {
            const index = observers.findIndex(o => o.id === observerId);
            
            if (index !== -1) {
                observers.splice(index, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Notifies observers of a state change
     * @param {string} key - The state key that changed
     * @param {*} newValue - The new value
     * @param {*} oldValue - The old value
     * @private
     */
    notifyObservers(key, newValue, oldValue) {
        const observers = this.observers.get(key);
        
        if (!observers || observers.length === 0) {
            return;
        }

        observers.forEach(observer => {
            try {
                observer.callback(newValue, oldValue);
            } catch (error) {
                console.error(`StateManager: Error in observer for ${key}:`, error);
            }
        });
    }

    /**
     * Increments the element ID counter and returns the new ID
     * @returns {string} New element ID
     */
    generateElementId() {
        const counter = this.get('elementIdCounter');
        const newId = `element-${counter}`;
        this.set('elementIdCounter', counter + 1);
        return newId;
    }

    /**
     * Selects an element
     * @param {Element|null} element - The element to select
     */
    selectElement(element) {
        const oldElement = this.get('selectedElement');
        
        // Remove selection from old element
        if (oldElement) {
            oldElement.classList.remove('selected');
        }

        // Add selection to new element
        if (element) {
            element.classList.add('selected');
        }

        this.set('selectedElement', element);
    }

    /**
     * Gets the currently selected element
     * @returns {Element|null} The selected element
     */
    getSelectedElement() {
        return this.get('selectedElement');
    }

    /**
     * Adds a state to history for undo/redo
     * @param {Object} state - The state to save
     */
    addToHistory(state) {
        const history = this.get('history');
        const historyIndex = this.get('historyIndex');
        const maxHistorySize = this.get('maxHistorySize');

        // Remove any states after current index
        const newHistory = history.slice(0, historyIndex + 1);

        // Add new state
        newHistory.push({
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(state)) // Deep clone
        });

        // Limit history size
        if (newHistory.length > maxHistorySize) {
            newHistory.shift();
        }

        this.set('history', newHistory, false);
        this.set('historyIndex', newHistory.length - 1, false);
        this.set('projectModified', true);
    }

    /**
     * Checks if undo is available
     * @returns {boolean} True if undo is available
     */
    canUndo() {
        return this.get('historyIndex') > 0;
    }

    /**
     * Checks if redo is available
     * @returns {boolean} True if redo is available
     */
    canRedo() {
        const history = this.get('history');
        const historyIndex = this.get('historyIndex');
        return historyIndex < history.length - 1;
    }

    /**
     * Performs undo operation
     * @returns {Object|null} The previous state or null
     */
    undo() {
        if (!this.canUndo()) {
            return null;
        }

        const historyIndex = this.get('historyIndex');
        this.set('historyIndex', historyIndex - 1, false);

        const history = this.get('history');
        return history[historyIndex - 1].state;
    }

    /**
     * Performs redo operation
     * @returns {Object|null} The next state or null
     */
    redo() {
        if (!this.canRedo()) {
            return null;
        }

        const historyIndex = this.get('historyIndex');
        this.set('historyIndex', historyIndex + 1, false);

        const history = this.get('history');
        return history[historyIndex + 1].state;
    }

    /**
     * Clears the history
     */
    clearHistory() {
        this.set('history', [], false);
        this.set('historyIndex', -1, false);
    }

    /**
     * Marks the project as saved
     */
    markAsSaved() {
        this.set('projectModified', false);
        this.set('lastSaved', new Date());
    }

    /**
     * Checks if project has unsaved changes
     * @returns {boolean} True if project has unsaved changes
     */
    hasUnsavedChanges() {
        return this.get('projectModified');
    }

    /**
     * Resets the state to initial values
     */
    reset() {
        this.state = {
            selectedElement: null,
            draggedComponentType: null,
            draggedCanvasElement: null,
            elementIdCounter: 0,
            currentFilter: 'todas',
            currentView: 'desktop',
            currentTemplate: null,
            canvasWidth: '100%',
            canvasHeight: 'auto',
            fileLoader: null,
            projectManager: null,
            componentExtractor: null,
            dropIndicator: null,
            isDragging: false,
            dragStartPosition: null,
            history: [],
            historyIndex: -1,
            maxHistorySize: 50,
            projectName: 'Untitled Project',
            projectModified: false,
            lastSaved: null,
            canvas: null,
            propertiesPanel: null,
            componentsPanel: null,
            templatesGrid: null
        };

        // Notify all observers of reset
        for (const key of Object.keys(this.state)) {
            this.notifyObservers(key, this.state[key], undefined);
        }
    }

    /**
     * Gets a snapshot of the current state
     * @returns {Object} State snapshot
     */
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * Restores state from a snapshot
     * @param {Object} snapshot - State snapshot to restore
     */
    restoreSnapshot(snapshot) {
        for (const [key, value] of Object.entries(snapshot)) {
            if (this.state.hasOwnProperty(key)) {
                this.set(key, value);
            }
        }
    }

    /**
     * Gets statistics about the state
     * @returns {Object} State statistics
     */
    getStats() {
        return {
            stateKeys: Object.keys(this.state).length,
            observers: this.observers.size,
            historySize: this.get('history').length,
            historyIndex: this.get('historyIndex'),
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            hasUnsavedChanges: this.hasUnsavedChanges()
        };
    }
}

// Create singleton instance
const stateManager = new StateManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        stateManager,
        StateManager
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.stateManager = stateManager;
    window.StateManager = StateManager;
}

export { stateManager, StateManager };
export default stateManager;
