/**
 * Infrastructure layer barrel file
 *
 * This layer contains adapter implementations that connect to external systems.
 * Infrastructure depends on Core ports but implements the interfaces.
 */

export * from './adapters/index.js';
export * from './logging/index.js';
