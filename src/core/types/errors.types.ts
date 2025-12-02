import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import debug from 'debug';

const logError = debug('devai-cli:error');
const logDebug = debug('devai-cli:debug');

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly remediation?: string
  ) {
    super(message);
    this.name = 'AppError';

    if (Error.captureStackTrace !== undefined) {
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
    const debugDir = join(homedir(), '.devai-cli');
    const debugFile = join(debugDir, 'debug.log');
    this.ensureDebugDir(debugDir);
    const logEntry = this.createLogEntry();
    return await this.writeLogEntry(debugFile, logEntry);
  }

  private ensureDebugDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private createLogEntry() {
    return {
      ...this.serializeToDebugObject(),
      pid: process.pid,
    };
  }

  private writeLogEntry(file: string, entry: object): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = createWriteStream(file, { flags: 'a' });
      stream.write(JSON.stringify(entry) + '\n', 'utf8', error => {
        stream.end();
        if (error !== null && error !== undefined) {
          reject(error);
        } else {
          resolve();
        }
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
