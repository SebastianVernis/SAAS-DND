/**
 * Response Parser - v1.0
 *
 * Parses and validates responses from Gemini API.
 * Extracts HTML, JSON, and other structured data.
 */

class ResponseParser {
  constructor() {
    this.codeBlockRegex = /```(?:html|javascript|css)?\n?([\s\S]*?)```/g;
    this.jsonRegex = /\{[\s\S]*\}/;
  }

  /**
   * Parse Gemini API response
   */
  parseResponse(apiResponse) {
    try {
      const candidates = apiResponse.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No candidates in response');
      }

      const content = candidates[0].content;
      if (!content || !content.parts || content.parts.length === 0) {
        throw new Error('No content in response');
      }

      const text = content.parts[0].text;
      const usageMetadata = apiResponse.usageMetadata || {};

      return {
        success: true,
        text,
        tokens: {
          input: usageMetadata.promptTokenCount || 0,
          output: usageMetadata.candidatesTokenCount || 0,
          total: usageMetadata.totalTokenCount || 0,
        },
        finishReason: candidates[0].finishReason || 'STOP',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        text: null,
        tokens: { input: 0, output: 0, total: 0 },
      };
    }
  }

  /**
   * Extract HTML code from response
   */
  extractHTML(text) {
    if (!text) return null;

    // Try to extract from code blocks first
    const codeBlocks = this.extractCodeBlocks(text);
    if (codeBlocks.length > 0) {
      return codeBlocks[0].code;
    }

    // If no code blocks, try to find HTML tags
    const htmlMatch = text.match(/<[^>]+>/);
    if (htmlMatch) {
      // Extract everything from first < to last >
      const firstTag = text.indexOf('<');
      const lastTag = text.lastIndexOf('>');
      if (firstTag !== -1 && lastTag !== -1) {
        return text.substring(firstTag, lastTag + 1).trim();
      }
    }

    // Return cleaned text as fallback
    return text.trim();
  }

  /**
   * Extract JSON from response
   */
  extractJSON(text) {
    if (!text) return null;

    try {
      // Try to parse entire text as JSON
      return JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from code blocks
      const codeBlocks = this.extractCodeBlocks(text);
      for (const block of codeBlocks) {
        try {
          return JSON.parse(block.code);
        } catch (err) {
          continue;
        }
      }

      // Try to find JSON object in text
      const jsonMatch = text.match(this.jsonRegex);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (err) {
          // Continue to next attempt
        }
      }

      return null;
    }
  }

  /**
   * Extract code blocks from markdown
   */
  extractCodeBlocks(text) {
    const blocks = [];
    let match;

    // Reset regex
    this.codeBlockRegex.lastIndex = 0;

    while ((match = this.codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        code: match[1].trim(),
        language: match[0].match(/```(\w+)/)?.[1] || 'unknown',
      });
    }

    return blocks;
  }

  /**
   * Clean HTML code
   */
  cleanHTML(html) {
    if (!html) return '';

    return (
      html
        .trim()
        // Remove markdown code block markers
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        // Remove excessive whitespace
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Normalize line endings
        .replace(/\r\n/g, '\n')
    );
  }

  /**
   * Validate HTML structure
   */
  validateHTML(html) {
    const issues = [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Check for parser errors
      const parserErrors = doc.querySelectorAll('parsererror');
      if (parserErrors.length > 0) {
        issues.push({
          type: 'syntax',
          severity: 'error',
          message: 'HTML parsing error detected',
        });
      }

      // Check for basic structure
      if (!html.includes('<')) {
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'No HTML tags found',
        });
      }

      // Check for unclosed tags (basic check)
      const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
      const closeTags = (html.match(/<\/[^>]+>/g) || []).length;
      const selfClosing = (html.match(/<[^>]+\/>/g) || []).length;

      if (openTags - selfClosing !== closeTags) {
        issues.push({
          type: 'structure',
          severity: 'warning',
          message: 'Possible unclosed tags detected',
        });
      }
    } catch (error) {
      issues.push({
        type: 'validation',
        severity: 'error',
        message: error.message,
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
    };
  }

  /**
   * Parse component generation response
   */
  parseComponentResponse(apiResponse) {
    const parsed = this.parseResponse(apiResponse);
    if (!parsed.success) {
      return parsed;
    }

    const html = this.extractHTML(parsed.text);
    const cleaned = this.cleanHTML(html);
    const validation = this.validateHTML(cleaned);

    return {
      success: validation.valid,
      html: cleaned,
      tokens: parsed.tokens,
      validation,
      raw: parsed.text,
    };
  }

  /**
   * Parse accessibility check response
   */
  parseAccessibilityResponse(apiResponse) {
    const parsed = this.parseResponse(apiResponse);
    if (!parsed.success) {
      return parsed;
    }

    const json = this.extractJSON(parsed.text);
    if (!json || !json.issues) {
      return {
        success: false,
        error: 'Invalid accessibility response format',
        tokens: parsed.tokens,
      };
    }

    return {
      success: true,
      issues: json.issues,
      tokens: parsed.tokens,
      raw: parsed.text,
    };
  }

  /**
   * Parse SEO analysis response
   */
  parseSEOResponse(apiResponse) {
    const parsed = this.parseResponse(apiResponse);
    if (!parsed.success) {
      return parsed;
    }

    const json = this.extractJSON(parsed.text);
    if (!json || typeof json.score === 'undefined') {
      return {
        success: false,
        error: 'Invalid SEO response format',
        tokens: parsed.tokens,
      };
    }

    return {
      success: true,
      score: json.score,
      issues: json.issues || [],
      suggestions: json.suggestions || {},
      tokens: parsed.tokens,
      raw: parsed.text,
    };
  }

  /**
   * Parse variations response
   */
  parseVariationsResponse(apiResponse) {
    const parsed = this.parseResponse(apiResponse);
    if (!parsed.success) {
      return parsed;
    }

    const json = this.extractJSON(parsed.text);
    if (!json || !Array.isArray(json)) {
      return {
        success: false,
        error: 'Invalid variations response format',
        tokens: parsed.tokens,
      };
    }

    return {
      success: true,
      variations: json.map(v => ({
        style: v.style || 'Unknown',
        html: this.cleanHTML(v.html),
      })),
      tokens: parsed.tokens,
      raw: parsed.text,
    };
  }

  /**
   * Parse meta tags response
   */
  parseMetaTagsResponse(apiResponse) {
    const parsed = this.parseResponse(apiResponse);
    if (!parsed.success) {
      return parsed;
    }

    const json = this.extractJSON(parsed.text);
    if (!json || !json.title) {
      return {
        success: false,
        error: 'Invalid meta tags response format',
        tokens: parsed.tokens,
      };
    }

    return {
      success: true,
      metaTags: {
        title: json.title,
        description: json.description,
        keywords: json.keywords || [],
        og: json.og || {},
        twitter: json.twitter || {},
      },
      tokens: parsed.tokens,
      raw: parsed.text,
    };
  }

  /**
   * Format error message
   */
  formatError(error) {
    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return 'Unknown error occurred';
  }
}

// Export globally
window.ResponseParser = ResponseParser;
window.responseParser = new ResponseParser();
