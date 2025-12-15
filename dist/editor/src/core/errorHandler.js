/**
 * Centralized Error Handler Module
 * Provides consistent error handling, logging, and user notifications
 * @module core/errorHandler
 */

/**
 * Error severity levels
 * @enum {string}
 */
const ErrorSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * Error categories for better organization
 * @enum {string}
 */
const ErrorCategory = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    FILE_IO: 'file_io',
    DOM: 'dom',
    SECURITY: 'security',
    UNKNOWN: 'unknown'
};

/**
 * Error Handler Class
 * Manages error logging, user notifications, and error recovery
 */
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Keep last 100 errors
        this.listeners = [];
        this.setupGlobalHandlers();
    }

    /**
     * Sets up global error handlers
     * @private
     */
    setupGlobalHandlers() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                error: event.error,
                severity: ErrorSeverity.ERROR,
                category: ErrorCategory.UNKNOWN,
                context: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: 'Unhandled Promise Rejection',
                error: event.reason,
                severity: ErrorSeverity.ERROR,
                category: ErrorCategory.UNKNOWN,
                context: {
                    promise: event.promise
                }
            });
        });
    }

    /**
     * Handles an error with logging and user notification
     * @param {Object} errorInfo - Error information
     * @param {string} errorInfo.message - Error message
     * @param {Error} [errorInfo.error] - Error object
     * @param {ErrorSeverity} [errorInfo.severity] - Error severity
     * @param {ErrorCategory} [errorInfo.category] - Error category
     * @param {Object} [errorInfo.context] - Additional context
     * @param {boolean} [errorInfo.notify] - Whether to notify user (default: true)
     * @returns {string} Error ID for tracking
     */
    handleError(errorInfo) {
        const {
            message,
            error = null,
            severity = ErrorSeverity.ERROR,
            category = ErrorCategory.UNKNOWN,
            context = {},
            notify = true
        } = errorInfo;

        // Create error record
        const errorRecord = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            message,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null,
            severity,
            category,
            context
        };

        // Store error
        this.errors.push(errorRecord);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift(); // Remove oldest error
        }

        // Log to console
        this.logError(errorRecord);

        // Notify user if requested
        if (notify) {
            this.notifyUser(errorRecord);
        }

        // Notify listeners
        this.notifyListeners(errorRecord);

        return errorRecord.id;
    }

    /**
     * Generates a unique error ID
     * @returns {string} Unique error ID
     * @private
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Logs error to console with appropriate styling
     * @param {Object} errorRecord - Error record to log
     * @private
     */
    logError(errorRecord) {
        const { severity, message, error, context } = errorRecord;

        const styles = {
            [ErrorSeverity.INFO]: 'color: #3b82f6',
            [ErrorSeverity.WARNING]: 'color: #f59e0b',
            [ErrorSeverity.ERROR]: 'color: #ef4444',
            [ErrorSeverity.CRITICAL]: 'color: #dc2626; font-weight: bold'
        };

        console.group(`%c[${severity.toUpperCase()}] ${message}`, styles[severity]);
        
        if (error) {
            console.error('Error:', error);
        }
        
        if (Object.keys(context).length > 0) {
            console.log('Context:', context);
        }
        
        console.groupEnd();
    }

    /**
     * Notifies user about the error
     * @param {Object} errorRecord - Error record
     * @private
     */
    notifyUser(errorRecord) {
        const { severity, message } = errorRecord;

        // Only show notifications for warnings and errors
        if (severity === ErrorSeverity.INFO) {
            return;
        }

        // Use toast notification if available
        if (typeof window.showToast === 'function') {
            const toastType = severity === ErrorSeverity.WARNING ? 'warning' : 'error';
            window.showToast(message, toastType);
        } else {
            // Fallback to alert for critical errors
            if (severity === ErrorSeverity.CRITICAL) {
                alert(`Critical Error: ${message}`);
            }
        }
    }

    /**
     * Adds an error listener
     * @param {Function} listener - Listener function
     */
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    /**
     * Removes an error listener
     * @param {Function} listener - Listener function to remove
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * Notifies all listeners about an error
     * @param {Object} errorRecord - Error record
     * @private
     */
    notifyListeners(errorRecord) {
        this.listeners.forEach(listener => {
            try {
                listener(errorRecord);
            } catch (error) {
                console.error('Error in error listener:', error);
            }
        });
    }

    /**
     * Gets all errors
     * @param {Object} filters - Filter options
     * @param {ErrorSeverity} [filters.severity] - Filter by severity
     * @param {ErrorCategory} [filters.category] - Filter by category
     * @returns {Array<Object>} Filtered errors
     */
    getErrors(filters = {}) {
        let filtered = [...this.errors];

        if (filters.severity) {
            filtered = filtered.filter(e => e.severity === filters.severity);
        }

        if (filters.category) {
            filtered = filtered.filter(e => e.category === filters.category);
        }

        return filtered;
    }

    /**
     * Clears all errors
     */
    clearErrors() {
        this.errors = [];
    }

    /**
     * Wraps an async function with error handling
     * @param {Function} fn - Async function to wrap
     * @param {Object} options - Error handling options
     * @returns {Function} Wrapped function
     */
    wrapAsync(fn, options = {}) {
        const {
            category = ErrorCategory.UNKNOWN,
            severity = ErrorSeverity.ERROR,
            context = {},
            onError = null
        } = options;

        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handleError({
                    message: error.message || 'An error occurred',
                    error,
                    severity,
                    category,
                    context: { ...context, args }
                });

                if (onError) {
                    return onError(error);
                }

                throw error;
            }
        };
    }

    /**
     * Wraps a synchronous function with error handling
     * @param {Function} fn - Function to wrap
     * @param {Object} options - Error handling options
     * @returns {Function} Wrapped function
     */
    wrapSync(fn, options = {}) {
        const {
            category = ErrorCategory.UNKNOWN,
            severity = ErrorSeverity.ERROR,
            context = {},
            onError = null
        } = options;

        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handleError({
                    message: error.message || 'An error occurred',
                    error,
                    severity,
                    category,
                    context: { ...context, args }
                });

                if (onError) {
                    return onError(error);
                }

                throw error;
            }
        };
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        errorHandler,
        ErrorHandler,
        ErrorSeverity,
        ErrorCategory
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.errorHandler = errorHandler;
    window.ErrorSeverity = ErrorSeverity;
    window.ErrorCategory = ErrorCategory;
}
