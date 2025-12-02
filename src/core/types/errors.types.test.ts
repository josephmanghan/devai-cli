import { existsSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AppError,
  SystemError,
  UnexpectedError,
  UserError,
  ValidationError,
} from './errors.types.js';

vi.mock('debug', () => {
  return {
    default: vi.fn(() => vi.fn()),
  };
});

const debugLog = join(homedir(), '.ollatool', 'debug.log');

describe('AppError', () => {
  beforeEach(() => {
    if (existsSync(debugLog)) {
      unlinkSync(debugLog);
    }
  });

  afterEach(() => {
    if (existsSync(debugLog)) {
      unlinkSync(debugLog);
    }
  });

  describe('constructor and basic properties', () => {
    it('should create AppError with required properties', () => {
      const error = new AppError('Test message', 1, 'Test remediation');

      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe(1);
      expect(error.remediation).toBe('Test remediation');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create AppError without remediation', () => {
      const error = new AppError('Test message', 1);

      expect(error.name).toBe('AppError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe(1);
      expect(error.remediation).toBeUndefined();
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test message', 1);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
      expect(error.stack).toContain('Test message');
    });
  });

  describe('serialization', () => {
    it('should serialize error with all properties', () => {
      const error = new AppError('Test message', 2, 'Fix the issue');
      const serialized = error.serializeToDebugObject();

      expect(serialized).toEqual({
        name: 'AppError',
        message: 'Test message',
        code: 2,
        remediation: 'Fix the issue',
        stack: expect.stringContaining('AppError'),
        timestamp: expect.any(String),
      });

      expect(serialized.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
      );
    });

    it('should serialize error without remediation', () => {
      const error = new AppError('Test message', 3);
      const serialized = error.serializeToDebugObject();

      expect(serialized).toEqual({
        name: 'AppError',
        message: 'Test message',
        code: 3,
        remediation: undefined,
        stack: expect.stringContaining('AppError'),
        timestamp: expect.any(String),
      });
    });
  });

  describe('debug logging', () => {
    it('should write error to debug log file', async () => {
      const error = new AppError('Test message', 1, 'Test remediation');
      await error.writeToDebugLog();

      // Verify debug file was created and contains the error
      expect(existsSync(debugLog)).toBe(true);

      const fs = await import('node:fs');
      const logContent = await fs.promises.readFile(debugLog, 'utf8');
      const logEntry = JSON.parse(logContent.trim());

      expect(logEntry).toEqual({
        name: 'AppError',
        message: 'Test message',
        code: 1,
        remediation: 'Test remediation',
        stack: error.stack,
        timestamp: expect.any(String),
        pid: expect.any(Number),
      });
    });

    it('should handle multiple errors in the same log file', async () => {
      const error1 = new AppError('First error', 1);
      const error2 = new AppError('Second error', 2);

      await error1.writeToDebugLog();
      await error2.writeToDebugLog();

      expect(existsSync(debugLog)).toBe(true);

      const fs = await import('node:fs');
      const logContent = await fs.promises.readFile(debugLog, 'utf8');
      const lines = logContent.trim().split('\n');

      expect(lines).toHaveLength(2);

      const logEntry1 = JSON.parse(lines[0]);
      const logEntry2 = JSON.parse(lines[1]);

      expect(logEntry1.message).toBe('First error');
      expect(logEntry1.code).toBe(1);
      expect(logEntry2.message).toBe('Second error');
      expect(logEntry2.code).toBe(2);
    });
  });
});

describe('UserError', () => {
  it('should create UserError with exit code 2', () => {
    const error = new UserError(
      'User input invalid',
      'Check your input and try again'
    );

    expect(error.name).toBe('UserError');
    expect(error.message).toBe('User input invalid');
    expect(error.code).toBe(2);
    expect(error.remediation).toBe('Check your input and try again');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(UserError);
  });
});

describe('SystemError', () => {
  it('should create SystemError with exit code 3', () => {
    const error = new SystemError(
      'Ollama not running',
      'Start Ollama with: ollama serve'
    );

    expect(error.name).toBe('SystemError');
    expect(error.message).toBe('Ollama not running');
    expect(error.code).toBe(3);
    expect(error.remediation).toBe('Start Ollama with: ollama serve');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(SystemError);
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with exit code 4', () => {
    const error = new ValidationError(
      'Invalid commit format',
      'Use conventional commit format'
    );

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid commit format');
    expect(error.code).toBe(4);
    expect(error.remediation).toBe('Use conventional commit format');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should create ValidationError without remediation', () => {
    const error = new ValidationError('Invalid format');

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Invalid format');
    expect(error.code).toBe(4);
    expect(error.remediation).toBeUndefined();
  });
});

describe('UnexpectedError', () => {
  it('should create UnexpectedError with exit code 5', () => {
    const error = new UnexpectedError(
      'Database connection failed',
      'Contact support'
    );

    expect(error.name).toBe('UnexpectedError');
    expect(error.message).toBe('Database connection failed');
    expect(error.code).toBe(5);
    expect(error.remediation).toBe('Contact support');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(UnexpectedError);
  });

  it('should log unexpected errors to debug file automatically', async () => {
    const error = new UnexpectedError(
      'Unexpected error occurred',
      'Contact support'
    );

    await error.logToDebugFile();

    expect(existsSync(debugLog)).toBe(true);

    const fs = await import('node:fs');
    const logContent = await fs.promises.readFile(debugLog, 'utf8');
    const logEntry = JSON.parse(logContent.trim());

    expect(logEntry.name).toBe('UnexpectedError');
    expect(logEntry.message).toBe('Unexpected error occurred');
    expect(logEntry.code).toBe(5);
    expect(logEntry.remediation).toBe('Contact support');
  });
});
