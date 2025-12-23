/**
 * WCAG Rules - v1.0
 *
 * WCAG 2.1 Level AA accessibility rules for automated checking.
 * Implements 15+ essential accessibility checks.
 */

class WCAGRules {
  constructor() {
    this.rules = this.initializeRules();
  }

  /**
   * Initialize all WCAG rules
   */
  initializeRules() {
    return [
      {
        id: 'img-alt',
        name: 'Images must have alt text',
        level: 'A',
        wcag: '1.1.1',
        check: element => {
          const images = element.querySelectorAll('img');
          const issues = [];

          images.forEach((img, index) => {
            if (!img.hasAttribute('alt')) {
              issues.push({
                element: img,
                message: 'Image missing alt attribute',
                fix: 'alt=""',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'form-label',
        name: 'Form inputs must have labels',
        level: 'A',
        wcag: '1.3.1',
        check: element => {
          const inputs = element.querySelectorAll(
            'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
          );
          const issues = [];

          inputs.forEach(input => {
            const hasLabel =
              input.hasAttribute('aria-label') ||
              input.hasAttribute('aria-labelledby') ||
              (input.id && element.querySelector(`label[for="${input.id}"]`));

            if (!hasLabel) {
              issues.push({
                element: input,
                message: 'Form input missing label',
                fix: 'aria-label="Input description"',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'heading-order',
        name: 'Headings must be in logical order',
        level: 'A',
        wcag: '1.3.1',
        check: element => {
          const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const issues = [];
          let lastLevel = 0;

          headings.forEach(heading => {
            const level = parseInt(heading.tagName[1]);

            if (level > lastLevel + 1) {
              issues.push({
                element: heading,
                message: `Heading level skipped (h${lastLevel} to h${level})`,
                fix: `Change to h${lastLevel + 1}`,
              });
            }

            lastLevel = level;
          });

          return issues;
        },
      },
      {
        id: 'link-text',
        name: 'Links must have descriptive text',
        level: 'A',
        wcag: '2.4.4',
        check: element => {
          const links = element.querySelectorAll('a');
          const issues = [];
          const genericTexts = ['click here', 'read more', 'here', 'link', 'more'];

          links.forEach(link => {
            const text = link.textContent.trim().toLowerCase();

            if (!text) {
              issues.push({
                element: link,
                message: 'Link has no text content',
                fix: 'aria-label="Descriptive link text"',
              });
            } else if (genericTexts.includes(text)) {
              issues.push({
                element: link,
                message: `Link text is not descriptive: "${text}"`,
                fix: 'Use more descriptive text',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'button-text',
        name: 'Buttons must have accessible text',
        level: 'A',
        wcag: '4.1.2',
        check: element => {
          const buttons = element.querySelectorAll('button, [role="button"]');
          const issues = [];

          buttons.forEach(button => {
            const hasText =
              button.textContent.trim() ||
              button.hasAttribute('aria-label') ||
              button.hasAttribute('aria-labelledby');

            if (!hasText) {
              issues.push({
                element: button,
                message: 'Button has no accessible text',
                fix: 'aria-label="Button action"',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'color-contrast',
        name: 'Text must have sufficient color contrast',
        level: 'AA',
        wcag: '1.4.3',
        check: element => {
          // This is a simplified check - full contrast checking requires color analysis
          const issues = [];
          const textElements = element.querySelectorAll(
            'p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th'
          );

          textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;

            // Check if colors are too similar (simplified)
            if (color && bgColor && color === bgColor) {
              issues.push({
                element: el,
                message: 'Text color matches background color',
                fix: 'Ensure 4.5:1 contrast ratio for normal text',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'lang-attribute',
        name: 'HTML must have lang attribute',
        level: 'A',
        wcag: '3.1.1',
        check: element => {
          const issues = [];
          const html = element.closest('html') || document.documentElement;

          if (!html.hasAttribute('lang')) {
            issues.push({
              element: html,
              message: 'HTML element missing lang attribute',
              fix: 'lang="en"',
            });
          }

          return issues;
        },
      },
      {
        id: 'aria-roles',
        name: 'ARIA roles must be valid',
        level: 'A',
        wcag: '4.1.2',
        check: element => {
          const issues = [];
          const validRoles = [
            'alert',
            'button',
            'checkbox',
            'dialog',
            'link',
            'menu',
            'menuitem',
            'navigation',
            'radio',
            'tab',
            'tabpanel',
            'textbox',
          ];
          const elementsWithRole = element.querySelectorAll('[role]');

          elementsWithRole.forEach(el => {
            const role = el.getAttribute('role');
            if (!validRoles.includes(role)) {
              issues.push({
                element: el,
                message: `Invalid ARIA role: "${role}"`,
                fix: 'Use valid ARIA role or remove attribute',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'table-headers',
        name: 'Tables must have headers',
        level: 'A',
        wcag: '1.3.1',
        check: element => {
          const issues = [];
          const tables = element.querySelectorAll('table');

          tables.forEach(table => {
            const hasHeaders = table.querySelector('th') || table.querySelector('[scope]');

            if (!hasHeaders) {
              issues.push({
                element: table,
                message: 'Table missing header cells',
                fix: 'Add <th> elements or scope attributes',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'semantic-html',
        name: 'Use semantic HTML elements',
        level: 'A',
        wcag: '1.3.1',
        check: element => {
          const issues = [];

          // Check for divs that should be semantic elements
          const clickableDivs = element.querySelectorAll('div[onclick], div[click]');
          clickableDivs.forEach(div => {
            issues.push({
              element: div,
              message: 'Clickable div should be a button',
              fix: 'Use <button> element instead',
            });
          });

          return issues;
        },
      },
      {
        id: 'focus-visible',
        name: 'Interactive elements must have visible focus',
        level: 'AA',
        wcag: '2.4.7',
        check: element => {
          const issues = [];
          const interactive = element.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]'
          );

          interactive.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.outline === 'none' && !style.boxShadow && !style.border) {
              issues.push({
                element: el,
                message: 'Interactive element has no visible focus indicator',
                fix: 'Add outline or box-shadow on :focus',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'video-captions',
        name: 'Videos must have captions',
        level: 'A',
        wcag: '1.2.2',
        check: element => {
          const issues = [];
          const videos = element.querySelectorAll('video');

          videos.forEach(video => {
            const hasTrack = video.querySelector('track[kind="captions"], track[kind="subtitles"]');

            if (!hasTrack) {
              issues.push({
                element: video,
                message: 'Video missing captions track',
                fix: 'Add <track kind="captions" src="..."> element',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'skip-link',
        name: 'Page should have skip navigation link',
        level: 'A',
        wcag: '2.4.1',
        check: element => {
          const issues = [];
          const skipLink = element.querySelector(
            'a[href^="#"][href*="content"], a[href^="#"][href*="main"]'
          );

          if (!skipLink) {
            issues.push({
              element: element,
              message: 'Page missing skip navigation link',
              fix: 'Add <a href="#main-content">Skip to main content</a>',
            });
          }

          return issues;
        },
      },
      {
        id: 'landmark-roles',
        name: 'Page should use landmark roles',
        level: 'A',
        wcag: '1.3.1',
        check: element => {
          const issues = [];
          const hasMain = element.querySelector('main, [role="main"]');
          const hasNav = element.querySelector('nav, [role="navigation"]');

          if (!hasMain) {
            issues.push({
              element: element,
              message: 'Page missing main landmark',
              fix: 'Add <main> element or role="main"',
            });
          }

          return issues;
        },
      },
      {
        id: 'title-unique',
        name: 'Page must have unique title',
        level: 'A',
        wcag: '2.4.2',
        check: element => {
          const issues = [];
          const title = document.querySelector('title');

          if (!title || !title.textContent.trim()) {
            issues.push({
              element: document.head,
              message: 'Page missing or empty title',
              fix: 'Add <title>Descriptive Page Title</title>',
            });
          }

          return issues;
        },
      },
    ];
  }

  /**
   * Get all rules
   */
  getAllRules() {
    return this.rules;
  }

  /**
   * Get rule by ID
   */
  getRule(id) {
    return this.rules.find(rule => rule.id === id);
  }

  /**
   * Get rules by level
   */
  getRulesByLevel(level) {
    return this.rules.filter(rule => rule.level === level);
  }

  /**
   * Run all rules on an element
   */
  checkAll(element) {
    const allIssues = [];

    this.rules.forEach(rule => {
      try {
        const issues = rule.check(element);
        issues.forEach(issue => {
          allIssues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            level: rule.level,
            wcag: rule.wcag,
            ...issue,
          });
        });
      } catch (error) {
        console.error(`Error running rule ${rule.id}:`, error);
      }
    });

    return allIssues;
  }

  /**
   * Calculate accessibility score
   */
  calculateScore(issues) {
    const totalRules = this.rules.length;
    const failedRules = new Set(issues.map(i => i.ruleId)).size;
    const passedRules = totalRules - failedRules;

    return Math.round((passedRules / totalRules) * 100);
  }
}

// Export globally
window.WCAGRules = WCAGRules;
window.wcagRules = new WCAGRules();
