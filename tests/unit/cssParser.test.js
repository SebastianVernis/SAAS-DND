/**
 * Unit Tests for CSS Parser
 * 
 * Tests the adapted Phoenix CSSUtils functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
    CSSParser, 
    cssParser,
    extractSelectors,
    extractClassNames,
    extractIds,
    findMatchingRules,
    getStylesForClass,
    classExists
} from '../../vanilla-editor/src/utils/cssParser.js';

describe('CSSParser', () => {
    let parser;

    beforeEach(() => {
        parser = new CSSParser();
    });

    describe('extractSelectors', () => {
        it('should extract simple class selectors', () => {
            const css = '.button { color: red; }';
            const selectors = parser.extractSelectors(css);
            
            expect(selectors).toBeDefined();
            expect(selectors.length).toBeGreaterThan(0);
            expect(selectors[0].selector).toContain('button');
        });

        it('should extract multiple selectors', () => {
            const css = `
                .button { color: red; }
                .card { background: white; }
                #header { height: 100px; }
            `;
            const selectors = parser.extractSelectors(css);
            
            expect(selectors.length).toBeGreaterThanOrEqual(3);
        });

        it('should extract comma-separated selectors', () => {
            const css = '.button, .link, .nav { color: blue; }';
            const selectors = parser.extractSelectors(css);
            
            expect(selectors.length).toBeGreaterThanOrEqual(3);
        });

        it('should handle nested selectors', () => {
            const css = `
                .container {
                    .item { color: red; }
                }
            `;
            const selectors = parser.extractSelectors(css);
            
            expect(selectors.length).toBeGreaterThan(0);
        });

        it('should skip @import rules', () => {
            const css = `
                @import url('styles.css');
                .button { color: red; }
            `;
            const selectors = parser.extractSelectors(css);
            
            const importRules = selectors.filter(s => s.selector.includes('@import'));
            expect(importRules.length).toBe(0);
        });

        it('should handle @media queries', () => {
            const css = `
                @media (min-width: 768px) {
                    .button { color: blue; }
                }
            `;
            const selectors = parser.extractSelectors(css);
            
            expect(selectors.length).toBeGreaterThan(0);
        });
    });

    describe('extractClassNames', () => {
        it('should extract class names without dots', () => {
            const css = '.button { color: red; } .card { background: white; }';
            const classes = parser.extractClassNames(css);
            
            expect(classes).toContain('button');
            expect(classes).toContain('card');
            expect(classes.every(c => !c.startsWith('.'))).toBe(true);
        });

        it('should extract classes from complex selectors', () => {
            const css = '.button.primary:hover { color: blue; }';
            const classes = parser.extractClassNames(css);
            
            expect(classes).toContain('button');
            expect(classes).toContain('primary');
        });

        it('should extract classes from descendant selectors', () => {
            const css = '.container .item .title { font-size: 16px; }';
            const classes = parser.extractClassNames(css);
            
            expect(classes).toContain('container');
            expect(classes).toContain('item');
            expect(classes).toContain('title');
        });

        it('should return unique class names', () => {
            const css = `
                .button { color: red; }
                .button:hover { color: blue; }
                .button.active { color: green; }
            `;
            const classes = parser.extractClassNames(css);
            
            const buttonCount = classes.filter(c => c === 'button').length;
            expect(buttonCount).toBe(1);
        });

        it('should return sorted class names', () => {
            const css = '.zebra { } .apple { } .mango { }';
            const classes = parser.extractClassNames(css);
            
            expect(classes[0]).toBe('apple');
            expect(classes[classes.length - 1]).toBe('zebra');
        });

        it('should handle hyphenated class names', () => {
            const css = '.btn-primary { } .nav-item { }';
            const classes = parser.extractClassNames(css);
            
            expect(classes).toContain('btn-primary');
            expect(classes).toContain('nav-item');
        });

        it('should handle BEM notation', () => {
            const css = '.block__element--modifier { }';
            const classes = parser.extractClassNames(css);
            
            expect(classes).toContain('block__element--modifier');
        });
    });

    describe('extractIds', () => {
        it('should extract ID selectors without hash', () => {
            const css = '#header { height: 100px; } #footer { height: 50px; }';
            const ids = parser.extractIds(css);
            
            expect(ids).toContain('header');
            expect(ids).toContain('footer');
            expect(ids.every(id => !id.startsWith('#'))).toBe(true);
        });

        it('should extract IDs from complex selectors', () => {
            const css = '#main .content #sidebar { }';
            const ids = parser.extractIds(css);
            
            expect(ids).toContain('main');
            expect(ids).toContain('sidebar');
        });

        it('should return unique IDs', () => {
            const css = `
                #header { }
                #header:hover { }
                #header.active { }
            `;
            const ids = parser.extractIds(css);
            
            const headerCount = ids.filter(id => id === 'header').length;
            expect(headerCount).toBe(1);
        });
    });

    describe('findMatchingRules', () => {
        it('should find rules matching a class selector', () => {
            const css = `
                .button { color: red; }
                .button:hover { color: blue; }
                .link { color: green; }
            `;
            const matches = parser.findMatchingRules(css, '.button');
            
            expect(matches.length).toBeGreaterThanOrEqual(1);
        });

        it('should find rules matching an ID selector', () => {
            const css = `
                #header { height: 100px; }
                #footer { height: 50px; }
            `;
            const matches = parser.findMatchingRules(css, '#header');
            
            expect(matches.length).toBeGreaterThanOrEqual(1);
        });

        it('should find rules matching a tag selector', () => {
            const css = `
                div { display: block; }
                span { display: inline; }
            `;
            const matches = parser.findMatchingRules(css, 'div');
            
            expect(matches.length).toBeGreaterThanOrEqual(1);
        });

        it('should return rule information', () => {
            const css = '.button { color: red; }';
            const matches = parser.findMatchingRules(css, '.button');
            
            expect(matches[0]).toHaveProperty('name');
            expect(matches[0]).toHaveProperty('lineStart');
            expect(matches[0]).toHaveProperty('lineEnd');
        });
    });

    describe('getStylesForClass', () => {
        it('should get styles for a specific class', () => {
            const css = `
                .button { color: red; }
                .button:hover { color: blue; }
            `;
            const styles = parser.getStylesForClass('button', css);
            
            expect(styles.length).toBeGreaterThanOrEqual(1);
        });

        it('should work without leading dot', () => {
            const css = '.primary { background: blue; }';
            const styles = parser.getStylesForClass('primary', css);
            
            expect(styles.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('classExists', () => {
        it('should return true for existing class', () => {
            const css = '.button { color: red; }';
            const exists = parser.classExists('button', css);
            
            expect(exists).toBe(true);
        });

        it('should return false for non-existing class', () => {
            const css = '.button { color: red; }';
            const exists = parser.classExists('nonexistent', css);
            
            expect(exists).toBe(false);
        });
    });

    describe('getElementClasses', () => {
        it('should return array of element classes', () => {
            // Create a mock element
            const element = {
                classList: ['button', 'primary', 'large']
            };
            
            const classes = parser.getElementClasses(element);
            
            expect(Array.isArray(classes)).toBe(true);
        });

        it('should return empty array for element without classes', () => {
            const element = { classList: [] };
            const classes = parser.getElementClasses(element);
            
            expect(classes).toEqual([]);
        });

        it('should return empty array for null element', () => {
            const classes = parser.getElementClasses(null);
            
            expect(classes).toEqual([]);
        });
    });

    describe('getUndefinedClasses', () => {
        it('should identify undefined classes', () => {
            const element = {
                classList: ['button', 'primary', 'undefined-class']
            };
            const availableClasses = ['button', 'primary'];
            
            const undefined = parser.getUndefinedClasses(element, availableClasses);
            
            expect(undefined).toContain('undefined-class');
            expect(undefined).not.toContain('button');
        });

        it('should return empty array when all classes are defined', () => {
            const element = {
                classList: ['button', 'primary']
            };
            const availableClasses = ['button', 'primary', 'secondary'];
            
            const undefined = parser.getUndefinedClasses(element, availableClasses);
            
            expect(undefined).toEqual([]);
        });
    });

    describe('reduceStyleSheet', () => {
        it('should remove block comments', () => {
            const css = `
                /* This is a comment */
                .button { color: red; }
            `;
            const reduced = parser.reduceStyleSheet(css);
            
            expect(reduced).not.toContain('/*');
            expect(reduced).not.toContain('*/');
        });

        it('should remove line comments', () => {
            const css = `
                // This is a line comment
                .button { color: red; }
            `;
            const reduced = parser.reduceStyleSheet(css);
            
            expect(reduced).not.toContain('//');
        });

        it('should normalize whitespace', () => {
            const css = `
                .button    {
                    color:    red;
                }
            `;
            const reduced = parser.reduceStyleSheet(css);
            
            expect(reduced).not.toContain('    ');
        });
    });

    describe('isPreprocessorFile', () => {
        it('should identify LESS files', () => {
            expect(parser.isPreprocessorFile('styles.less')).toBe(true);
        });

        it('should identify SCSS files', () => {
            expect(parser.isPreprocessorFile('styles.scss')).toBe(true);
        });

        it('should identify SASS files', () => {
            expect(parser.isPreprocessorFile('styles.sass')).toBe(true);
        });

        it('should not identify CSS files as preprocessor', () => {
            expect(parser.isPreprocessorFile('styles.css')).toBe(false);
        });

        it('should handle uppercase extensions', () => {
            expect(parser.isPreprocessorFile('styles.LESS')).toBe(true);
        });
    });

    describe('cache', () => {
        it('should cache results', () => {
            const css = '.button { color: red; }';
            
            const result1 = parser.extractClassNames(css);
            const result2 = parser.extractClassNames(css);
            
            expect(result1).toEqual(result2);
        });

        it('should clear cache', () => {
            const css = '.button { color: red; }';
            
            parser.extractClassNames(css);
            expect(parser.cache.size).toBeGreaterThan(0);
            
            parser.clearCache();
            expect(parser.cache.size).toBe(0);
        });
    });

    describe('singleton instance', () => {
        it('should provide convenience functions', () => {
            const css = '.button { color: red; }';
            
            const classes = extractClassNames(css);
            expect(Array.isArray(classes)).toBe(true);
        });

        it('should use the same instance', () => {
            expect(cssParser).toBeInstanceOf(CSSParser);
        });
    });
});

describe('Integration Tests', () => {
    it('should handle real-world CSS', () => {
        const css = `
            /* Base styles */
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
            }

            /* Components */
            .button {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }

            .button.primary {
                background: blue;
                color: white;
            }

            .button.secondary {
                background: gray;
                color: white;
            }

            /* Responsive */
            @media (min-width: 768px) {
                .button {
                    padding: 12px 24px;
                }
            }

            /* IDs */
            #header {
                height: 60px;
                background: #333;
            }

            #footer {
                height: 40px;
                background: #666;
            }
        `;

        const parser = new CSSParser();
        
        const classes = parser.extractClassNames(css);
        expect(classes).toContain('button');
        expect(classes).toContain('primary');
        expect(classes).toContain('secondary');
        
        const ids = parser.extractIds(css);
        expect(ids).toContain('header');
        expect(ids).toContain('footer');
        
        const buttonRules = parser.findMatchingRules(css, '.button');
        expect(buttonRules.length).toBeGreaterThan(0);
    });

    it('should handle SCSS-like syntax', () => {
        const scss = `
            .card {
                padding: 20px;
                
                .card-header {
                    font-weight: bold;
                }
                
                .card-body {
                    margin-top: 10px;
                }
            }
        `;

        const parser = new CSSParser();
        const classes = parser.extractClassNames(scss);
        
        expect(classes.length).toBeGreaterThan(0);
    });
});
