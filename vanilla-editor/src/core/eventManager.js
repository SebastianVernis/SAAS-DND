/**
 * Event Manager Module
 * Centralized event listener management to prevent memory leaks
 * @module core/eventManager
 */

/**
 * Event Manager Class
 * Tracks and manages event listeners to ensure proper cleanup
 */
class EventManager {
    constructor() {
        this.listeners = new Map(); // Map of element -> listeners
        this.listenerCounter = 0;
    }

    /**
     * Adds an event listener and tracks it for cleanup
     * @param {Element|Window|Document} element - The element to attach listener to
     * @param {string} eventType - The event type (e.g., 'click', 'input')
     * @param {Function} handler - The event handler function
     * @param {Object|boolean} options - Event listener options
     * @returns {string} Listener ID for removal
     */
    addEventListener(element, eventType, handler, options = {}) {
        if (!element || typeof handler !== 'function') {
            console.error('EventManager: Invalid element or handler');
            return null;
        }

        // Generate unique listener ID
        const listenerId = `listener_${this.listenerCounter++}`;

        // Create listener record
        const listenerRecord = {
            id: listenerId,
            element,
            eventType,
            handler,
            options,
            timestamp: Date.now()
        };

        // Store listener record
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        this.listeners.get(element).push(listenerRecord);

        // Attach the actual event listener
        element.addEventListener(eventType, handler, options);

        return listenerId;
    }

    /**
     * Removes a specific event listener by ID
     * @param {string} listenerId - The listener ID returned from addEventListener
     * @returns {boolean} True if listener was found and removed
     */
    removeEventListener(listenerId) {
        for (const [element, listeners] of this.listeners.entries()) {
            const index = listeners.findIndex(l => l.id === listenerId);
            
            if (index !== -1) {
                const listener = listeners[index];
                element.removeEventListener(listener.eventType, listener.handler, listener.options);
                listeners.splice(index, 1);

                // Clean up empty arrays
                if (listeners.length === 0) {
                    this.listeners.delete(element);
                }

                return true;
            }
        }

        return false;
    }

    /**
     * Removes all event listeners from a specific element
     * @param {Element|Window|Document} element - The element to remove listeners from
     * @returns {number} Number of listeners removed
     */
    removeAllListeners(element) {
        const listeners = this.listeners.get(element);
        
        if (!listeners) {
            return 0;
        }

        let count = 0;
        listeners.forEach(listener => {
            element.removeEventListener(listener.eventType, listener.handler, listener.options);
            count++;
        });

        this.listeners.delete(element);
        return count;
    }

    /**
     * Removes all event listeners of a specific type from an element
     * @param {Element|Window|Document} element - The element
     * @param {string} eventType - The event type to remove
     * @returns {number} Number of listeners removed
     */
    removeListenersByType(element, eventType) {
        const listeners = this.listeners.get(element);
        
        if (!listeners) {
            return 0;
        }

        const toRemove = listeners.filter(l => l.eventType === eventType);
        
        toRemove.forEach(listener => {
            element.removeEventListener(listener.eventType, listener.handler, listener.options);
        });

        // Update the listeners array
        const remaining = listeners.filter(l => l.eventType !== eventType);
        
        if (remaining.length === 0) {
            this.listeners.delete(element);
        } else {
            this.listeners.set(element, remaining);
        }

        return toRemove.length;
    }

    /**
     * Gets all listeners for an element
     * @param {Element|Window|Document} element - The element
     * @returns {Array<Object>} Array of listener records
     */
    getListeners(element) {
        return this.listeners.get(element) || [];
    }

    /**
     * Gets total number of tracked listeners
     * @returns {number} Total listener count
     */
    getListenerCount() {
        let count = 0;
        for (const listeners of this.listeners.values()) {
            count += listeners.length;
        }
        return count;
    }

    /**
     * Cleans up listeners for elements that are no longer in the DOM
     * @returns {number} Number of listeners cleaned up
     */
    cleanupDetachedListeners() {
        let cleanedCount = 0;

        for (const [element, listeners] of this.listeners.entries()) {
            // Check if element is still in the document
            if (!document.contains(element) && element !== window && element !== document) {
                listeners.forEach(listener => {
                    element.removeEventListener(listener.eventType, listener.handler, listener.options);
                    cleanedCount++;
                });
                this.listeners.delete(element);
            }
        }

        return cleanedCount;
    }

    /**
     * Adds a one-time event listener that auto-removes after firing
     * @param {Element|Window|Document} element - The element
     * @param {string} eventType - The event type
     * @param {Function} handler - The event handler
     * @param {Object} options - Event listener options
     * @returns {string} Listener ID
     */
    addEventListenerOnce(element, eventType, handler, options = {}) {
        const wrappedHandler = (event) => {
            handler(event);
            this.removeEventListener(listenerId);
        };

        const listenerId = this.addEventListener(element, eventType, wrappedHandler, options);
        return listenerId;
    }

    /**
     * Adds a delegated event listener (event delegation pattern)
     * @param {Element} parent - The parent element
     * @param {string} eventType - The event type
     * @param {string} selector - CSS selector for target elements
     * @param {Function} handler - The event handler
     * @param {Object} options - Event listener options
     * @returns {string} Listener ID
     */
    addDelegatedListener(parent, eventType, selector, handler, options = {}) {
        const delegatedHandler = (event) => {
            const target = event.target.closest(selector);
            if (target && parent.contains(target)) {
                handler.call(target, event);
            }
        };

        return this.addEventListener(parent, eventType, delegatedHandler, options);
    }

    /**
     * Clears all tracked listeners (use with caution!)
     * @returns {number} Number of listeners removed
     */
    clearAll() {
        let count = 0;

        for (const [element, listeners] of this.listeners.entries()) {
            listeners.forEach(listener => {
                element.removeEventListener(listener.eventType, listener.handler, listener.options);
                count++;
            });
        }

        this.listeners.clear();
        return count;
    }

    /**
     * Gets statistics about tracked listeners
     * @returns {Object} Statistics object
     */
    getStats() {
        const stats = {
            totalListeners: 0,
            elementCount: this.listeners.size,
            byEventType: {},
            oldestListener: null,
            newestListener: null
        };

        let oldestTimestamp = Infinity;
        let newestTimestamp = 0;

        for (const listeners of this.listeners.values()) {
            stats.totalListeners += listeners.length;

            listeners.forEach(listener => {
                // Count by event type
                stats.byEventType[listener.eventType] = (stats.byEventType[listener.eventType] || 0) + 1;

                // Track oldest and newest
                if (listener.timestamp < oldestTimestamp) {
                    oldestTimestamp = listener.timestamp;
                    stats.oldestListener = listener;
                }
                if (listener.timestamp > newestTimestamp) {
                    newestTimestamp = listener.timestamp;
                    stats.newestListener = listener;
                }
            });
        }

        return stats;
    }

    /**
     * Enables debug mode to log all listener operations
     * @param {boolean} enabled - Whether to enable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        
        if (enabled) {
            console.log('EventManager: Debug mode enabled');
            console.log('Current stats:', this.getStats());
        }
    }
}

// Create singleton instance
const eventManager = new EventManager();

// Auto-cleanup detached listeners every 30 seconds
setInterval(() => {
    const cleaned = eventManager.cleanupDetachedListeners();
    if (cleaned > 0) {
        console.log(`EventManager: Cleaned up ${cleaned} detached listeners`);
    }
}, 30000);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        eventManager,
        EventManager
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.eventManager = eventManager;
    window.EventManager = EventManager;
}
