/**
 * Integration Example
 * Demonstrates how to use the new modules in the existing codebase
 * @module core/integration-example
 */

// This file shows how to integrate the new modules into script.js

/**
 * Demonstrates replacing module-level global variables with a state manager.
 *
 * Imports the state manager and shows setting and getting a named state key,
 * generating a new element ID, and observing changes to the stored value.
 */
function exampleStateManager() {
    // OLD WAY (Global Variables)
    // let selectedElement = null;
    // let elementIdCounter = 0;
    
    // NEW WAY (State Manager)
    import('./stateManager.js').then(({ stateManager }) => {
        // Set state
        stateManager.set('selectedElement', document.getElementById('myElement'));
        
        // Get state
        const selected = stateManager.get('selectedElement');
        
        // Generate new element ID
        const newId = stateManager.generateElementId();
        
        // Observe state changes
        stateManager.observe('selectedElement', (newValue, oldValue) => {
            console.log('Selection changed:', oldValue, '->', newValue);
        });
    });
}

/**
 * Demonstrates adding structured error handling to synchronous project-loading code.
 *
 * Shows wrapping a synchronous loader with the global errorHandler (including category, severity, and context)
 * and provides an equivalent manual try/catch that reports errors via errorHandler.handleError.
 */
function exampleErrorHandling() {
    // OLD WAY (No Error Handling)
    // function loadProject(file) {
    //     const data = JSON.parse(file);
    //     canvas.innerHTML = data.html;
    // }
    
    // NEW WAY (With Error Handler)
    const { errorHandler, ErrorCategory, ErrorSeverity } = window;
    
    const loadProject = errorHandler.wrapSync((file) => {
        const data = JSON.parse(file);
        canvas.innerHTML = data.html;
    }, {
        category: ErrorCategory.FILE_IO,
        severity: ErrorSeverity.ERROR,
        context: { operation: 'load_project' }
    });
    
    // Or handle errors manually
    try {
        const data = JSON.parse(file);
        canvas.innerHTML = data.html;
    } catch (error) {
        errorHandler.handleError({
            message: 'Failed to load project',
            error,
            severity: ErrorSeverity.ERROR,
            category: ErrorCategory.FILE_IO
        });
    }
}

/**
 * Demonstrates using a centralized event manager to register, remove, and delegate DOM event listeners with automatic cleanup.
 *
 * Uses eventManager.addEventListener to register a tracked listener (returns a listener id), eventManager.removeEventListener to remove a specific listener by id, eventManager.removeAllListeners to remove all listeners from an element, and eventManager.addDelegatedListener to add a delegated listener on a container for a selector.
 */
function exampleEventManager() {
    // OLD WAY (Memory Leak Risk)
    // element.addEventListener('click', handler);
    // // No cleanup when element is removed
    
    // NEW WAY (Automatic Cleanup)
    const { eventManager } = window;
    
    const element = document.getElementById('myElement');
    const handler = (e) => console.log('Clicked!', e);
    
    // Add listener with automatic tracking
    const listenerId = eventManager.addEventListener(element, 'click', handler);
    
    // Remove specific listener
    eventManager.removeEventListener(listenerId);
    
    // Or remove all listeners from element
    eventManager.removeAllListeners(element);
    
    // Delegated event listener
    eventManager.addDelegatedListener(
        document.getElementById('canvas'),
        'click',
        '.component-item',
        function(e) {
            console.log('Component clicked:', this);
        }
    );
}

/**
 * Demonstrates safely handling user-provided HTML and URLs using the global Sanitizer.
 *
 * Shows how to sanitize HTML for insertion, escape HTML for plain-text display, use a safe innerHTML wrapper, and validate/sanitize URLs before assigning to anchors.
 */
function exampleSanitization() {
    // OLD WAY (XSS Vulnerability)
    // element.innerHTML = userInput;
    
    // NEW WAY (Safe)
    const { Sanitizer } = window;
    
    const userInput = '<script>alert("XSS")</script><p>Hello</p>';
    
    // Sanitize HTML
    const safe = Sanitizer.sanitizeHTML(userInput);
    element.innerHTML = safe; // Only <p>Hello</p> remains
    
    // Or use safe wrapper
    Sanitizer.safeSetInnerHTML(element, userInput);
    
    // Escape HTML for display
    const escaped = Sanitizer.escapeHTML('<script>alert("XSS")</script>');
    // Result: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
    
    // Sanitize URL
    const safeUrl = Sanitizer.sanitizeURL(userUrl);
    if (safeUrl) {
        link.href = safeUrl;
    }
}

/**
 * Demonstrates applying performance optimizations: debounced input handling, throttled updates, and cached DOM lookups.
 *
 * This example imports performance utilities and:
 * - replaces per-keystroke search handling with a debounced search call,
 * - applies a throttled function for frequent style updates,
 * - obtains cached DOM references via a DOM cache utility to avoid repeated queries.
 */
function examplePerformance() {
    // Import performance utilities
    import('./utils/performance.js').then(({ debounce, throttle, domCache }) => {
        // OLD WAY (Fires on every keystroke)
        // searchInput.addEventListener('input', function() {
        //     performSearch(this.value);
        // });
        
        // NEW WAY (Debounced)
        const debouncedSearch = debounce((value) => {
            performSearch(value);
        }, 300);
        
        searchInput.addEventListener('input', function() {
            debouncedSearch(this.value);
        });
        
        // Throttled style updates
        const throttledUpdate = throttle((property, value) => {
            if (selectedElement) {
                selectedElement.style[property] = value;
            }
        }, 100);
        
        // Cache DOM references
        const canvas = domCache.getElementById('canvas');
        const panel = domCache.getElementById('propertiesPanel');
        
        // Use cached references instead of repeated queries
        // OLD: document.getElementById('canvas') // Called 50+ times
        // NEW: domCache.getElementById('canvas') // Cached after first call
    });
}

/**
 * Validate multiple user inputs (ID, color, file, and URL) and apply or report results.
 *
 * Validates an element ID, a color value, and an uploaded file in sequence; on the first invalid result it calls `showError` with the validation error and stops. If the URL validation succeeds, assigns the value to `link.href`.
 */
function exampleValidation() {
    import('./utils/validation.js').then((validation) => {
        // Validate element ID
        const idResult = validation.validateId(userInputId);
        if (!idResult.isValid) {
            showError(idResult.error);
            return;
        }
        
        // Validate color
        const colorResult = validation.validateColor(userInputColor);
        if (!colorResult.isValid) {
            showError(colorResult.error);
            return;
        }
        
        // Validate file
        const fileResult = validation.validateFile(uploadedFile, {
            allowedTypes: ['.html', '.htm', '.json'],
            maxSize: 10 * 1024 * 1024 // 10MB
        });
        
        if (!fileResult.isValid) {
            showError(fileResult.error);
            return;
        }
        
        // Validate URL
        const urlResult = validation.validateURL(userInputUrl);
        if (urlResult.isValid) {
            link.href = userInputUrl;
        }
    });
}

/**
 * Demonstrates using centralized constants to replace magic numbers and hardcoded strings.
 *
 * Loads the constants module and applies values for UI timing, styling, file size checks,
 * error messages, and component type comparisons.
 */
function exampleConstants() {
    import('./config/constants.js').then((constants) => {
        const { UI, STYLE, FILE, ERROR_MESSAGES } = constants.default;
        
        // OLD WAY (Magic Numbers)
        // setTimeout(() => toast.remove(), 3000);
        // element.style.padding = '20px';
        
        // NEW WAY (Constants)
        setTimeout(() => toast.remove(), UI.TOAST_DURATION);
        element.style.padding = STYLE.DEFAULT_PADDING;
        
        // Use error messages
        if (file.size > FILE.MAX_FILE_SIZE) {
            showError(ERROR_MESSAGES.FILE_TOO_LARGE);
        }
        
        // Use component types
        if (COMPONENT.TYPES.CONTAINER === type) {
            // ...
        }
    });
}

/**
 * Set up a debounced, validated, and sanitized search input that updates UI visibility and application state.
 *
 * Asynchronously imports required modules, wires a debounced search handler to the search input, validates and sanitizes user input, toggles visibility of `.component-item` elements based on matches, reports validation issues via the centralized error handler, and stores the active filter in the state manager.
 */
async function completeExample() {
    // Import all modules
    const { stateManager } = await import('./stateManager.js');
    const { errorHandler, ErrorCategory, ErrorSeverity } = window;
    const { eventManager } = window;
    const { Sanitizer } = window;
    const { debounce } = await import('../utils/performance.js');
    const validation = await import('../utils/validation.js');
    const constants = await import('../config/constants.js');
    
    const { UI, ERROR_MESSAGES } = constants.default;
    
    // OLD FUNCTION (Multiple Issues)
    /*
    function setupSearch() {
        let searchInput = document.getElementById('search');
        searchInput.addEventListener('input', function() {
            let term = this.value;
            let components = document.querySelectorAll('.component-item');
            components.forEach(comp => {
                if (comp.textContent.toLowerCase().includes(term.toLowerCase())) {
                    comp.style.display = 'block';
                } else {
                    comp.style.display = 'none';
                }
            });
        });
    }
    */
    
    // NEW FUNCTION (Best Practices)
    const setupSearch = errorHandler.wrapSync(() => {
        // Cache DOM references
        const searchInput = domCache.getElementById('search');
        if (!searchInput) {
            throw new Error('Search input not found');
        }
        
        // Debounced search function
        const performSearch = debounce((term) => {
            // Sanitize input
            const sanitized = Sanitizer.escapeHTML(term.trim());
            
            // Validate input
            const result = validation.sanitizeAndValidate(sanitized, {
                maxLength: 100,
                allowHTML: false
            });
            
            if (!result.isValid) {
                errorHandler.handleError({
                    message: result.error,
                    severity: ErrorSeverity.WARNING,
                    category: ErrorCategory.VALIDATION
                });
                return;
            }
            
            // Perform search
            const components = document.querySelectorAll('.component-item');
            const searchTerm = result.value.toLowerCase();
            
            components.forEach(comp => {
                const text = comp.textContent.toLowerCase();
                comp.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
            
            // Update state
            stateManager.set('currentFilter', searchTerm);
            
        }, UI.SEARCH_DEBOUNCE);
        
        // Add event listener with tracking
        eventManager.addEventListener(searchInput, 'input', function() {
            performSearch(this.value);
        });
        
    }, {
        category: ErrorCategory.DOM,
        severity: ErrorSeverity.ERROR,
        context: { function: 'setupSearch' }
    });
    
    // Call the function
    setupSearch();
}

// Export examples
export {
    exampleStateManager,
    exampleErrorHandling,
    exampleEventManager,
    exampleSanitization,
    examplePerformance,
    exampleValidation,
    exampleConstants,
    completeExample
};