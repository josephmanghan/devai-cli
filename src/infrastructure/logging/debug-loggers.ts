/**
 * Debug loggers for devai-cli application
 * Each namespace provides targeted debugging information
 * No output appears unless DEBUG=devai-cli:* is set
 */

import debug from 'debug';

// Git operations logger - tracks git commands and their execution
export const gitLogger = debug('devai-cli:git');

// LLM interactions logger - tracks Ollama API calls and responses
export const llmLogger = debug('devai-cli:llm');

// Performance metrics logger - tracks timing and performance data
export const perfLogger = debug('devai-cli:perf');

// Validation logger - tracks input validation and format checking
export const validationLogger = debug('devai-cli:validation');

// Error logger - tracks error handling and recovery attempts
export const errorLogger = debug('devai-cli:error');

// Debug logger - general debug information
export const debugLogger = debug('devai-cli:debug');
