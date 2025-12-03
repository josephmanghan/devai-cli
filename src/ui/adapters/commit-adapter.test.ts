import ora from 'ora';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CommitAdapter } from './commit-adapter.js';

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
  })),
}));

describe('CommitAdapter - Spinner Methods', () => {
  let adapter: CommitAdapter;

  beforeEach(() => {
    adapter = new CommitAdapter();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('startThinking', () => {
    it('should create and start a spinner with provided message', () => {
      adapter.startThinking('Generating commit message...');

      expect(ora).toHaveBeenCalledWith('Generating commit message...');
      expect(ora).toHaveBeenCalledTimes(1);

      const mockSpinner = (ora as ReturnType<typeof vi.fn>).mock.results[0]
        .value;
      expect(mockSpinner.start).toHaveBeenCalledTimes(1);
    });

    it('should stop previous spinner before starting new one', () => {
      const firstSpinner = ora('First message');
      const secondSpinner = ora('Second message');

      (ora as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(firstSpinner)
        .mockReturnValueOnce(secondSpinner);

      adapter.startThinking('First message');
      adapter.startThinking('Second message');

      expect(firstSpinner.stop).toHaveBeenCalledTimes(1);
      expect(secondSpinner.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopThinking', () => {
    it('should stop active spinner', () => {
      adapter.startThinking('Processing...');
      const spinner = (ora as ReturnType<typeof vi.fn>).mock.results[0].value;

      adapter.stopThinking();

      expect(spinner.stop).toHaveBeenCalledTimes(1);
    });

    it('should handle stopThinking when no spinner is active', () => {
      expect(() => adapter.stopThinking()).not.toThrow();
    });

    it('should allow starting new spinner after stopping', () => {
      adapter.startThinking('First');
      adapter.stopThinking();
      adapter.startThinking('Second');

      expect(ora).toHaveBeenCalledTimes(2);
    });
  });
});
