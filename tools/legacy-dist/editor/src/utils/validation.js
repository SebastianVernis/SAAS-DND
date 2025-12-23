/**
 * Validation Utilities Module
 * Provides input validation functions for various data types
 * @module utils/validation
 */

import { VALIDATION, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Validate an element ID against configured constraints (type, emptiness, max length, and pattern).
 * @param {string} id - The ID string to validate.
 * @returns {{isValid: boolean, error: string|null}} `{ isValid: true, error: null }` if the ID is valid; otherwise `{ isValid: false, error }` with a descriptive failure message.
 */
export function validateId(id) {
    if (typeof id !== 'string') {
        return { isValid: false, error: 'ID must be a string' };
    }

    if (id.length === 0) {
        return { isValid: false, error: 'ID cannot be empty' };
    }

    if (id.length > VALIDATION.ID_MAX_LENGTH) {
        return { isValid: false, error: `ID cannot exceed ${VALIDATION.ID_MAX_LENGTH} characters` };
    }

    if (!VALIDATION.ID_PATTERN.test(id)) {
        return { isValid: false, error: ERROR_MESSAGES.INVALID_ID };
    }

    return { isValid: true, error: null };
}

/**
 * Validate a CSS class name string, allowing multiple class tokens separated by whitespace.
 * @param {string} className - The class name or space-separated class list to validate; an empty string is considered valid.
 * @returns {{isValid: boolean, error: string|null}} An object with `isValid` indicating validity and `error` containing a message when invalid (otherwise `null`).
 */
export function validateClassName(className) {
    if (typeof className !== 'string') {
        return { isValid: false, error: 'Class name must be a string' };
    }

    if (className.length === 0) {
        return { isValid: true, error: null }; // Empty is valid
    }

    if (className.length > VALIDATION.CLASS_MAX_LENGTH) {
        return { isValid: false, error: `Class name cannot exceed ${VALIDATION.CLASS_MAX_LENGTH} characters` };
    }

    // Split by spaces for multiple classes
    const classes = className.split(/\s+/);
    for (const cls of classes) {
        if (!VALIDATION.CLASS_PATTERN.test(cls)) {
            return { isValid: false, error: `${ERROR_MESSAGES.INVALID_CLASS}: ${cls}` };
        }
    }

    return { isValid: true, error: null };
}

/**
 * Validate that a string is a safe, well-formed URL, optionally allowing relative paths.
 * @param {string} url - The URL string to validate.
 * @param {boolean} [allowRelative=false] - If true, accept relative URLs that start with '/' or './'.
 * @returns {{isValid: boolean, error: string|null}} `isValid` is `true` when the URL is acceptable; `error` contains a message when invalid.
 */
export function validateURL(url, allowRelative = false) {
    if (typeof url !== 'string') {
        return { isValid: false, error: 'URL must be a string' };
    }

    if (url.length === 0) {
        return { isValid: false, error: 'URL cannot be empty' };
    }

    // Allow relative URLs if specified
    if (allowRelative && (url.startsWith('/') || url.startsWith('./'))) {
        return { isValid: true, error: null };
    }

    // Check for dangerous protocols
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:')) {
        return { isValid: false, error: 'Dangerous URL protocol detected' };
    }

    // Try to parse as URL
    try {
        new URL(url);
        return { isValid: true, error: null };
    } catch (e) {
        // If not a valid absolute URL, check pattern
        if (VALIDATION.URL_PATTERN.test(url)) {
            return { isValid: true, error: null };
        }
        return { isValid: false, error: ERROR_MESSAGES.INVALID_URL };
    }
}

/**
 * Determine whether a string represents a valid CSS color value.
 * Accepts hex codes, `rgb(...)`, `rgba(...)`, and a set of common named colors.
 * @param {string} color - Color string to validate (hex, `rgb(...)`, `rgba(...)`, or named color; named colors are matched case-insensitively).
 * @returns {{ isValid: boolean, error: string|null }} `isValid` is `true` when the input matches a supported color format; `error` contains a message when invalid.
 */
export function validateColor(color) {
    if (typeof color !== 'string') {
        return { isValid: false, error: 'Color must be a string' };
    }

    if (color.length === 0) {
        return { isValid: false, error: 'Color cannot be empty' };
    }

    // Check hex color
    if (VALIDATION.HEX_COLOR_PATTERN.test(color)) {
        return { isValid: true, error: null };
    }

    // Check RGB color
    if (VALIDATION.RGB_COLOR_PATTERN.test(color)) {
        return { isValid: true, error: null };
    }

    // Check RGBA color
    if (VALIDATION.RGBA_COLOR_PATTERN.test(color)) {
        return { isValid: true, error: null };
    }

    // Check named colors (basic list)
    const namedColors = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
        'pink', 'brown', 'gray', 'grey', 'transparent', 'currentColor'
    ];
    if (namedColors.includes(color.toLowerCase())) {
        return { isValid: true, error: null };
    }

    return { isValid: false, error: ERROR_MESSAGES.INVALID_COLOR };
}

/**
 * Check whether a string is a valid CSS dimension value.
 *
 * Accepts the keywords `auto`, `inherit`, `initial`, and `unset` (case-insensitive), or values matching the module's CSS dimension pattern.
 * The input must be a non-empty string.
 *
 * @param {string} dimension - The CSS dimension to validate.
 * @returns {{isValid: boolean, error: string|null}} An object with `isValid` set to `true` if the dimension is valid, `false` otherwise, and `error` containing a human-readable message or `null` when valid.
 */
export function validateDimension(dimension) {
    if (typeof dimension !== 'string') {
        return { isValid: false, error: 'Dimension must be a string' };
    }

    if (dimension.length === 0) {
        return { isValid: false, error: 'Dimension cannot be empty' };
    }

    // Allow 'auto' and 'inherit'
    if (['auto', 'inherit', 'initial', 'unset'].includes(dimension.toLowerCase())) {
        return { isValid: true, error: null };
    }

    if (VALIDATION.DIMENSION_PATTERN.test(dimension)) {
        return { isValid: true, error: null };
    }

    return { isValid: false, error: ERROR_MESSAGES.INVALID_DIMENSION };
}

/**
 * Validate that a value represents an integer within optional bounds.
 *
 * @param {string|number} value - The input to validate; numeric strings are parsed.
 * @param {Object} [options] - Validation options.
 * @param {number} [options.min] - Minimum allowed value (inclusive).
 * @param {number} [options.max] - Maximum allowed value (inclusive).
 * @returns {{isValid: boolean, error: string|null, value?: number}} `isValid` indicates success; `error` contains a message on failure; on success `value` is the parsed integer.
 */
export function validateInteger(value, options = {}) {
    const { min, max } = options;

    if (typeof value === 'number') {
        if (!Number.isInteger(value)) {
            return { isValid: false, error: 'Value must be an integer' };
        }
    } else if (typeof value === 'string') {
        if (!VALIDATION.INTEGER_PATTERN.test(value)) {
            return { isValid: false, error: 'Value must be an integer' };
        }
        value = parseInt(value, 10);
    } else {
        return { isValid: false, error: 'Value must be a number or string' };
    }

    if (min !== undefined && value < min) {
        return { isValid: false, error: `Value must be at least ${min}` };
    }

    if (max !== undefined && value > max) {
        return { isValid: false, error: `Value must be at most ${max}` };
    }

    return { isValid: true, error: null, value };
}

/**
 * Validate that a value represents a finite floating-point number and optionally enforce numeric bounds.
 *
 * Accepts a number or a numeric string; when valid returns the parsed numeric value.
 * @param {string|number} value - The value to validate (number or numeric string).
 * @param {Object} [options] - Validation options.
 * @param {number} [options.min] - Minimum allowed value (inclusive).
 * @param {number} [options.max] - Maximum allowed value (inclusive).
 * @returns {{isValid: boolean, error: string|null, value?: number}} An object containing `isValid`, an `error` message when invalid, and the numeric `value` when valid.
 */
export function validateFloat(value, options = {}) {
    const { min, max } = options;

    if (typeof value === 'number') {
        if (!isFinite(value)) {
            return { isValid: false, error: 'Value must be a finite number' };
        }
    } else if (typeof value === 'string') {
        if (!VALIDATION.FLOAT_PATTERN.test(value)) {
            return { isValid: false, error: 'Value must be a number' };
        }
        value = parseFloat(value);
    } else {
        return { isValid: false, error: 'Value must be a number or string' };
    }

    if (min !== undefined && value < min) {
        return { isValid: false, error: `Value must be at least ${min}` };
    }

    if (max !== undefined && value > max) {
        return { isValid: false, error: `Value must be at most ${max}` };
    }

    return { isValid: true, error: null, value };
}

/**
 * Validate a File object against optional allowed types and maximum size.
 *
 * @param {File} file - File instance to validate.
 * @param {Object} [options] - Validation options.
 * @param {Array<string>} [options.allowedTypes] - Allowed MIME types or extensions (e.g., "image/png", "image/*", ".jpg").
 * @param {number} [options.maxSize] - Maximum file size in bytes.
 * @returns {{isValid: boolean, error: string|null}} Validation result: `isValid` indicates success; `error` contains a message when invalid.
 */
export function validateFile(file, options = {}) {
    if (!(file instanceof File)) {
        return { isValid: false, error: 'Invalid file object' };
    }

    const { allowedTypes, maxSize } = options;

    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
        const fileType = file.type;
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        
        const isTypeAllowed = allowedTypes.some(type => {
            if (type.startsWith('.')) {
                return fileExt === type;
            }
            return fileType === type || fileType.startsWith(type.split('/')[0] + '/');
        });

        if (!isTypeAllowed) {
            return { isValid: false, error: ERROR_MESSAGES.FILE_TYPE_NOT_SUPPORTED };
        }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        return { isValid: false, error: `${ERROR_MESSAGES.FILE_TOO_LARGE}: ${maxSizeMB}MB` };
    }

    return { isValid: true, error: null };
}

/**
 * Determines whether a string is a syntactically valid email address.
 * @param {string} email - The email address to validate.
 * @returns {{isValid: boolean, error: string|null}} `isValid` is `true` when the email matches a basic email pattern; `error` contains a failure message when invalid.
 */
export function validateEmail(email) {
    if (typeof email !== 'string') {
        return { isValid: false, error: 'Email must be a string' };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
        return { isValid: false, error: 'Invalid email address' };
    }

    return { isValid: true, error: null };
}

/**
 * Determine whether a component type is allowed.
 * @param {string} type - Component type identifier to validate.
 * @param {Array<string>} validTypes - Array of allowed component type identifiers.
 * @returns {{isValid: boolean, error: string|null}} `isValid: true` and `error: null` when allowed; otherwise `isValid: false` and `error` contains a message.
 */
export function validateComponentType(type, validTypes) {
    if (typeof type !== 'string') {
        return { isValid: false, error: 'Component type must be a string' };
    }

    if (!validTypes.includes(type)) {
        return { isValid: false, error: `Invalid component type: ${type}` };
    }

    return { isValid: true, error: null };
}

/**
 * Validate an object's fields using a schema of field validators.
 *
 * @param {Object} obj - The object whose fields will be validated.
 * @param {Object<string, function>} schema - Map of field names to validator functions. Each validator is called with the field value and must return an object of the shape `{ isValid: boolean, error: string|null }`.
 * @returns {{ isValid: boolean, errors: Object<string, string> }} An object with `isValid` set to `true` when all validators pass, and `errors` mapping field names to error messages for each failing validator.
 */
export function validateObject(obj, schema) {
    const errors = {};
    let isValid = true;

    for (const [key, validator] of Object.entries(schema)) {
        const value = obj[key];
        const result = validator(value);

        if (!result.isValid) {
            errors[key] = result.error;
            isValid = false;
        }
    }

    return { isValid, errors };
}

/**
 * Sanitizes and validates a string input according to provided options.
 *
 * Trims the input (when enabled), enforces a maximum length, and strips HTML tags unless HTML is allowed.
 *
 * @param {string} input - The string to sanitize and validate.
 * @param {Object} [options] - Validation options.
 * @param {number} [options.maxLength=1000] - Maximum allowed length for the input.
 * @param {boolean} [options.allowHTML=false] - If true, HTML tags are preserved; otherwise tags are removed.
 * @param {boolean} [options.trim=true] - If true, leading and trailing whitespace is removed before validation.
 * @returns {{isValid: boolean, error: string|null, value: string}} An object with `isValid`, an `error` message when invalid, and the sanitized `value`.
export function sanitizeAndValidate(input, options = {}) {
    const {
        maxLength = 1000,
        allowHTML = false,
        trim = true
    } = options;

    if (typeof input !== 'string') {
        return { isValid: false, error: 'Input must be a string', value: '' };
    }

    let sanitized = input;

    // Trim if requested
    if (trim) {
        sanitized = sanitized.trim();
    }

    // Check length
    if (sanitized.length > maxLength) {
        return { isValid: false, error: `Input exceeds maximum length of ${maxLength}`, value: sanitized };
    }

    // Remove HTML if not allowed
    if (!allowHTML) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    return { isValid: true, error: null, value: sanitized };
}

// Export all validation functions
export default {
    validateId,
    validateClassName,
    validateURL,
    validateColor,
    validateDimension,
    validateInteger,
    validateFloat,
    validateFile,
    validateEmail,
    validateComponentType,
    validateObject,
    sanitizeAndValidate
};