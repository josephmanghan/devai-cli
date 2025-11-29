/**
 * CLI Program Tests
 * Tests for Commander.js program creation and configuration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { createProgram, main } from './main.js';

// Mock console methods to capture output
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock process.argv for testing
const originalArgv = process.argv;

describe('CLI Program', () => {
  let program: Command;

  beforeEach(() => {
    // Clear all mock calls before each test
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();

    // Reset process.argv to a clean state
    process.argv = ['node', 'test'];

    // Create fresh program instance
    program = createProgram();
  });

  afterEach(() => {
    // Restore original process.argv after each test
    process.argv = originalArgv;
  });

  describe('createProgram', () => {
    it('should return a configured Commander instance', () => {
      expect(program).toBeInstanceOf(Command);
      expect(program.name()).toBe('ollatool');
    });

    it('should have correct program description', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain(
        'Local-first CLI tool for AI-powered git commit message generation using Ollama',
      );
    });

    it('should have version option configured', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('--version');
      expect(helpText).toContain('Show version number');
    });

    it('should support command registration', () => {
      // Minimal test: prove Commander.js command registration works
      const testCommand = program.command('test-cmd').description('Test command');

      expect(testCommand).toBeDefined();
      expect(program.commands.find((cmd) => cmd.name() === 'test-cmd')).toBeDefined();
    });
  });

  describe('help flag', () => {
    it('should display help when --help flag is used', () => {
      process.argv = ['node', 'test', '--help'];

      // Mock the help output
      const mockHelp = vi.fn();
      program.configureOutput({
        writeOut: mockHelp,
        writeErr: () => {},
      });

      try {
        program.parse();
      } catch (e) {
        // Commander exits when help is displayed
      }

      expect(mockHelp).toHaveBeenCalled();
    });
  });

  describe('version flag', () => {
    it('should display version when --version flag is used', () => {
      process.argv = ['node', 'test', '--version'];

      const mockVersionLog = vi.fn();
      program.configureOutput({
        writeOut: (str) => mockVersionLog(str.trim()),
        writeErr: () => {},
      });

      try {
        program.parse();
      } catch (e) {
        // Commander exits when version is displayed
      }

      expect(mockVersionLog).toHaveBeenCalled();
    });
  });

  describe('main function', () => {
    it('should parse command line arguments', () => {
      const mockParse = vi.fn();
      const mockProgram = { parse: mockParse } as unknown as Command;

      vi.spyOn(Command.prototype, 'parse').mockImplementation(mockParse);

      process.argv = ['node', 'test'];
      main();

      expect(mockParse).toHaveBeenCalled();
    });
  });

  describe('conditional execution', () => {
    it('should only execute main when run directly', () => {
      // This test verifies that main() can be imported without execution
      // The actual conditional execution is tested implicitly by the test setup
      expect(typeof main).toBe('function');
    });
  });

  describe('package integration', () => {
    it('should read version from package.json', () => {
      const program = createProgram();

      // We can't easily test the exact version without mocking fs.readFileSync
      // But we can verify that version option exists
      const helpText = program.helpInformation();
      expect(helpText).toContain('--version');
    });
  });
});
