/**
 * AI Component Generator - v1.0
 *
 * Generates HTML components using Gemini API with multiple style presets.
 * Supports refinement, variations, and iterative improvements.
 */

class AIComponentGenerator {
  constructor() {
    this.apiKey = null;
    this.apiEndpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent';
    this.enabled = false;
    this.maxRetries = 2;
    this.retryDelay = 2000;

    this.loadApiKey();
  }

  /**
   * Load API key from localStorage
   */
  loadApiKey() {
    this.apiKey = localStorage.getItem('gemini_api_key');
    this.enabled = !!this.apiKey;
  }

  /**
   * Set API key
   */
  setApiKey(key) {
    if (!key || key.trim() === '') {
      throw new Error('Invalid API key');
    }

    this.apiKey = key.trim();
    localStorage.setItem('gemini_api_key', this.apiKey);
    this.enabled = true;
  }

  /**
   * Check if generator is enabled
   */
  isEnabled() {
    return this.enabled && this.apiKey !== null;
  }

  /**
   * Generate component from description
   */
  async generate(description, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('AI Component Generator is not enabled. Please configure Gemini API key.');
    }

    const {
      style = 'modern',
      maxLines = 300,
      includeJS = false,
      responsive = true,
      accessible = true,
    } = options;

    // Check token limits
    const limitCheck = window.tokenTracker.checkLimits();
    if (!limitCheck.canProceed) {
      throw new Error('Token limit exceeded. Please try again later.');
    }

    // Build prompt
    const prompt = window.promptBuilder.buildComponentPrompt(description, style, {
      maxLines,
      includeJS,
      responsive,
      accessible,
    });

    // Estimate tokens
    const estimation = window.promptBuilder.estimateTokens(prompt);
    if (!estimation.canAfford) {
      throw new Error(
        `Prompt too long (${estimation.estimated} tokens). Please shorten your description.`
      );
    }

    // Dispatch start event
    window.dispatchEvent(
      new CustomEvent('ai:generation:start', {
        detail: { description, style, options },
      })
    );

    try {
      // Call Gemini API
      const apiResponse = await this.callGeminiAPI(prompt, {
        maxOutputTokens: 2048,
        temperature: 0.7,
      });

      // Parse response
      const parsed = window.responseParser.parseComponentResponse(apiResponse);

      if (!parsed.success) {
        throw new Error(parsed.error || 'Failed to parse component response');
      }

      // Track tokens
      window.tokenTracker.track(
        { inputTokens: parsed.tokens.input, outputTokens: parsed.tokens.output },
        'component-generation',
        { description, style }
      );

      // Dispatch complete event
      window.dispatchEvent(
        new CustomEvent('ai:generation:complete', {
          detail: { html: parsed.html, tokens: parsed.tokens },
        })
      );

      return {
        success: true,
        html: parsed.html,
        tokens: parsed.tokens,
        validation: parsed.validation,
      };
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('ai:generation:error', {
          detail: { error: error.message },
        })
      );
      throw error;
    }
  }

  /**
   * Refine existing component based on feedback
   */
  async refine(html, feedback) {
    if (!this.isEnabled()) {
      throw new Error('AI Component Generator is not enabled.');
    }

    const limitCheck = window.tokenTracker.checkLimits();
    if (!limitCheck.canProceed) {
      throw new Error('Token limit exceeded.');
    }

    const prompt = window.promptBuilder.buildRefinementPrompt(html, feedback);

    try {
      const apiResponse = await this.callGeminiAPI(prompt, {
        maxOutputTokens: 2048,
        temperature: 0.5,
      });

      const parsed = window.responseParser.parseComponentResponse(apiResponse);

      if (!parsed.success) {
        throw new Error(parsed.error || 'Failed to parse refinement response');
      }

      window.tokenTracker.track(
        { inputTokens: parsed.tokens.input, outputTokens: parsed.tokens.output },
        'component-refinement',
        { feedback }
      );

      return {
        success: true,
        html: parsed.html,
        tokens: parsed.tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate variations of a component
   */
  async generateVariations(html, count = 3) {
    if (!this.isEnabled()) {
      throw new Error('AI Component Generator is not enabled.');
    }

    const limitCheck = window.tokenTracker.checkLimits();
    if (!limitCheck.canProceed) {
      throw new Error('Token limit exceeded.');
    }

    const prompt = window.promptBuilder.buildVariationsPrompt(html, count);

    try {
      const apiResponse = await this.callGeminiAPI(prompt, {
        maxOutputTokens: 2048,
        temperature: 0.8,
      });

      const parsed = window.responseParser.parseVariationsResponse(apiResponse);

      if (!parsed.success) {
        throw new Error(parsed.error || 'Failed to parse variations response');
      }

      window.tokenTracker.track(
        { inputTokens: parsed.tokens.input, outputTokens: parsed.tokens.output },
        'component-variations',
        { count }
      );

      return {
        success: true,
        variations: parsed.variations,
        tokens: parsed.tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Estimate tokens for a generation request
   */
  estimateTokens(description, style = 'modern') {
    const prompt = window.promptBuilder.buildComponentPrompt(description, style);
    return window.tokenTracker.estimateTokens(prompt);
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt, config = {}, retryCount = 0) {
    const { maxOutputTokens = 2048, temperature = 0.7, topK = 40, topP = 0.95 } = config;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature,
        topK,
        topP,
        maxOutputTokens,
        stopSequences: [],
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Retry logic for rate limits
      if (retryCount < this.maxRetries && error.message.includes('429')) {
        console.log(`⏳ Rate limit reached, retrying... (${retryCount + 1}/${this.maxRetries})`);
        await this.sleep(this.retryDelay * (retryCount + 1));
        return this.callGeminiAPI(prompt, config, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get available style presets
   */
  getStylePresets() {
    return window.promptBuilder.getStylePresets();
  }
}

// Export globally
window.AIComponentGenerator = AIComponentGenerator;
window.aiComponentGenerator = new AIComponentGenerator();
