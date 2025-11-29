/**
 * Performance Tracker Smoke Tests
 *
 * Validates that PerformanceTracker records operation timing correctly.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { PerformanceTracker } from './performance-tracker';

describe('PerformanceTracker', () => {
  let tracker: PerformanceTracker;

  beforeEach(() => {
    tracker = new PerformanceTracker();
  });

  it('records operation timing correctly', async () => {
    // Start timing
    tracker.startOperation('test-operation');

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));

    // End timing
    tracker.endOperation('test-operation');

    // Verify metric was recorded
    const metrics = tracker.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].operation).toBe('test-operation');
    expect(metrics[0].duration).toBeGreaterThan(0);
    expect(metrics[0].timestamp).toBeGreaterThan(0);
  });

  it('times operations automatically with timeOperation method', async () => {
    const testFunction = async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return 'test result';
    };

    const result = await tracker.timeOperation('auto-operation', testFunction);

    expect(result).toBe('test result');

    const metrics = tracker.getMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].operation).toBe('auto-operation');
    expect(metrics[0].duration).toBeGreaterThan(4); // Should be at least 5ms
  });

  it('includes metadata in recorded metrics', async () => {
    tracker.startOperation('operation-with-metadata');
    tracker.endOperation('operation-with-metadata', {
      testValue: 42,
      testName: 'test',
    });

    const metric = tracker.getLatestMetric('operation-with-metadata');
    expect(metric).toBeDefined();
    expect(metric!.metadata).toEqual({ testValue: 42, testName: 'test' });
  });

  it('handles errors in timeOperation correctly', async () => {
    const errorFunction = async () => {
      await new Promise(resolve => setTimeout(resolve, 5));
      throw new Error('Test error');
    };

    await expect(
      tracker.timeOperation('failing-operation', errorFunction)
    ).rejects.toThrow('Test error');

    const metric = tracker.getLatestMetric('failing-operation');
    expect(metric).toBeDefined();
    expect(metric!.metadata?.error).toBe(true);
  });

  it('throws error when ending operation that was not started', () => {
    expect(() => tracker.endOperation('non-existent-operation')).toThrow(
      "Operation 'non-existent-operation' was not started. Call startOperation() first."
    );
  });

  it('filters metrics by operation correctly', async () => {
    // Record multiple operations
    tracker.startOperation('op1');
    tracker.endOperation('op1');

    tracker.startOperation('op2');
    tracker.endOperation('op2');

    tracker.startOperation('op1');
    tracker.endOperation('op1');

    const op1Metrics = tracker.getMetricsByOperation('op1');
    const op2Metrics = tracker.getMetricsByOperation('op2');

    expect(op1Metrics).toHaveLength(2);
    expect(op2Metrics).toHaveLength(1);

    expect(op1Metrics.every(m => m.operation === 'op1')).toBe(true);
    expect(op2Metrics.every(m => m.operation === 'op2')).toBe(true);
  });

  it('calculates average durations correctly', async () => {
    // Record operations with known durations
    await tracker.timeOperation('test-op-1', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'done';
    });

    await tracker.timeOperation('test-op-2', async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
      return 'done';
    });

    const totalAverage = tracker.getAverageDuration();
    const op1Average = tracker.getAverageDurationByOperation('test-op-1');
    const op2Average = tracker.getAverageDurationByOperation('test-op-2');

    expect(totalAverage).toBeGreaterThan(0);
    expect(op1Average).toBeGreaterThan(9); // At least 10ms
    expect(op2Average).toBeGreaterThan(19); // At least 20ms
    expect(op2Average).toBeGreaterThan(op1Average); // op2 should take longer
  });

  it('exports metrics as JSON correctly', () => {
    tracker.startOperation('export-test');
    tracker.endOperation('export-test', { exportData: true });

    const jsonExport = tracker.exportMetrics();
    const parsed = JSON.parse(jsonExport);

    expect(parsed.summary.totalMetrics).toBe(1);
    expect(parsed.summary.totalDuration).toBeGreaterThan(0);
    expect(parsed.summary.averageDuration).toBeGreaterThan(0);
    expect(parsed.metrics).toHaveLength(1);
    expect(parsed.metrics[0].operation).toBe('export-test');
    expect(parsed.metrics[0].metadata?.exportData).toBe(true);
  });

  it('tracks active operations correctly', () => {
    expect(tracker.getActiveOperationsCount()).toBe(0);
    expect(tracker.getActiveOperations()).toEqual([]);

    tracker.startOperation('active-op-1');
    tracker.startOperation('active-op-2');

    expect(tracker.getActiveOperationsCount()).toBe(2);
    expect(tracker.getActiveOperations()).toEqual(
      expect.arrayContaining(['active-op-1', 'active-op-2'])
    );

    tracker.endOperation('active-op-1');

    expect(tracker.getActiveOperationsCount()).toBe(1);
    expect(tracker.getActiveOperations()).toEqual(['active-op-2']);
  });

  it('clears metrics and operations correctly', () => {
    tracker.startOperation('test-op');
    tracker.endOperation('test-op');
    tracker.startOperation('still-active');

    expect(tracker.getMetrics()).toHaveLength(1);
    expect(tracker.getActiveOperationsCount()).toBe(1);

    tracker.clear();

    expect(tracker.getMetrics()).toHaveLength(0);
    expect(tracker.getActiveOperationsCount()).toBe(0);
  });

  it('handles empty metrics gracefully', () => {
    expect(tracker.getTotalDuration()).toBe(0);
    expect(tracker.getAverageDuration()).toBe(0);
    expect(tracker.getAverageDurationByOperation('non-existent')).toBe(0);
    expect(tracker.getLatestMetric('non-existent')).toBeUndefined();
    expect(tracker.getMetricsByOperation('non-existent')).toEqual([]);
    expect(tracker.getActiveOperations()).toEqual([]);
  });
});
