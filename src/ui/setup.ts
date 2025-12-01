/**
 * Setup command UI utilities.
 * Provides consistent formatting and messaging for setup command output.
 */

import { CONVENTIONAL_COMMIT_MODEL_CONFIG } from '../infrastructure/config/conventional-commit-model.config.js';

export class SetupUI {
  static setupStart(): void {
    console.log('🔧 Configuring Ollama integration...\n');
  }

  static setupSuccess(): void {
    console.log('\n✅ Setup complete!');
    console.log('\nModels configured:');
    console.log(
      `  • Base model: ${CONVENTIONAL_COMMIT_MODEL_CONFIG.baseModel}`
    );
    console.log(`  • Custom model: ${CONVENTIONAL_COMMIT_MODEL_CONFIG.model}`);
    console.log('\n🚀 Ready to generate commits:');
    console.log('  ollatool commit');
  }
}
