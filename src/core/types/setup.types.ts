/**
 * Result of base model provisioning.
 */
export interface BaseModelResult {
  existed: boolean;
  pulled?: boolean;
}

/**
 * Result of custom model provisioning.
 */
export interface CustomModelResult {
  existed: boolean;
  created?: boolean;
}
