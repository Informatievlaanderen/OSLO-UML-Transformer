export const LOG_LEVELS = <const>['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

/**
 * Different log levels, from most important to least important.
 */
export type LogLevel = typeof LOG_LEVELS[number];
