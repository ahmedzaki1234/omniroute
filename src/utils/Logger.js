// Logger utility
const chalk = require('chalk');

class Logger {
  constructor() {
    this.timestamp = true;
  }

  /**
   * Get current timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(message, withTimestamp = true) {
    if (withTimestamp) {
      return `[${this.getTimestamp()}] ${message}`;
    }
    return message;
  }

  /**
   * Log info message
   */
  info(message) {
    console.log(chalk.blue(this.formatMessage(message)));
  }

  /**
   * Log success message
   */
  success(message) {
    console.log(chalk.green(this.formatMessage(message)));
  }

  /**
   * Log warning message
   */
  warn(message) {
    console.warn(chalk.yellow(this.formatMessage(message)));
  }

  /**
   * Log error message
   */
  error(message, error = null) {
    console.error(chalk.red(this.formatMessage(message)));
    if (error) {
      console.error(chalk.red(error));
    }
  }

  /**
   * Log debug message
   */
  debug(message) {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.log(chalk.magenta(this.formatMessage(message)));
    }
  }
}

module.exports = Logger;
