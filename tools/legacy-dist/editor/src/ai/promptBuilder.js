/**
 * Prompt Builder - v1.0
 *
 * Builds optimized prompts for Gemini API to minimize token usage.
 * Provides templates for different AI features.
 */

class PromptBuilder {
  constructor() {
    this.stylePresets = {
      modern: {
        name: 'Modern',
        description: 'Clean, minimalist design with subtle shadows',
        keywords: 'modern, clean, minimalist, subtle shadows, rounded corners',
      },
      gradient: {
        name: 'Gradient',
        description: 'Vibrant gradients and bold colors',
        keywords: 'gradient backgrounds, vibrant colors, bold, eye-catching',
      },
      glassmorphism: {
        name: 'Glassmorphism',
        description: 'Frosted glass effect with backdrop blur',
        keywords: 'glassmorphism, frosted glass, backdrop-filter, translucent',
      },
      neumorphism: {
        name: 'Neumorphism',
        description: 'Soft UI with subtle 3D effects',
        keywords: 'neumorphism, soft shadows, 3D effect, subtle depth',
      },
      brutalist: {
        name: 'Brutalist',
        description: 'Bold, raw, and unconventional design',
        keywords: 'brutalist, bold typography, raw design, high contrast',
      },
    };
  }

  /**
   * Build prompt for component generation
   */
  buildComponentPrompt(description, style = 'modern', options = {}) {
    const { maxLines = 300, includeJS = false, responsive = true, accessible = true } = options;

    const styleInfo = this.stylePresets[style] || this.stylePresets.modern;

    return `Generate HTML component: ${description}

Style: ${styleInfo.name} - ${styleInfo.keywords}

Requirements:
- Semantic HTML5 elements
- Inline CSS only (no external stylesheets)
- ${responsive ? 'Responsive design (mobile-first)' : 'Fixed width design'}
- ${accessible ? 'WCAG 2.1 AA accessible (ARIA labels, semantic tags)' : 'Basic accessibility'}
- Max ${maxLines} lines
${includeJS ? '- Include minimal inline JavaScript if needed' : '- No JavaScript'}

Return ONLY the HTML code, no explanations.`;
  }

  /**
   * Build prompt for component refinement
   */
  buildRefinementPrompt(html, feedback) {
    return `Refine this HTML component based on feedback.

Current HTML:
${html.substring(0, 1000)}

Feedback: ${feedback}

Rules:
- Keep semantic structure
- Maintain inline CSS
- Apply requested changes only
- Return ONLY the refined HTML code`;
  }

  /**
   * Build prompt for component variations
   */
  buildVariationsPrompt(html, count = 3) {
    return `Generate ${count} variations of this component with different styles.

Base HTML:
${html.substring(0, 800)}

Requirements:
- Keep same structure and content
- Change colors, spacing, typography
- Each variation should be visually distinct
- Return as JSON array: [{"style": "name", "html": "code"}]`;
  }

  /**
   * Build prompt for accessibility check
   */
  buildAccessibilityPrompt(html) {
    return `Analyze accessibility issues in this HTML (WCAG 2.1 AA).

HTML:
${html.substring(0, 1000)}

Check for:
- Missing alt text on images
- Missing ARIA labels
- Color contrast issues
- Semantic HTML usage
- Keyboard navigation
- Form labels

Return JSON: {"issues": [{"type": "...", "severity": "...", "message": "...", "fix": "..."}]}`;
  }

  /**
   * Build prompt for SEO optimization
   */
  buildSEOPrompt(html, context = {}) {
    const { title = '', description = '', keywords = [] } = context;

    return `Analyze SEO for this HTML page.

HTML:
${html.substring(0, 1500)}

Context:
- Title: ${title || 'Not provided'}
- Description: ${description || 'Not provided'}
- Keywords: ${keywords.join(', ') || 'Not provided'}

Analyze:
- Meta tags (title, description, OG tags)
- Heading structure (H1-H6)
- Image alt attributes
- Semantic HTML
- Content structure
- Mobile-friendliness

Return JSON: {
  "score": 0-100,
  "issues": [{"type": "...", "severity": "...", "message": "..."}],
  "suggestions": {
    "title": "...",
    "description": "...",
    "keywords": ["..."],
    "metaTags": {"og:title": "...", ...}
  }
}`;
  }

  /**
   * Build prompt for meta tag generation
   */
  buildMetaTagsPrompt(content, context = {}) {
    return `Generate SEO-optimized meta tags for this content.

Content:
${content.substring(0, 1000)}

Context: ${JSON.stringify(context)}

Generate:
- <title> (50-60 chars)
- <meta name="description"> (150-160 chars)
- Open Graph tags (og:title, og:description, og:image, og:type)
- Twitter Card tags
- Keywords (5-10 relevant keywords)

Return as JSON: {"title": "...", "description": "...", "keywords": [...], "og": {...}, "twitter": {...}}`;
  }

  /**
   * Build prompt for code validation
   */
  buildValidationPrompt(html) {
    return `Validate and fix HTML/CSS syntax errors.

HTML:
${html.substring(0, 1000)}

Fix:
- Unclosed tags
- Invalid CSS properties
- Malformed attributes
- Semantic issues

Return ONLY the corrected HTML code.`;
  }

  /**
   * Build prompt for responsive optimization
   */
  buildResponsivePrompt(html) {
    return `Make this component responsive (mobile-first).

HTML:
${html.substring(0, 1000)}

Add:
- Flexible layouts (flexbox/grid)
- Responsive units (%, rem, vw/vh)
- Media query styles inline
- Mobile-friendly spacing

Return ONLY the responsive HTML code.`;
  }

  /**
   * Build prompt for color scheme generation
   */
  buildColorSchemePrompt(baseColor, theme = 'light') {
    return `Generate a ${theme} color scheme based on: ${baseColor}

Create:
- Primary color
- Secondary color
- Accent color
- Background colors (3 shades)
- Text colors (3 shades)
- Success, warning, error colors

Return as JSON: {"primary": "#...", "secondary": "#...", ...}`;
  }

  /**
   * Estimate tokens for a prompt
   */
  estimateTokens(prompt) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(prompt.length / 4);
  }

  /**
   * Get all style presets
   */
  getStylePresets() {
    return this.stylePresets;
  }

  /**
   * Validate prompt length
   */
  validatePrompt(prompt, maxTokens = 2048) {
    const estimated = this.estimateTokens(prompt);
    return {
      valid: estimated <= maxTokens,
      estimated,
      maxTokens,
      remaining: maxTokens - estimated,
    };
  }
}

// Export globally
window.PromptBuilder = PromptBuilder;
window.promptBuilder = new PromptBuilder();
