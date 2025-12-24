/**
 * CSS Parser Usage Examples
 * 
 * This file demonstrates how to use the CSS Parser in various scenarios
 */

import { CSSParser, cssParser, extractClassNames, findMatchingRules } from './cssParser.js';

// ============================================================================
// Example 1: Basic Class Extraction
// ============================================================================

function example1_basicClassExtraction() {
    console.log('=== Example 1: Basic Class Extraction ===');
    
    const css = `
        .button { 
            padding: 10px 20px;
            border-radius: 4px;
        }
        
        .card {
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .nav-item {
            display: inline-block;
        }
    `;
    
    const classes = extractClassNames(css);
    console.log('Found classes:', classes);
    // Output: ['button', 'card', 'nav-item']
}

// ============================================================================
// Example 2: Finding Matching Rules
// ============================================================================

function example2_findingMatchingRules() {
    console.log('\n=== Example 2: Finding Matching Rules ===');
    
    const css = `
        .button { color: blue; }
        .button:hover { color: darkblue; }
        .button.primary { background: blue; }
        .card { padding: 20px; }
    `;
    
    const buttonRules = findMatchingRules(css, '.button');
    console.log('Rules matching .button:', buttonRules);
}

// ============================================================================
// Example 3: Class Validation
// ============================================================================

async function example3_classValidation() {
    console.log('\n=== Example 3: Class Validation ===');
    
    const parser = new CSSParser();
    
    // Simulate getting all available classes from stylesheets
    const css = `
        .button { color: blue; }
        .card { background: white; }
        .nav { display: flex; }
    `;
    
    const availableClasses = parser.extractClassNames(css);
    console.log('Available classes:', availableClasses);
    
    // Check if a class exists
    const exists = parser.classExists('button', css);
    console.log('Does "button" class exist?', exists);
    
    const notExists = parser.classExists('nonexistent', css);
    console.log('Does "nonexistent" class exist?', notExists);
}

// ============================================================================
// Example 4: Working with HTML Elements
// ============================================================================

function example4_workingWithElements() {
    console.log('\n=== Example 4: Working with HTML Elements ===');
    
    const parser = new CSSParser();
    
    // Create a mock element (in real usage, this would be a DOM element)
    const element = {
        classList: ['button', 'primary', 'large', 'undefined-class']
    };
    
    const availableClasses = ['button', 'primary', 'large', 'secondary'];
    
    // Get element classes
    const elementClasses = parser.getElementClasses(element);
    console.log('Element classes:', elementClasses);
    
    // Find undefined classes
    const undefinedClasses = parser.getUndefinedClasses(element, availableClasses);
    console.log('Undefined classes:', undefinedClasses);
}

// ============================================================================
// Example 5: Class Autocomplete
// ============================================================================

function example5_classAutocomplete() {
    console.log('\n=== Example 5: Class Autocomplete ===');
    
    const css = `
        .btn-primary { background: blue; }
        .btn-secondary { background: gray; }
        .btn-success { background: green; }
        .button-large { padding: 20px; }
        .card { background: white; }
    `;
    
    const parser = new CSSParser();
    const allClasses = parser.extractClassNames(css);
    
    // Simulate user typing "btn"
    const query = 'btn';
    const suggestions = allClasses.filter(cls => 
        cls.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`Autocomplete suggestions for "${query}":`, suggestions);
    // Output: ['btn-primary', 'btn-secondary', 'btn-success', 'button-large']
}

// ============================================================================
// Example 6: Style Inspector
// ============================================================================

function example6_styleInspector() {
    console.log('\n=== Example 6: Style Inspector ===');
    
    const css = `
        .button {
            padding: 10px 20px;
            border: none;
        }
        
        .button.primary {
            background: blue;
            color: white;
        }
        
        .button:hover {
            opacity: 0.8;
        }
    `;
    
    const parser = new CSSParser();
    
    // Get all styles for the "button" class
    const buttonStyles = parser.getStylesForClass('button', css);
    console.log('Styles for .button:', buttonStyles);
    
    // Get all styles for the "primary" class
    const primaryStyles = parser.getStylesForClass('primary', css);
    console.log('Styles for .primary:', primaryStyles);
}

// ============================================================================
// Example 7: CSS Preprocessing
// ============================================================================

function example7_cssPreprocessing() {
    console.log('\n=== Example 7: CSS Preprocessing ===');
    
    const parser = new CSSParser();
    
    // Check file types
    console.log('Is styles.less a preprocessor file?', 
        parser.isPreprocessorFile('styles.less')); // true
    console.log('Is styles.scss a preprocessor file?', 
        parser.isPreprocessorFile('styles.scss')); // true
    console.log('Is styles.css a preprocessor file?', 
        parser.isPreprocessorFile('styles.css')); // false
    
    // Reduce CSS (remove comments, normalize whitespace)
    const messyCSS = `
        /* This is a comment */
        .button    {
            color:    red;
            /* Another comment */
            padding:  10px;
        }
    `;
    
    const cleanCSS = parser.reduceStyleSheet(messyCSS);
    console.log('Reduced CSS:', cleanCSS);
}

// ============================================================================
// Example 8: Real-World Class Manager
// ============================================================================

class ClassManager {
    constructor() {
        this.parser = new CSSParser();
        this.availableClasses = [];
    }
    
    async init() {
        // In a real application, this would fetch from actual stylesheets
        const css = `
            .button { color: blue; }
            .card { background: white; }
            .nav { display: flex; }
        `;
        
        this.availableClasses = this.parser.extractClassNames(css);
        console.log('Class Manager initialized with classes:', this.availableClasses);
    }
    
    addClass(element, className) {
        if (!this.availableClasses.includes(className)) {
            console.warn(`⚠️  Class "${className}" is not defined in any stylesheet`);
        }
        
        // In real usage: element.classList.add(className);
        console.log(`✅ Added class "${className}" to element`);
    }
    
    removeClass(element, className) {
        // In real usage: element.classList.remove(className);
        console.log(`✅ Removed class "${className}" from element`);
    }
    
    getClassSuggestions(query) {
        return this.availableClasses.filter(cls =>
            cls.toLowerCase().includes(query.toLowerCase())
        );
    }
}

async function example8_classManager() {
    console.log('\n=== Example 8: Real-World Class Manager ===');
    
    const manager = new ClassManager();
    await manager.init();
    
    // Add a defined class
    manager.addClass({}, 'button');
    
    // Try to add an undefined class
    manager.addClass({}, 'undefined-class');
    
    // Get suggestions
    const suggestions = manager.getClassSuggestions('bu');
    console.log('Suggestions for "bu":', suggestions);
}

// ============================================================================
// Example 9: Performance with Caching
// ============================================================================

function example9_performanceWithCaching() {
    console.log('\n=== Example 9: Performance with Caching ===');
    
    const parser = new CSSParser();
    const largeCss = `
        .class1 { color: red; }
        .class2 { color: blue; }
        .class3 { color: green; }
        /* ... imagine 1000 more classes ... */
    `;
    
    // First call - parses CSS
    console.time('First call (no cache)');
    const classes1 = parser.extractClassNames(largeCss);
    console.timeEnd('First call (no cache)');
    
    // Second call - uses cache
    console.time('Second call (cached)');
    const classes2 = parser.extractClassNames(largeCss);
    console.timeEnd('Second call (cached)');
    
    console.log('Results are identical:', 
        JSON.stringify(classes1) === JSON.stringify(classes2));
    
    // Clear cache
    parser.clearCache();
    console.log('Cache cleared');
}

// ============================================================================
// Example 10: Complex Selector Extraction
// ============================================================================

function example10_complexSelectors() {
    console.log('\n=== Example 10: Complex Selector Extraction ===');
    
    const css = `
        /* Simple selectors */
        .button { }
        #header { }
        
        /* Compound selectors */
        .button.primary { }
        .card.large.shadow { }
        
        /* Descendant selectors */
        .container .item { }
        
        /* Pseudo-classes */
        .button:hover { }
        .link:visited { }
        
        /* Attribute selectors */
        input[type="text"] { }
        
        /* Media queries */
        @media (min-width: 768px) {
            .button { }
        }
    `;
    
    const parser = new CSSParser();
    
    const classes = parser.extractClassNames(css);
    console.log('All classes:', classes);
    
    const ids = parser.extractIds(css);
    console.log('All IDs:', ids);
    
    const selectors = parser.extractSelectors(css);
    console.log('Total selectors found:', selectors.length);
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples() {
    console.log('🚀 CSS Parser Examples\n');
    console.log('=' .repeat(60));
    
    example1_basicClassExtraction();
    example2_findingMatchingRules();
    await example3_classValidation();
    example4_workingWithElements();
    example5_classAutocomplete();
    example6_styleInspector();
    example7_cssPreprocessing();
    await example8_classManager();
    example9_performanceWithCaching();
    example10_complexSelectors();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All examples completed!');
}

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.runCSSParserExamples = runAllExamples;
    console.log('💡 Run examples by calling: runCSSParserExamples()');
} else {
    // Node environment
    runAllExamples().catch(console.error);
}
