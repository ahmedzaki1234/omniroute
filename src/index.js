// Main entry point for OmniRoute library
const RouteManager = require('./core/RouteManager');
const AIProvider = require('./core/AIProvider');
const Config = require('./config/Config');
const Logger = require('./utils/Logger');

class OmniRoute {
  constructor(config = {}) {
    this.config = new Config(config);
    this.logger = new Logger();
    this.routeManager = new RouteManager(this.config);
    this.providers = new Map();
    this.initialized = false;
  }

  /**
   * Initialize OmniRoute
   */
  async init() {
    try {
      this.logger.info('🚀 Initializing OmniRoute...');
      await this.config.load();
      this.initialized = true;
      this.logger.success('✅ OmniRoute initialized successfully');
      return this;
    } catch (error) {
      this.logger.error('Failed to initialize OmniRoute:', error.message);
      throw error;
    }
  }

  /**
   * Register an AI provider
   * @param {string} name - Provider name (e.g., 'openai', 'claude', 'google')
   * @param {object} credentials - API credentials
   */
  registerProvider(name, credentials) {
    if (!this.initialized) {
      throw new Error('OmniRoute must be initialized first. Call init() method.');
    }

    const provider = new AIProvider(name, credentials);
    this.providers.set(name, provider);
    this.logger.info(`✓ Provider registered: ${name}`);
    return this;
  }

  /**
   * Send a request to an AI provider
   * @param {string} provider - Provider name
   * @param {object} options - Request options
   * @returns {Promise<object>} Response from AI provider
   */
  async sendRequest(provider, options) {
    if (!this.initialized) {
      throw new Error('OmniRoute must be initialized first. Call init() method.');
    }

    if (!this.providers.has(provider)) {
      throw new Error(`Provider '${provider}' is not registered`);
    }

    const aiProvider = this.providers.get(provider);
    return await aiProvider.send(options);
  }

  /**
   * Smart routing - automatically chooses best provider
   * @param {object} options - Request options
   * @returns {Promise<object>} Response from best suited provider
   */
  async smartRoute(options) {
    if (!this.initialized) {
      throw new Error('OmniRoute must be initialized first. Call init() method.');
    }

    return await this.routeManager.route(options, this.providers);
  }

  /**
   * Get registered providers
   * @returns {array} List of provider names
   */
  getProviders() {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   * @param {string} name - Provider name
   * @returns {boolean}
   */
  hasProvider(name) {
    return this.providers.has(name);
  }
}

module.exports = OmniRoute;