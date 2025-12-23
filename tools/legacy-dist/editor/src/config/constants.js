/**
 * Application Constants
 * Centralized configuration for all magic numbers and strings
 * @module config/constants
 */

/**
 * UI Constants
 */
export const UI = {
    // Toast notifications
    TOAST_DURATION: 3000,
    TOAST_FADE_DURATION: 300,
    
    // Debounce/Throttle timings
    SEARCH_DEBOUNCE: 300,
    STYLE_UPDATE_THROTTLE: 100,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    
    // Canvas
    CANVAS_MIN_HEIGHT: 400,
    CANVAS_DEFAULT_WIDTH: '100%',
    CANVAS_PADDING: 20,
    
    // Grid
    GRID_SIZE: 10,
    GRID_SNAP_THRESHOLD: 5,
    
    // Selection
    SELECTION_BORDER_WIDTH: 2,
    SELECTION_BORDER_COLOR: '#3b82f6',
    SELECTION_HANDLE_SIZE: 8,
    
    // Drag and Drop
    DRAG_THRESHOLD: 5,
    DROP_INDICATOR_HEIGHT: 2,
    DROP_INDICATOR_COLOR: '#3b82f6',
    AUTO_SCROLL_THRESHOLD: 50,
    AUTO_SCROLL_SPEED: 10,
    
    // Panels
    PROPERTIES_PANEL_WIDTH: 300,
    COMPONENTS_PANEL_WIDTH: 250,
    
    // Z-index layers
    Z_INDEX: {
        CANVAS: 1,
        SELECTION: 100,
        DRAG_PREVIEW: 200,
        DROP_INDICATOR: 150,
        MODAL: 1000,
        TOAST: 2000,
        TOOLTIP: 1500
    }
};

/**
 * File Constants
 */
export const FILE = {
    // Supported file types
    SUPPORTED_EXTENSIONS: ['.html', '.htm', '.json'],
    SUPPORTED_MIME_TYPES: ['text/html', 'application/json'],
    
    // File size limits (in bytes)
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_PROJECT_SIZE: 50 * 1024 * 1024, // 50MB
    
    // Export
    EXPORT_FILENAME_PREFIX: 'dragndrop-project',
    EXPORT_HTML_FILENAME: 'index.html',
    EXPORT_CSS_FILENAME: 'styles.css',
    EXPORT_JS_FILENAME: 'script.js',
    
    // Project file
    PROJECT_FILE_EXTENSION: '.dnd.json',
    PROJECT_VERSION: '4.0.0'
};

/**
 * Component Constants
 */
export const COMPONENT = {
    // ID generation
    ID_PREFIX: 'element-',
    
    // Component categories
    CATEGORIES: {
        ALL: 'todas',
        LAYOUT: 'layout',
        TEXT: 'texto',
        MEDIA: 'media',
        FORM: 'formulario',
        UI: 'ui',
        ADVANCED: 'avanzado'
    },
    
    // Component types
    TYPES: {
        // Layout
        CONTAINER: 'contenedor',
        SECTION: 'seccion',
        ROW: 'fila',
        COLUMN: 'columna',
        GRID_2: 'grid-2',
        GRID_3: 'grid-3',
        
        // Text
        H1: 'h1',
        H2: 'h2',
        H3: 'h3',
        PARAGRAPH: 'parrafo',
        TEXT: 'texto',
        LIST_UL: 'lista-ul',
        LIST_OL: 'lista-ol',
        
        // Media
        IMAGE: 'imagen',
        VIDEO: 'video',
        IFRAME: 'iframe',
        
        // Form
        INPUT: 'input',
        TEXTAREA: 'textarea',
        BUTTON: 'boton',
        CHECKBOX: 'checkbox',
        RADIO: 'radio',
        SELECT: 'select',
        
        // UI
        BUTTON_PRIMARY: 'btn-primary',
        BUTTON_SECONDARY: 'btn-secondary',
        CARD: 'card',
        NAVBAR: 'navbar',
        FOOTER: 'footer',
        HERO: 'hero',
        
        // Advanced
        TABS: 'tabs',
        ACCORDION: 'accordion',
        MODAL: 'modal',
        CAROUSEL: 'carousel',
        ALERT: 'alert',
        BADGE: 'badge'
    }
};

/**
 * Style Constants
 */
export const STYLE = {
    // Default dimensions
    DEFAULT_PADDING: '20px',
    DEFAULT_MARGIN: '0px',
    DEFAULT_BORDER: '1px solid #ccc',
    DEFAULT_BORDER_RADIUS: '4px',
    
    // Colors
    PRIMARY_COLOR: '#3b82f6',
    SECONDARY_COLOR: '#64748b',
    SUCCESS_COLOR: '#10b981',
    WARNING_COLOR: '#f59e0b',
    ERROR_COLOR: '#ef4444',
    
    // Typography
    FONT_SIZES: {
        XS: '0.75rem',
        SM: '0.875rem',
        BASE: '1rem',
        LG: '1.125rem',
        XL: '1.25rem',
        '2XL': '1.5rem',
        '3XL': '1.875rem',
        '4XL': '2.25rem',
        '5XL': '3rem'
    },
    
    FONT_WEIGHTS: {
        LIGHT: '300',
        NORMAL: '400',
        MEDIUM: '500',
        SEMIBOLD: '600',
        BOLD: '700',
        EXTRABOLD: '800'
    },
    
    // Spacing scale
    SPACING: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem'
    },
    
    // Breakpoints
    BREAKPOINTS: {
        SM: '640px',
        MD: '768px',
        LG: '1024px',
        XL: '1280px',
        '2XL': '1536px'
    }
};

/**
 * Template Constants
 */
export const TEMPLATE = {
    CATEGORIES: {
        ALL: 'todas',
        BUSINESS: 'negocios',
        PERSONAL: 'personal',
        BLOG: 'blog',
        SERVICES: 'servicios',
        STORE: 'tienda'
    },
    
    IDS: {
        SAAS_LANDING: 'saas-landing',
        PORTFOLIO: 'portfolio',
        BLOG: 'blog-minimalista',
        CONTACT: 'contacto',
        STORE: 'tienda-online'
    }
};

/**
 * Keyboard Shortcuts
 */
export const SHORTCUTS = {
    DELETE: 'Delete',
    SAVE: 'Control+s',
    UNDO: 'Control+z',
    REDO: 'Control+y',
    COPY: 'Control+c',
    PASTE: 'Control+v',
    SELECT_ALL: 'Control+a',
    ESCAPE: 'Escape'
};

/**
 * API Constants
 */
export const API = {
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Headers
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

/**
 * Validation Constants
 */
export const VALIDATION = {
    // Element ID
    ID_PATTERN: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    ID_MAX_LENGTH: 100,
    
    // Class names
    CLASS_PATTERN: /^[a-zA-Z_-][a-zA-Z0-9_-]*$/,
    CLASS_MAX_LENGTH: 100,
    
    // URLs
    URL_PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    
    // Colors
    HEX_COLOR_PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    RGB_COLOR_PATTERN: /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
    RGBA_COLOR_PATTERN: /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/,
    
    // Dimensions
    DIMENSION_PATTERN: /^\d+(\.\d+)?(px|em|rem|%|vh|vw)$/,
    
    // Numbers
    INTEGER_PATTERN: /^-?\d+$/,
    FLOAT_PATTERN: /^-?\d+(\.\d+)?$/
};

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
    // File errors
    FILE_TOO_LARGE: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
    FILE_TYPE_NOT_SUPPORTED: 'Tipo de archivo no soportado',
    FILE_READ_ERROR: 'Error al leer el archivo',
    
    // Validation errors
    INVALID_ID: 'ID inválido. Debe comenzar con una letra y contener solo letras, números, guiones y guiones bajos',
    INVALID_CLASS: 'Nombre de clase inválido',
    INVALID_URL: 'URL inválida',
    INVALID_COLOR: 'Color inválido',
    INVALID_DIMENSION: 'Dimensión inválida',
    
    // Component errors
    COMPONENT_NOT_FOUND: 'Componente no encontrado',
    COMPONENT_CREATE_ERROR: 'Error al crear el componente',
    
    // Project errors
    PROJECT_LOAD_ERROR: 'Error al cargar el proyecto',
    PROJECT_SAVE_ERROR: 'Error al guardar el proyecto',
    
    // Network errors
    NETWORK_ERROR: 'Error de red. Por favor, verifica tu conexión',
    REQUEST_TIMEOUT: 'La solicitud ha excedido el tiempo de espera',
    
    // Generic errors
    UNKNOWN_ERROR: 'Ha ocurrido un error desconocido',
    OPERATION_FAILED: 'La operación ha fallado'
};

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
    PROJECT_SAVED: 'Proyecto guardado exitosamente',
    PROJECT_LOADED: 'Proyecto cargado exitosamente',
    TEMPLATE_LOADED: 'Plantilla cargada exitosamente',
    COMPONENT_CREATED: 'Componente creado exitosamente',
    EXPORT_SUCCESS: 'Exportación completada exitosamente',
    FILE_UPLOADED: 'Archivo cargado exitosamente'
};

/**
 * Feature Flags
 */
export const FEATURES = {
    ENABLE_AUTO_SAVE: true,
    ENABLE_UNDO_REDO: true,
    ENABLE_KEYBOARD_SHORTCUTS: true,
    ENABLE_DRAG_DROP: true,
    ENABLE_RESPONSIVE_PREVIEW: true,
    ENABLE_LIVE_PREVIEW: true,
    ENABLE_AI_FEATURES: true,
    ENABLE_COLLABORATION: false, // Not yet implemented
    ENABLE_ANALYTICS: false
};

// Export all constants as default
export default {
    UI,
    FILE,
    COMPONENT,
    STYLE,
    TEMPLATE,
    SHORTCUTS,
    API,
    VALIDATION,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    FEATURES
};
