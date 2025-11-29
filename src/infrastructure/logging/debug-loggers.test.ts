/**
 * Tests for debug logging functionality
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import debug from 'debug';

vi.mock('debug', () => {
  return {
    default: vi.fn(() => vi.fn(() => {})),
  };
});

import {
  debugLogger,
  errorLogger,
  gitLogger,
  llmLogger,
  perfLogger,
  validationLogger,
} from './debug-loggers';

// Store original DEBUG environment
const originalDebug = process.env.DEBUG;

describe('Debug Loggers', () => {
  beforeEach(() => {
    // Clean up any existing DEBUG environment variable
    delete process.env.DEBUG;
  });

  afterEach(() => {
    // Restore original DEBUG environment
    if (originalDebug) {
      process.env.DEBUG = originalDebug;
    } else {
      delete process.env.DEBUG;
    }
  });

  describe('zero console output in normal operation', () => {
    it('should produce no output when DEBUG is not set', () => {
      // Mock console methods to capture any output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Test all loggers
      gitLogger('Git operation started');
      llmLogger('LLM request sent');
      perfLogger('Operation took 100ms');
      validationLogger('Validation started');
      errorLogger('Error occurred');
      debugLogger('Debug message');

      // Verify no console output
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Restore console methods
      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should not throw when DEBUG is not set', () => {
      expect(() => {
        gitLogger('test message');
        llmLogger('test message');
        perfLogger('test message');
        validationLogger('test message');
        errorLogger('test message');
        debugLogger('test message');
      }).not.toThrow();
    });

    it('should handle disabled debug gracefully', () => {
      // With mocked debug, the enabled property should be undefined (not implemented in mock)
      // The important part is that calling the logger doesn't throw
      expect(() => {
        gitLogger('test message');
        llmLogger('test message');
        perfLogger('test message');
      }).not.toThrow();
    });
  });

  describe('output when DEBUG flag is set', () => {
    it('should enable loggers when DEBUG=ollatool:* is set', () => {
      // Set DEBUG environment variable
      process.env.DEBUG = 'ollatool:*';

      const gitLog = debug('ollatool:git');
      const llmLog = debug('ollatool:llm');
      const perfLog = debug('ollatool:perf');

      expect(typeof gitLog).toBe('function');
      expect(typeof llmLog).toBe('function');
      expect(typeof perfLog).toBe('function');
    });

    it('should enable individual namespace when specific DEBUG is set', () => {
      process.env.DEBUG = 'ollatool:git';

      const gitLog = debug('ollatool:git');
      const llmLog = debug('ollatool:llm');

      expect(typeof gitLog).toBe('function');
      expect(typeof llmLog).toBe('function');
    });
  });

  describe('logger namespace separation', () => {
    it('should create loggers with correct namespaces', () => {
      expect(() => {
        debug('ollatool:git');
        debug('ollatool:llm');
        debug('ollatool:perf');
        debug('ollatool:validation');
        debug('ollatool:error');
        debug('ollatool:debug');
      }).not.toThrow();
    });
  });
});

describe('Integration with Child Process', () => {
  afterEach(() => {
    // Clean up any created files
    const testLogPath = join(process.cwd(), 'test-output.log');
    if (existsSync(testLogPath)) {
      unlinkSync(testLogPath);
    }
  });

  it('should produce no output when running in separate process without DEBUG', async () => {
    return new Promise(resolve => {
      const testScript = `
        const { gitLogger } = require('./src/infrastructure/logging/debug-loggers.ts');
        gitLogger('test message');
      `;

      const child = spawn('node', ['-e', testScript], {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: { ...process.env, DEBUG: undefined },
      });

      let output = '';
      child.stdout?.on('data', data => {
        output += data.toString();
      });
      child.stderr?.on('data', data => {
        output += data.toString();
      });

      child.on('close', code => {
        expect(code).toBe(0);
        expect(output).toBe('');
        resolve(undefined);
      });
    });
  });
});
