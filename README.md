# devai-cli

AI-powered git commit message generator that runs 100% locally with Ollama.

## Features

- **Privacy-First**: 100% local processing - your code never leaves your machine
- **Lightning Fast**: Sub-1s response time with adequate VRAM
- **Frictionless Setup**: Quick one-time setup with `devai-cli setup`
- **Conventional Commits**: Generates commit messages following the standard format
- **Smart Validation**: Built-in format validation with automatic retries

## Quick Start

### 1. Install

```bash
npm install devai-cli
```

### 2. Install & Start Ollama

```bash
# Install Ollama
# Visit https://ollama.com/download

# Start Ollama daemon
ollama serve
```

### 3. Setup devai-cli

```bash
devai-cli setup
```

### 4. Generate Commit Messages

```bash
# Stage your changes
git add <files>

# Generate and commit
devai-cli commit
```

## How It Works

1. **Select Type**: Choose from conventional commit types (feat, fix, docs, etc.)
2. **Analyze Changes**: Reads staged git diff and file status
3. **Generate Message**: Uses local AI to create a commit message
4. **Review & Approve**: Edit or approve the generated message
5. **Commit**: Executes git commit with the final message

## Options

- `-a, --all`: Automatically stage all changes before generating commit message

## Requirements

- **Node.js**: v20+ (LTS and Current)
- **Ollama**: Latest version with `qwen2.5-coder:1.5b` model (auto-provisioned)
- **VRAM**: ~2GB required for the AI model

> **Note**: I'm working to improve Git diff processing performance to enable support for smaller models in the future for reduced VRAM usage.

## Example Output

```bash
$ devai-cli commit
? Select commit type:
  feat : A new feature
❯ fix : A bug fix
  docs : Documentation only changes
  style : Changes that do not affect the meaning of the code
  ...

feat: add user authentication system

? What would you like to do?
  Approve
❯ Edit
  Regenerate
  Cancel
```

## Privacy

✅ **100% Local Processing** - No data ever leaves your machine
✅ **No API Keys** - Works with local Ollama instance only
✅ **No Telemetry** - No usage tracking or analytics

---

**devai-cli** - Intelligent git commit messages, completely private and blazing fast.
