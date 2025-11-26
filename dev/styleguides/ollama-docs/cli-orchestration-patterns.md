# CLI Orchestration Patterns

## Git Workflow Integration

```typescript
// Get staged changes for commit generation
async function getStagedChanges(): Promise<string> {
  const { execSync } = require('child_process')

  try {
    const stagedChanges = execSync('git diff --cached', { encoding: 'utf8' })
    const gitStatus = execSync('git status --short', { encoding: 'utf8' })

    return {
      diff: stagedChanges,
      status: gitStatus,
      hasStagedChanges: stagedChanges.trim().length > 0
    }
  } catch (error) {
    throw new Error('No staged changes found')
  }
}

// Execute commit with generated message
async function executeCommit(message: string): Promise<void> {
  const { execSync } = require('child_process')
  execSync(`git commit -m "${message}"`, { encoding: 'utf8' })
}
```

## Interactive User Input

```typescript
import readline from 'readline'

interface CLIOptions {
  model?: string
  auto?: boolean
  dryRun?: boolean
}

// Interactive prompt for user confirmation
async function getUserConfirmation(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const answer = await new Promise<string>((resolve) => {
    rl.question(`${prompt} (y/N): `, resolve)
  })

  rl.close()
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
}

// Parse command line arguments
function parseCLIArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {}

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--model':
        options.model = args[++i]
        break
      case '--auto':
        options.auto = true
        break
      case '--dry-run':
        options.dryRun = true
        break
    }
  }

  return options
}
```

## Error Handling in CLI Context

```typescript
// CLI-specific error handling
class CLIError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'CLIError'
  }
}

// Handle CLI operations with proper error messages
async function handleCLIOperation(operation: () => Promise<any>): Promise<void> {
  try {
    await operation()
  } catch (error) {
    if (error instanceof CLIError) {
      console.error(`Error: ${error.message}`)
      if (error.code) {
        console.error(`Code: ${error.code}`)
      }
    } else {
      console.error('Unexpected error occurred')
    }
    process.exit(1)
  }
}

// Validate git repository
async function validateGitRepo(): Promise<void> {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' })
  } catch {
    throw new CLIError('Not a git repository', 'NOT_GIT_REPO')
  }
}
```