#!/usr/bin/env tsx

import { spawn } from 'child_process';

const demoFiles = [
  'src/ui/setup/console-setup-renderer.demo.ts',
  'src/ui/commit/components/message-preview/message-preview.demo.ts',
  'src/ui/commit/components/action-selector/action-selector.demo.ts',
  'src/ui/commit/components/type-selector/type-selector.demo.ts',
];

async function runDemo(demoFile: string): Promise<void> {
  console.log(`Running ${demoFile}...`);

  return new Promise((resolve, reject) => {
    const child = spawn('tsx', [demoFile], {
      stdio: 'inherit',
    });

    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Demo ${demoFile} failed with exit code ${code}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

async function main() {
  for (const demoFile of demoFiles) {
    try {
      await runDemo(demoFile);
      console.log(` ${demoFile} completed\n`);
    } catch (error) {
      console.error(`L ${demoFile} failed:`, error);
      process.exit(1);
    }
  }

  console.log('<� All demos completed successfully!');
}

main();
