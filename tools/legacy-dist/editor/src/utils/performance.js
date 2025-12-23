/**
 * Performance Utilities Module
 * Provides debouncing, throttling, and other performance optimization utilities
 * @module utils/performance
 */

/**
 * Create a debounced version of a function that delays invocation until calls stop for the specified wait time.
 *
 * @param {Function} func - Function to debounce.
 * @param {number} [wait=300] - Delay in milliseconds to wait after the last call before invoking `func`.
 * @param {Object} [options={}] - Configuration options.
 * @param {boolean} [options.leading=false] - If true, invoke `func` on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true] - If true, invoke `func` on the trailing edge of the timeout.
 * @returns {Function} A debounced function that forwards calls to `func`. The returned function has `.cancel()` to cancel pending invocations and `.flush()` to immediately run any pending trailing invocation and return its result.
 */
export function debounce(func, wait = 300, options = {}) {
    const { leading = false, trailing = true } = options;
    let timeout = null;
    let lastArgs = null;
    let lastThis = null;
    let result = null;

    /**
     * Invoke the original function with the last recorded `this` context and arguments, then clear the stored references.
     *
     * This clears the stored context and arguments after invocation to avoid retaining references.
     * @returns {*} The value returned by the invoked function.
     */
    function invokeFunc() {
        result = func.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
        return result;
    }

    /**
     * Invoke the wrapped function immediately when the `leading` option is enabled.
     *
     * When `leading` is true, calls `invokeFunc()` and stores its return value in the outer `result` variable.
     */
    function leadingEdge() {
        if (leading) {
            result = invokeFunc();
        }
    }

    /**
     * Handle the debounce's trailing edge: clear the active timeout, invoke the original function if a trailing call is pending, and reset stored invocation state.
     *
     * @returns {any} The result of invoking the wrapped function when a trailing call is performed, or the previously cached `result` otherwise.
     */
    function trailingEdge() {
        timeout = null;
        if (trailing && lastArgs) {
            return invokeFunc();
        }
        lastArgs = lastThis = null;
        return result;
    }

    /**
     * Cancels any pending scheduled invocation and resets internal scheduling state and stored invocation context.
     */
    function cancel() {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = lastArgs = lastThis = null;
    }

    /**
     * Immediately execute a pending trailing debounced invocation (if any) and return its result.
     * @returns {any} The stored `result` if there is no pending timeout, otherwise the value returned by executing the trailing edge invocation.
     */
    function flush() {
        return timeout === null ? result : trailingEdge();
    }

    /**
     * Debounced wrapper invoked in place of the original function; schedules leading/trailing invocation based on debounce configuration.
     * @param {...any} args - Arguments forwarded to the wrapped function call.
     * @returns {any} The most recent result produced by the wrapped function invocation, or the previous result if no invocation occurred.
     */
    function debounced(...args) {
        lastArgs = args;
        lastThis = this;

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        if (leading && timeout === null) {
            leadingEdge();
        }

        timeout = setTimeout(trailingEdge, wait);
        return result;
    }

    debounced.cancel = cancel;
    debounced.flush = flush;

    return debounced;
}

/**
 * Creates a function that invokes `func` at most once every `wait` milliseconds,
 * honoring the `leading` and `trailing` options to control edge invocation.
 *
 * @param {Function} func - The function to throttle.
 * @param {number} [wait=100] - Minimum time in milliseconds between invocations.
 * @param {Object} [options={}] - Configuration options.
 * @param {boolean} [options.leading=true] - If `true`, invoke on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true] - If `true`, invoke on the trailing edge of the timeout.
 * @returns {Function} A throttled version of `func` that has two additional methods:
 *   - `cancel()`: cancels any pending invocation and resets internal state.
 *   - `flush()`: immediately invokes a pending trailing call (if any) and returns its result.
 */
export function throttle(func, wait = 100, options = {}) {
    const { leading = true, trailing = true } = options;
    let timeout = null;
    let previous = 0;
    let lastArgs = null;
    let lastThis = null;
    let result = null;

    /**
     * Invoke the wrapped function with the stored `this` and arguments, record the invocation time, and clear the stored context.
     * @param {number} time - The timestamp to record as the last invocation time.
     * @returns {*} The value returned by the invoked function.
     */
    function invokeFunc(time) {
        previous = time;
        result = func.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
        return result;
    }

    /**
     * Begin a new throttle interval: record the current timestamp, schedule the trailing timer, and invoke the wrapped function immediately when leading behavior is enabled.
     * @param {number} time - The current timestamp used to mark the start of the interval.
     * @returns {*} The result of the immediate invocation when leading is enabled, or the last stored result otherwise.
     */
    function leadingEdge(time) {
        previous = time;
        timeout = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
    }

    /**
     * Compute the remaining milliseconds to wait before the next allowed invocation based on the last timestamp.
     * @param {number} time - Current timestamp (typically Date.now() or performance.now()).
     * @returns {number} Remaining time in milliseconds until the next invocation is permitted; may be negative if the wait has already elapsed.
     */
    function remainingWait(time) {
        const timeSinceLastCall = time - previous;
        return wait - timeSinceLastCall;
    }

    /**
     * Handle an expiring internal timer: if the required wait has elapsed, run the pending trailing invocation and return its result; otherwise schedule the next timer for the remaining wait.
     * @returns {*} The result of the trailing invocation when executed, or `undefined` if no invocation occurred and a new timer was scheduled.
     */
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timeout = setTimeout(timerExpired, remainingWait(time));
    }

    /**
     * Handle the trailing invocation when a scheduled timer expires.
     * @param {number} time - The current timestamp used to invoke the wrapped function.
     * @returns {*} The result produced by invoking the wrapped function if a trailing call ran; otherwise the previous result.
     */
    function trailingEdge(time) {
        timeout = null;
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = null;
        return result;
    }

    /**
     * Determine whether a call at the given timestamp should trigger invocation.
     * @param {number} time - Current timestamp in milliseconds.
     * @returns {boolean} `true` if this is the first call or `wait` milliseconds or more have elapsed since the last invocation, `false` otherwise.
     */
    function shouldInvoke(time) {
        const timeSinceLastCall = time - previous;
        return previous === 0 || timeSinceLastCall >= wait;
    }

    /**
     * Cancel any pending scheduled invocation and reset the internal timing and argument state.
     *
     * Clears the active timeout (if any) and resets stored previous timestamp, last arguments, and last `this` reference.
     */
    function cancel() {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        previous = 0;
        timeout = lastArgs = lastThis = null;
    }

    /**
     * Immediately executes a pending trailing invocation if one is scheduled and returns the last stored result.
     *
     * @returns {*} The last returned value from the wrapped function; if a trailing invocation was pending, returns its result.
     */
    function flush() {
        return timeout === null ? result : trailingEdge(Date.now());
    }

    /**
     * Throttled wrapper that limits how frequently the underlying function is invoked based on the configured wait, leading, and trailing options.
     *
     * @returns {*} The return value from the most recent invocation of the wrapped function, or the last cached result if no new invocation occurred.
     */
    function throttled(...args) {
        const time = Date.now();
        lastArgs = args;
        lastThis = this;

        if (!previous && !leading) {
            previous = time;
        }

        const remaining = remainingWait(time);

        if (shouldInvoke(time)) {
            if (timeout === null) {
                return leadingEdge(time);
            }
            if (trailing) {
                timeout = setTimeout(timerExpired, wait);
                return invokeFunc(time);
            }
        }

        if (timeout === null) {
            timeout = setTimeout(timerExpired, remaining);
        }

        return result;
    }

    throttled.cancel = cancel;
    throttled.flush = flush;

    return throttled;
}

/**
 * Caches DOM element references for improved performance
 */
export class DOMCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Gets an element by ID, using cache if available
     * @param {string} id - Element ID
     * @returns {Element|null} The element or null
     */
    getElementById(id) {
        if (this.cache.has(id)) {
            const element = this.cache.get(id);
            // Verify element is still in DOM
            if (document.contains(element)) {
                return element;
            }
            // Remove stale reference
            this.cache.delete(id);
        }

        const element = document.getElementById(id);
        if (element) {
            this.cache.set(id, element);
        }
        return element;
    }

    /**
     * Gets elements by selector, with optional caching
     * @param {string} selector - CSS selector
     * @param {boolean} cache - Whether to cache the result
     * @returns {NodeList} The elements
     */
    querySelectorAll(selector, cache = false) {
        if (cache && this.cache.has(selector)) {
            return this.cache.get(selector);
        }

        const elements = document.querySelectorAll(selector);
        if (cache) {
            this.cache.set(selector, elements);
        }
        return elements;
    }

    /**
     * Gets a single element by selector, with optional caching
     * @param {string} selector - CSS selector
     * @param {boolean} cache - Whether to cache the result
     * @returns {Element|null} The element or null
     */
    querySelector(selector, cache = false) {
        if (cache && this.cache.has(selector)) {
            const element = this.cache.get(selector);
            if (document.contains(element)) {
                return element;
            }
            this.cache.delete(selector);
        }

        const element = document.querySelector(selector);
        if (cache && element) {
            this.cache.set(selector, element);
        }
        return element;
    }

    /**
     * Clears the cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Removes a specific cache entry
     * @param {string} key - Cache key to remove
     */
    remove(key) {
        this.cache.delete(key);
    }

    /**
     * Gets cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * Request Animation Frame wrapper for smooth animations
 * @param {Function} callback - Function to call on next frame
 * @returns {number} Request ID
 */
export function nextFrame(callback) {
    return requestAnimationFrame(callback);
}

/**
 * Cancels a request animation frame
 * @param {number} id - Request ID to cancel
 */
export function cancelFrame(id) {
    cancelAnimationFrame(id);
}

/**
 * Execute multiple DOM read callbacks together in the next animation frame to batch reads and reduce layout thrashing.
 * @param {Array<Function>} reads - Functions that perform DOM reads; each function's return value will be collected.
 * @returns {Promise<Array>} An array containing the return value from each read function, in the same order.
 */
export function batchReads(reads) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            const results = reads.map(read => read());
            resolve(results);
        });
    });
}

/**
 * Run multiple DOM write callbacks inside a single animation frame to reduce layout thrashing.
 * @param {Array<Function>} writes - Functions that perform DOM write operations; each will be invoked in order.
 * @returns {Promise<void>} No value.
 */
export function batchWrites(writes) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            writes.forEach(write => write());
            resolve();
        });
    });
}

/**
 * Wraps a function so its execution time is measured and logged with the given label.
 * @param {Function} func - The function to wrap and measure.
 * @param {string} label - Label used in the console log for the measured duration.
 * @returns {Function} A wrapper that calls the original function, logs elapsed time to the console as "[Performance] <label>: <ms>ms", and returns the original function's result.
 */
export function measurePerformance(func, label) {
    return function(...args) {
        const start = performance.now();
        const result = func.apply(this, args);
        const end = performance.now();
        console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    };
}

/**
 * Lazy loads an image.
 * @param {string} src - Image URL to load.
 * @param {Object} [options] - Optional settings.
 * @param {string} [options.crossOrigin] - Value to set on `img.crossOrigin` (e.g., 'anonymous' or 'use-credentials').
 * @returns {Promise<HTMLImageElement>} The loaded HTMLImageElement.
 */
export function lazyLoadImage(src, options = {}) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        if (options.crossOrigin) {
            img.crossOrigin = options.crossOrigin;
        }

        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

/**
 * Observe an element and invoke the callback when it becomes visible according to the provided intersection options.
 * @param {Element} element - Element to observe.
 * @param {(entry: IntersectionObserverEntry) => void} callback - Called with the intersection entry when the element intersects; the observer will unobserve the element after invoking this callback.
 * @param {Object} [options] - IntersectionObserver options; defaults to { root: null, rootMargin: '0px', threshold: 0.1 }.
 * @returns {IntersectionObserver} The observer instance observing the element.
 */
export function observeIntersection(element, callback, options = {}) {
    const defaultOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
        ...options
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry);
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);

    observer.observe(element);
    return observer;
}

/**
 * Create a memoized version of a function that caches results keyed by its arguments.
 *
 * @param {Function} func - The function whose results should be cached.
 * @param {Function} [resolver] - Optional function that receives the same arguments as `func` and returns a cache key; if omitted, `JSON.stringify(args)` is used.
 * @returns {Function} A memoized function that returns cached results for previously seen keys and computes-and-caches results for new keys. The returned function exposes a `cache` property (Map) and a `clear()` method to empty the cache.
 */
export function memoize(func, resolver) {
    const cache = new Map();

    /**
     * Invoke the memoized function, returning a cached result when available.
     *
     * The cache key is produced by the provided `resolver(...args)` if given; otherwise `JSON.stringify(args)` is used.
     * If a cached value exists for the key, it is returned. Otherwise the original `func` is called with the provided
     * arguments, its result is stored in the cache, and the result is returned.
     *
     * @param {...*} args - Arguments forwarded to the original function.
     * @returns {*} The cached or newly computed result of calling the original function with `args`.
     */
    function memoized(...args) {
        const key = resolver ? resolver(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = func.apply(this, args);
        cache.set(key, result);
        return result;
    }

    memoized.cache = cache;
    memoized.clear = () => cache.clear();

    return memoized;
}

/**
 * Creates a singleton DOM cache instance
 */
export const domCache = new DOMCache();

// Export all utilities
export default {
    debounce,
    throttle,
    DOMCache,
    domCache,
    nextFrame,
    cancelFrame,
    batchReads,
    batchWrites,
    measurePerformance,
    lazyLoadImage,
    observeIntersection,
    memoize
};