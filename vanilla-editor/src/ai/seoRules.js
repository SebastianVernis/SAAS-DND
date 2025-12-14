/**
 * SEO Rules - v1.0
 *
 * SEO best practices and rules for automated checking.
 * Implements essential on-page SEO checks.
 */

class SEORules {
  constructor() {
    this.rules = this.initializeRules();
  }

  /**
   * Initialize all SEO rules
   */
  initializeRules() {
    return [
      {
        id: 'title-length',
        name: 'Title tag length',
        category: 'meta',
        check: () => {
          const title = document.querySelector('title');
          const issues = [];

          if (!title) {
            issues.push({
              severity: 'error',
              message: 'Missing title tag',
              fix: 'Add <title> tag with 50-60 characters',
            });
          } else {
            const length = title.textContent.length;
            if (length < 30) {
              issues.push({
                severity: 'warning',
                message: `Title too short (${length} chars). Recommended: 50-60 chars`,
                fix: 'Expand title to be more descriptive',
              });
            } else if (length > 60) {
              issues.push({
                severity: 'warning',
                message: `Title too long (${length} chars). May be truncated in search results`,
                fix: 'Shorten title to 50-60 characters',
              });
            }
          }

          return issues;
        },
      },
      {
        id: 'meta-description',
        name: 'Meta description',
        category: 'meta',
        check: () => {
          const meta = document.querySelector('meta[name="description"]');
          const issues = [];

          if (!meta) {
            issues.push({
              severity: 'error',
              message: 'Missing meta description',
              fix: 'Add meta description (150-160 characters)',
            });
          } else {
            const content = meta.getAttribute('content') || '';
            const length = content.length;

            if (length < 120) {
              issues.push({
                severity: 'warning',
                message: `Meta description too short (${length} chars)`,
                fix: 'Expand to 150-160 characters',
              });
            } else if (length > 160) {
              issues.push({
                severity: 'warning',
                message: `Meta description too long (${length} chars)`,
                fix: 'Shorten to 150-160 characters',
              });
            }
          }

          return issues;
        },
      },
      {
        id: 'h1-tag',
        name: 'H1 heading',
        category: 'content',
        check: element => {
          const h1s = element.querySelectorAll('h1');
          const issues = [];

          if (h1s.length === 0) {
            issues.push({
              severity: 'error',
              message: 'Missing H1 heading',
              fix: 'Add one H1 heading with main topic',
            });
          } else if (h1s.length > 1) {
            issues.push({
              severity: 'warning',
              message: `Multiple H1 headings found (${h1s.length})`,
              fix: 'Use only one H1 per page',
            });
          }

          return issues;
        },
      },
      {
        id: 'heading-structure',
        name: 'Heading hierarchy',
        category: 'content',
        check: element => {
          const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const issues = [];

          if (headings.length < 2) {
            issues.push({
              severity: 'info',
              message: 'Limited heading structure',
              fix: 'Add more headings to structure content',
            });
          }

          return issues;
        },
      },
      {
        id: 'img-alt-seo',
        name: 'Image alt attributes for SEO',
        category: 'content',
        check: element => {
          const images = element.querySelectorAll('img');
          const issues = [];
          let missingAlt = 0;
          let emptyAlt = 0;

          images.forEach(img => {
            if (!img.hasAttribute('alt')) {
              missingAlt++;
            } else if (!img.getAttribute('alt').trim()) {
              emptyAlt++;
            }
          });

          if (missingAlt > 0) {
            issues.push({
              severity: 'warning',
              message: `${missingAlt} images missing alt text`,
              fix: 'Add descriptive alt text to all images',
            });
          }

          if (emptyAlt > 0) {
            issues.push({
              severity: 'info',
              message: `${emptyAlt} images with empty alt text`,
              fix: 'Add descriptive alt text or use alt="" for decorative images',
            });
          }

          return issues;
        },
      },
      {
        id: 'internal-links',
        name: 'Internal linking',
        category: 'links',
        check: element => {
          const links = element.querySelectorAll('a[href]');
          const issues = [];
          let internalLinks = 0;

          links.forEach(link => {
            const href = link.getAttribute('href');
            if (
              href &&
              (href.startsWith('/') ||
                href.startsWith('#') ||
                href.includes(window.location.hostname))
            ) {
              internalLinks++;
            }
          });

          if (internalLinks === 0 && links.length > 0) {
            issues.push({
              severity: 'info',
              message: 'No internal links found',
              fix: 'Add internal links to improve site structure',
            });
          }

          return issues;
        },
      },
      {
        id: 'external-links',
        name: 'External links',
        category: 'links',
        check: element => {
          const externalLinks = element.querySelectorAll(
            'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
          );
          const issues = [];

          externalLinks.forEach(link => {
            if (!link.hasAttribute('rel') || !link.getAttribute('rel').includes('noopener')) {
              issues.push({
                severity: 'warning',
                message: 'External link missing rel="noopener"',
                fix: 'Add rel="noopener noreferrer" to external links',
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'og-tags',
        name: 'Open Graph tags',
        category: 'social',
        check: () => {
          const issues = [];
          const requiredOGTags = ['og:title', 'og:description', 'og:image', 'og:url'];

          requiredOGTags.forEach(tag => {
            const meta = document.querySelector(`meta[property="${tag}"]`);
            if (!meta) {
              issues.push({
                severity: 'warning',
                message: `Missing ${tag} meta tag`,
                fix: `Add <meta property="${tag}" content="...">`,
              });
            }
          });

          return issues;
        },
      },
      {
        id: 'twitter-cards',
        name: 'Twitter Card tags',
        category: 'social',
        check: () => {
          const issues = [];
          const twitterCard = document.querySelector('meta[name="twitter:card"]');

          if (!twitterCard) {
            issues.push({
              severity: 'info',
              message: 'Missing Twitter Card tags',
              fix: 'Add Twitter Card meta tags for better social sharing',
            });
          }

          return issues;
        },
      },
      {
        id: 'canonical-url',
        name: 'Canonical URL',
        category: 'meta',
        check: () => {
          const canonical = document.querySelector('link[rel="canonical"]');
          const issues = [];

          if (!canonical) {
            issues.push({
              severity: 'info',
              message: 'Missing canonical URL',
              fix: 'Add <link rel="canonical" href="..."> to prevent duplicate content',
            });
          }

          return issues;
        },
      },
      {
        id: 'viewport-meta',
        name: 'Viewport meta tag',
        category: 'mobile',
        check: () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          const issues = [];

          if (!viewport) {
            issues.push({
              severity: 'error',
              message: 'Missing viewport meta tag',
              fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
            });
          }

          return issues;
        },
      },
      {
        id: 'content-length',
        name: 'Content length',
        category: 'content',
        check: element => {
          const textContent = element.textContent || '';
          const wordCount = textContent.trim().split(/\s+/).length;
          const issues = [];

          if (wordCount < 300) {
            issues.push({
              severity: 'warning',
              message: `Low content length (${wordCount} words)`,
              fix: 'Add more content (recommended: 300+ words)',
            });
          }

          return issues;
        },
      },
      {
        id: 'structured-data',
        name: 'Structured data',
        category: 'advanced',
        check: () => {
          const jsonLd = document.querySelector('script[type="application/ld+json"]');
          const issues = [];

          if (!jsonLd) {
            issues.push({
              severity: 'info',
              message: 'No structured data found',
              fix: 'Add JSON-LD structured data for rich snippets',
            });
          }

          return issues;
        },
      },
      {
        id: 'robots-meta',
        name: 'Robots meta tag',
        category: 'meta',
        check: () => {
          const robots = document.querySelector('meta[name="robots"]');
          const issues = [];

          if (robots) {
            const content = robots.getAttribute('content') || '';
            if (content.includes('noindex')) {
              issues.push({
                severity: 'warning',
                message: 'Page set to noindex',
                fix: 'Remove noindex if page should be indexed',
              });
            }
          }

          return issues;
        },
      },
      {
        id: 'page-speed',
        name: 'Page performance',
        category: 'performance',
        check: element => {
          const images = element.querySelectorAll('img');
          const scripts = document.querySelectorAll('script');
          const issues = [];

          if (images.length > 20) {
            issues.push({
              severity: 'warning',
              message: `Many images (${images.length})`,
              fix: 'Optimize images and consider lazy loading',
            });
          }

          if (scripts.length > 10) {
            issues.push({
              severity: 'info',
              message: `Many scripts (${scripts.length})`,
              fix: 'Minimize and combine scripts',
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
   * Get rules by category
   */
  getRulesByCategory(category) {
    return this.rules.filter(rule => rule.category === category);
  }

  /**
   * Run all rules
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
            category: rule.category,
            ...issue,
          });
        });
      } catch (error) {
        console.error(`Error running SEO rule ${rule.id}:`, error);
      }
    });

    return allIssues;
  }

  /**
   * Calculate SEO score
   */
  calculateScore(issues) {
    const totalRules = this.rules.length;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    // Errors: -10 points each, Warnings: -5 points each
    const deductions = errorCount * 10 + warningCount * 5;
    const score = Math.max(0, 100 - deductions);

    return Math.round(score);
  }
}

// Export globally
window.SEORules = SEORules;
window.seoRules = new SEORules();
