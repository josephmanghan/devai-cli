/**
 * Progress update interface for async streaming operations.
 * Used by headless adapters to communicate progress without UI dependencies.
 */
export interface ProgressUpdate {
  /**
   * Status message describing the current operation.
   */
  status: string;

  /**
   * Current progress count (optional).
   */
  current?: number;

  /**
   * Total count for progress calculation (optional).
   */
  total?: number;
}
