// Core AI Provider class
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class AIProvider {
  constructor(name, credentials) {
    this.name = name;
    this.credentials = credentials;
    this.baseURL = this.getBaseURL(name);
    this.requestCount = 0;
    this.lastRequestTime = null;
  }

  /**
   * Get base URL for each provider
   */
  getBaseURL(provider) {
    const urls = {
      openai: 'https://api.openai.com/v1',
      claude: 'https://api.anthropic.com',
      google: 'https://generativelanguage.googleapis.com',
      cohere: 'https://api.cohere.ai',
      huggingface: 'https://api-inference.huggingface.co'
    };
    return urls[provider] || '';
  }

  /**
   * Send request to AI provider
   */
  async send(options) {
    const startTime = Date.now();
    const requestId = uuidv4();

    try {
      const config = this.buildRequestConfig(options);
      const response = await axios(config);

      const duration = Date.now() - startTime;
      this.requestCount++;
      this.lastRequestTime = new Date();

      return {
        success: true,
        data: response.data,
        provider: this.name,
        requestId,
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        error: error.message,
        provider: this.name,
        requestId,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Build axios request config based on provider
   */
  buildRequestConfig(options) {
    const headers = this.getHeaders();
    
    switch (this.name) {
      case 'openai':
        return {
          method: 'POST',
          url: `${this.baseURL}/chat/completions`,
          headers,
          data: {
            model: options.model || 'gpt-3.5-turbo',
            messages: options.messages || [],
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
          }
        };

      case 'claude':
        return {
          method: 'POST',
          url: `${this.baseURL}/messages`,
          headers,
          data: {
            model: options.model || 'claude-3-opus-20240229',
            max_tokens: options.maxTokens || 2000,
            messages: options.messages || [],
            system: options.systemPrompt || ''
          }
        };

      case 'google':
        return {
          method: 'POST',
          url: `${this.baseURL}/v1/models/gemini-pro:generateContent`,
          headers,
          data: {
            contents: options.contents || []
          }
        };

      default:
        return {
          method: 'POST',
          url: this.baseURL,
          headers,
          data: options
        };
    }
  }

  /**
   * Get headers with API key
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    switch (this.name) {
      case 'openai':
        headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
        break;
      case 'claude':
        headers['x-api-key'] = this.credentials.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'google':
        headers['x-goog-api-key'] = this.credentials.apiKey;
        break;
      case 'cohere':
        headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
        break;
      case 'huggingface':
        headers['Authorization'] = `Bearer ${this.credentials.apiKey}`;
        break;
    }

    return headers;
  }

  /**
   * Get provider stats
   */
  getStats() {
    return {
      name: this.name,
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime
    };
  }
}

module.exports = AIProvider;