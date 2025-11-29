/**
 * Performance Tracker
 *
 * Measures CLI execution time and resource usage.
 * Records operation timings with metadata support.
 */

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance tracker implementation
 */
export class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private operations: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  startOperation(operation: string): void {
    this.operations.set(operation, performance.now());
  }

  /**
   * End timing an operation and record the metric
   */
  endOperation(operation: string, metadata?: Record<string, unknown>): void {
    const startTime = this.getStartTime(operation);
    const duration = performance.now() - startTime;
    const metric = this.createMetric(operation, duration, metadata);
    this.metrics.push(metric);
    this.operations.delete(operation);
  }

  private getStartTime(operation: string): number {
    const startTime = this.operations.get(operation);
    if (startTime === undefined) {
      throw new Error(
        `Operation '${operation}' was not started. Call startOperation() first.`
      );
    }
    return startTime;
  }

  private createMetric(
    operation: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): PerformanceMetric {
    return {
      operation,
      duration,
      timestamp: Date.now(),
      metadata,
    };
  }

  /**
   * Execute a function and time it automatically
   */
  async timeOperation<T>(
    operation: string,
    fn: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.startOperation(operation);

    try {
      const result = await fn();
      this.endOperation(operation, metadata);
      return result;
    } catch (error) {
      // Still record the timing even if operation failed
      this.endOperation(operation, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsByOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.operation === operation);
  }

  /**
   * Get the latest metric for a specific operation
   */
  getLatestMetric(operation: string): PerformanceMetric | undefined {
    const operationMetrics = this.getMetricsByOperation(operation);
    return operationMetrics[operationMetrics.length - 1];
  }

  /**
   * Get total duration for all metrics
   */
  getTotalDuration(): number {
    return this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
  }

  /**
   * Get average duration for all metrics
   */
  getAverageDuration(): number {
    if (this.metrics.length === 0) {
      return 0;
    }
    return this.getTotalDuration() / this.metrics.length;
  }

  /**
   * Get average duration for a specific operation
   */
  getAverageDurationByOperation(operation: string): number {
    const operationMetrics = this.getMetricsByOperation(operation);
    if (operationMetrics.length === 0) {
      return 0;
    }
    return (
      operationMetrics.reduce((sum, metric) => sum + metric.duration, 0) /
      operationMetrics.length
    );
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(
      {
        summary: {
          totalMetrics: this.metrics.length,
          totalDuration: this.getTotalDuration(),
          averageDuration: this.getAverageDuration(),
        },
        metrics: this.metrics,
      },
      null,
      2
    );
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
    this.operations.clear();
  }

  /**
   * Get count of active (unended) operations
   */
  getActiveOperationsCount(): number {
    return this.operations.size;
  }

  /**
   * Get list of active operations
   */
  getActiveOperations(): string[] {
    return Array.from(this.operations.keys());
  }
}
