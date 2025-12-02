import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createProgram, main } from './main.js';

const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi
  .spyOn(console, 'error')
  .mockImplementation(() => {});

const originalArgv = process.argv;

describe('CLI Program', () => {
  let program: Command;

  beforeEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();

    process.argv = ['node', 'test'];

    program = createProgram();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('createProgram', () => {
    it('should return a configured Commander instance', () => {
      expect(program).toBeInstanceOf(Command);
      expect(program.name()).toBe('devai-cli');
    });

    it('should have correct program description', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain(
        'Local-first CLI tool for AI-powered git commit message generation using Ollama'
      );
    });

    it('should have version option configured', () => {
      const helpText = program.helpInformation();
      expect(helpText).toContain('--version');
      expect(helpText).toContain('Show version number');
    });

    it('should support command registration', () => {
      const testCommand = program
        .command('test-cmd')
        .description('Test command');

      expect(testCommand).toBeDefined();
      expect(
        program.commands.find(cmd => cmd.name() === 'test-cmd')
      ).toBeDefined();
    });
  });

  describe('help flag', () => {
    it('should display help when --help flag is used', () => {
      process.argv = ['node', 'test', '--help'];

      const mockHelp = vi.fn();
      program.configureOutput({
        writeOut: mockHelp,
        writeErr: () => {},
      });

      try {
        program.parse();
      } catch {
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
        writeOut: str => mockVersionLog(str.trim()),
        writeErr: () => {},
      });

      try {
        program.parse();
      } catch {
        // Commander exits when version is displayed
      }

      expect(mockVersionLog).toHaveBeenCalled();
    });
  });

  describe('main function', () => {
    it('should parse command line arguments', () => {
      const mockParse = vi.fn();

      vi.spyOn(Command.prototype, 'parse').mockImplementation(mockParse);

      process.argv = ['node', 'test'];
      main();

      expect(mockParse).toHaveBeenCalled();
    });
  });
});
