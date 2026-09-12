// Configuration manager
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

class Config {
  constructor(customConfig = {}) {
    this.values = {
      strategy: 'round_robin',
      timeout: 30000,
      retries: 3,
      cache: false,
      cacheExpiry: 3600,
      ...customConfig
    };

    this.envFile = path.join(process.cwd(), '.env');
    this.configFile = path.join(process.cwd(), 'omniroute.config.json');
  }

  /**
   * Load configuration from files and environment
   */
  async load() {
    // Load .env file
    if (fs.existsSync(this.envFile)) {
      dotenv.config({ path: this.envFile });
    }

    // Load JSON config file
    if (fs.existsSync(this.configFile)) {
      try {
        const fileConfig = JSON.parse(
          fs.readFileSync(this.configFile, 'utf8')
        );
        this.values = { ...this.values, ...fileConfig };
      } catch (error) {
        console.error('Failed to parse omniroute.config.json:', error.message);
      }
    }

    // Load from environment variables
    if (process.env.OMNIROUTE_STRATEGY) {
      this.values.strategy = process.env.OMNIROUTE_STRATEGY;
    }

    return this;
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    return this.values[key] !== undefined ? this.values[key] : defaultValue;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    this.values[key] = value;
    return this;
  }

  /**
   * Save configuration to file
   */
  save() {
    fs.writeFileSync(
      this.configFile,
      JSON.stringify(this.values, null, 2),
      'utf8'
    );
    return this;
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.values };
  }
}

module.exports = Config;
