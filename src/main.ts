/**
 * Ollama CLI Tool - Local-first git commit message generation
 *
 * This is the main application bootstrap file.
 * Entry point is src/index.ts (barrel file).
 */

/**
 * Main application entry point
 * Contains CLI initialization logic
 */
export function main(): void {
  // Placeholder implementation - will be replaced with Commander.js in Story 1.4
  console.log('🚀 ollatool - Local-first AI commit messages');

  // Show help by default
  console.log(`
Usage: ollatool <command>

Commands:
  commit    Generate AI-powered commit messages (coming soon)

Options:
  --help     Show this help message
  --version  Show version number

For more information, visit: https://github.com/your-repo/ollatool
`);
}

// Only execute if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
