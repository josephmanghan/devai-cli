/**
 * Debug loggers for ollatool application
 * Each namespace provides targeted debugging information
 * No output appears unless DEBUG=ollatool:* is set
 */

import debug from 'debug';

// Git operations logger - tracks git commands and their execution
export const gitLogger = debug('ollatool:git');

// LLM interactions logger - tracks Ollama API calls and responses
export const llmLogger = debug('ollatool:llm');

// Performance metrics logger - tracks timing and performance data
export const perfLogger = debug('ollatool:perf');

// Validation logger - tracks input validation and format checking
export const validationLogger = debug('ollatool:validation');

// Error logger - tracks error handling and recovery attempts
export const errorLogger = debug('ollatool:error');

// Debug logger - general debug information
export const debugLogger = debug('ollatool:debug');