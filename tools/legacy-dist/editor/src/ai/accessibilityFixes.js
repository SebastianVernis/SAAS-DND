/**
 * Accessibility Fixes - v1.0
 *
 * Auto-fix implementations for common accessibility issues.
 * Applies WCAG 2.1 AA compliant fixes automatically.
 */

class AccessibilityFixes {
  constructor() {
    this.fixes = this.initializeFixes();
  }

  /**
   * Initialize all auto-fix functions
   */
  initializeFixes() {
    return {
      'img-alt': element => {
        const images = element.querySelectorAll('img:not([alt])');
        let fixed = 0;

        images.forEach(img => {
          // Try to generate alt text from src or nearby text
          const src = img.getAttribute('src') || '';
          const filename = src.split('/').pop().split('.')[0];
          const altText = filename.replace(/[-_]/g, ' ') || 'Image';

          img.setAttribute('alt', altText);
          fixed++;
        });

        return { fixed, message: `Added alt text to ${fixed} images` };
      },

      'form-label': element => {
        const inputs = element.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([aria-label]), textarea:not([aria-label]), select:not([aria-label])'
        );
        let fixed = 0;

        inputs.forEach(input => {
          // Check if already has label
          if (input.id && element.querySelector(`label[for="${input.id}"]`)) {
            return;
          }

          // Generate label text from type, name, or placeholder
          const type = input.getAttribute('type') || input.tagName.toLowerCase();
          const name = input.getAttribute('name') || '';
          const placeholder = input.getAttribute('placeholder') || '';

          const labelText = placeholder || name.replace(/[-_]/g, ' ') || type;
          input.setAttribute('aria-label', labelText);
          fixed++;
        });

        return { fixed, message: `Added labels to ${fixed} form inputs` };
      },

      'heading-order': element => {
        const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let fixed = 0;
        let lastLevel = 0;

        headings.forEach(heading => {
          const currentLevel = parseInt(heading.tagName[1]);

          if (currentLevel > lastLevel + 1) {
            // Fix by changing to correct level
            const correctLevel = lastLevel + 1;
            const newHeading = document.createElement(`h${correctLevel}`);
            newHeading.innerHTML = heading.innerHTML;

            // Copy attributes
            Array.from(heading.attributes).forEach(attr => {
              newHeading.setAttribute(attr.name, attr.value);
            });

            heading.parentNode.replaceChild(newHeading, heading);
            lastLevel = correctLevel;
            fixed++;
          } else {
            lastLevel = currentLevel;
          }
        });

        return { fixed, message: `Fixed ${fixed} heading order issues` };
      },

      'link-text': element => {
        const links = element.querySelectorAll('a');
        let fixed = 0;
        const genericTexts = ['click here', 'read more', 'here', 'link', 'more'];

        links.forEach(link => {
          const text = link.textContent.trim().toLowerCase();

          if (!text) {
            // Add aria-label from href
            const href = link.getAttribute('href') || '';
            const label = href.replace(/^#/, '').replace(/[-_]/g, ' ') || 'Link';
            link.setAttribute('aria-label', label);
            fixed++;
          } else if (genericTexts.includes(text)) {
            // Add more context via aria-label
            const href = link.getAttribute('href') || '';
            link.setAttribute('aria-label', `${text} - ${href}`);
            fixed++;
          }
        });

        return { fixed, message: `Improved ${fixed} link descriptions` };
      },

      'button-text': element => {
        const buttons = element.querySelectorAll(
          'button:not([aria-label]), [role="button"]:not([aria-label])'
        );
        let fixed = 0;

        buttons.forEach(button => {
          if (!button.textContent.trim()) {
            // Try to find icon or generate label
            const icon = button.querySelector('[class*="icon"]');
            const label = icon ? 'Button' : 'Action button';
            button.setAttribute('aria-label', label);
            fixed++;
          }
        });

        return { fixed, message: `Added labels to ${fixed} buttons` };
      },

      'lang-attribute': element => {
        const html = element.closest('html') || document.documentElement;
        let fixed = 0;

        if (!html.hasAttribute('lang')) {
          html.setAttribute('lang', 'en');
          fixed = 1;
        }

        return { fixed, message: fixed ? 'Added lang attribute to HTML' : 'No fix needed' };
      },

      'aria-roles': element => {
        const elementsWithRole = element.querySelectorAll('[role]');
        let fixed = 0;
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

        elementsWithRole.forEach(el => {
          const role = el.getAttribute('role');
          if (!validRoles.includes(role)) {
            el.removeAttribute('role');
            fixed++;
          }
        });

        return { fixed, message: `Removed ${fixed} invalid ARIA roles` };
      },

      'table-headers': element => {
        const tables = element.querySelectorAll('table');
        let fixed = 0;

        tables.forEach(table => {
          const hasHeaders = table.querySelector('th');

          if (!hasHeaders) {
            // Try to convert first row to headers
            const firstRow = table.querySelector('tr');
            if (firstRow) {
              const cells = firstRow.querySelectorAll('td');
              cells.forEach(cell => {
                const th = document.createElement('th');
                th.innerHTML = cell.innerHTML;
                Array.from(cell.attributes).forEach(attr => {
                  th.setAttribute(attr.name, attr.value);
                });
                cell.parentNode.replaceChild(th, cell);
              });
              fixed++;
            }
          }
        });

        return { fixed, message: `Added headers to ${fixed} tables` };
      },

      'semantic-html': element => {
        const clickableDivs = element.querySelectorAll('div[onclick]');
        let fixed = 0;

        clickableDivs.forEach(div => {
          const button = document.createElement('button');
          button.innerHTML = div.innerHTML;
          button.setAttribute('type', 'button');

          // Copy attributes except onclick
          Array.from(div.attributes).forEach(attr => {
            if (attr.name !== 'onclick') {
              button.setAttribute(attr.name, attr.value);
            }
          });

          // Copy onclick as event listener
          const onclickCode = div.getAttribute('onclick');
          if (onclickCode) {
            button.addEventListener('click', new Function(onclickCode));
          }

          div.parentNode.replaceChild(button, div);
          fixed++;
        });

        return { fixed, message: `Converted ${fixed} divs to buttons` };
      },

      'video-captions': element => {
        const videos = element.querySelectorAll('video');
        let fixed = 0;

        videos.forEach(video => {
          const hasTrack = video.querySelector('track');

          if (!hasTrack) {
            const track = document.createElement('track');
            track.setAttribute('kind', 'captions');
            track.setAttribute('label', 'English');
            track.setAttribute('srclang', 'en');
            track.setAttribute('src', 'captions.vtt');
            video.appendChild(track);
            fixed++;
          }
        });

        return { fixed, message: `Added caption tracks to ${fixed} videos (placeholder)` };
      },

      'skip-link': element => {
        const skipLink = element.querySelector(
          'a[href^="#"][href*="content"], a[href^="#"][href*="main"]'
        );
        let fixed = 0;

        if (!skipLink) {
          const link = document.createElement('a');
          link.href = '#main-content';
          link.textContent = 'Skip to main content';
          link.className = 'skip-link';
          link.style.cssText = 'position: absolute; left: -9999px; z-index: 999;';

          // Add focus styles
          link.addEventListener('focus', () => {
            link.style.left = '0';
            link.style.top = '0';
          });
          link.addEventListener('blur', () => {
            link.style.left = '-9999px';
          });

          element.insertBefore(link, element.firstChild);
          fixed = 1;
        }

        return { fixed, message: fixed ? 'Added skip navigation link' : 'No fix needed' };
      },

      'landmark-roles': element => {
        let fixed = 0;
        const hasMain = element.querySelector('main, [role="main"]');

        if (!hasMain) {
          // Try to find a likely main content area
          const contentDiv = element.querySelector(
            'div[class*="content"], div[id*="content"], div[class*="main"], div[id*="main"]'
          );

          if (contentDiv) {
            contentDiv.setAttribute('role', 'main');
            fixed++;
          }
        }

        return { fixed, message: fixed ? 'Added main landmark role' : 'No fix needed' };
      },

      'title-unique': element => {
        let fixed = 0;
        const title = document.querySelector('title');

        if (!title) {
          const newTitle = document.createElement('title');
          newTitle.textContent = 'Untitled Page';
          document.head.appendChild(newTitle);
          fixed = 1;
        } else if (!title.textContent.trim()) {
          title.textContent = 'Untitled Page';
          fixed = 1;
        }

        return { fixed, message: fixed ? 'Added page title' : 'No fix needed' };
      },

      'focus-visible': element => {
        const interactive = element.querySelectorAll('a, button, input, select, textarea');
        let fixed = 0;

        interactive.forEach(el => {
          const style = el.style.cssText || '';
          if (style.includes('outline: none') || style.includes('outline:none')) {
            // Add focus styles
            const currentStyle = el.getAttribute('style') || '';
            el.setAttribute(
              'style',
              currentStyle + '; outline: 2px solid #4A90E2; outline-offset: 2px;'
            );
            fixed++;
          }
        });

        return { fixed, message: `Added focus indicators to ${fixed} elements` };
      },
    };
  }

  /**
   * Apply fix for a specific rule
   */
  applyFix(ruleId, element) {
    const fixFunction = this.fixes[ruleId];

    if (!fixFunction) {
      return {
        success: false,
        message: `No auto-fix available for rule: ${ruleId}`,
      };
    }

    try {
      const result = fixFunction(element);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error applying fix: ${error.message}`,
      };
    }
  }

  /**
   * Apply all available fixes
   */
  applyAllFixes(element) {
    const results = [];
    let totalFixed = 0;

    Object.keys(this.fixes).forEach(ruleId => {
      const result = this.applyFix(ruleId, element);
      if (result.success && result.fixed > 0) {
        results.push({
          ruleId,
          ...result,
        });
        totalFixed += result.fixed;
      }
    });

    return {
      success: true,
      totalFixed,
      results,
    };
  }

  /**
   * Check if fix is available for a rule
   */
  hasFixFor(ruleId) {
    return !!this.fixes[ruleId];
  }

  /**
   * Get all available fixes
   */
  getAvailableFixes() {
    return Object.keys(this.fixes);
  }
}

// Export globally
window.AccessibilityFixes = AccessibilityFixes;
window.accessibilityFixes = new AccessibilityFixes();
