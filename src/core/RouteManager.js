// Route Manager for intelligent routing
const Logger = require('../utils/Logger');

class RouteManager {
  constructor(config) {
    this.config = config;
    this.logger = new Logger();
    this.routingStrategies = {
      round_robin: this.roundRobin,
      least_used: this.leastUsed,
      fastest: this.fastest,
      cost_optimized: this.costOptimized
    };
  }

  /**
   * Route request to best provider based on strategy
   */
  async route(options, providers) {
    const strategy = options.strategy || this.config.get('strategy') || 'round_robin';
    
    if (!this.routingStrategies[strategy]) {
      throw new Error(`Unknown routing strategy: ${strategy}`);
    }

    const selectedProvider = this.routingStrategies[strategy].call(this, options, providers);
    
    if (!selectedProvider) {
      throw new Error('No providers available for routing');
    }

    this.logger.info(`📍 Routing to provider: ${selectedProvider}`);
    return await providers.get(selectedProvider).send(options);
  }

  /**
   * Round robin strategy - cycles through providers
   */
  roundRobin(options, providers) {
    const providerNames = Array.from(providers.keys());
    const index = Math.floor(Math.random() * providerNames.length);
    return providerNames[index];
  }

  /**
   * Least used strategy - uses provider with fewest requests
   */
  leastUsed(options, providers) {
    let leastUsedProvider = null;
    let minRequests = Infinity;

    providers.forEach((provider, name) => {
      if (provider.requestCount < minRequests) {
        minRequests = provider.requestCount;
        leastUsedProvider = name;
      }
    });

    return leastUsedProvider;
  }

  /**
   * Fastest strategy - uses provider with shortest response times
   */
  fastest(options, providers) {
    let fastestProvider = null;
    let minDuration = Infinity;

    providers.forEach((provider, name) => {
      if (provider.lastRequestTime && provider.lastDuration < minDuration) {
        minDuration = provider.lastDuration;
        fastestProvider = name;
      }
    });

    return fastestProvider || Array.from(providers.keys())[0];
  }

  /**
   * Cost optimized strategy - balances cost and quality
   */
  costOptimized(options, providers) {
    const costMap = {
      openai: 0.002,
      claude: 0.003,
      google: 0.001,
      cohere: 0.0005,
      huggingface: 0.0001
    };

    let bestProvider = null;
    let bestScore = Infinity;

    providers.forEach((provider, name) => {
      const cost = costMap[name] || 0.001;
      const score = cost * (1 + provider.requestCount / 100);
      
      if (score < bestScore) {
        bestScore = score;
        bestProvider = name;
      }
    });

    return bestProvider;
  }
}

module.exports = RouteManager;