/**
 * Custom error class for ollatool application
 * Provides typed exit codes and debug serialization
 */

import debug from 'debug';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

// Debug logger instances - only output when DEBUG=ollatool:* is set
const logError = debug('ollatool:error');
const logDebug = debug('ollatool:debug');

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly remediation?: string,
  ) {
    super(message);
    this.name = 'AppError';

    // Ensure proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error to debug object for file output
   */
  serializeToDebugObject() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      remediation: this.remediation,
      stack: this.stack,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Write error to debug log file
   */
  async writeToDebugLog(): Promise<void> {
    const debugDir = join(homedir(), '.ollatool');
    const debugFile = join(debugDir, 'debug.log');

    // Ensure debug directory exists
    if (!existsSync(debugDir)) {
      mkdirSync(debugDir, { recursive: true });
    }

    const logEntry = {
      ...this.serializeToDebugObject(),
      pid: process.pid,
    };

    return new Promise((resolve, reject) => {
      const stream = createWriteStream(debugFile, { flags: 'a' });
      stream.write(JSON.stringify(logEntry) + '\n', 'utf8', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
        stream.end();
      });
    });
  }
}

export class UserError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 2, remediation);
    this.name = 'UserError';
    logError('User error occurred:', { message, remediation });
  }
}

export class SystemError extends AppError {
  constructor(message: string, remediation: string) {
    super(message, 3, remediation);
    this.name = 'SystemError';
    logError('System error occurred:', { message, remediation });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, remediation?: string) {
    super(message, 4, remediation);
    this.name = 'ValidationError';
    logError('Validation error occurred:', { message, remediation });
  }
}

export class UnexpectedError extends AppError {
  constructor(message: string, remediation?: string) {
    super(message, 5, remediation);
    this.name = 'UnexpectedError';
    logError('Unexpected error occurred:', { message, remediation });
  }

  /**
   * Write unexpected errors to debug log automatically
   */
  async logToDebugFile(): Promise<void> {
    logDebug('Writing unexpected error to debug log');
    await this.writeToDebugLog();
  }
}
