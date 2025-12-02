# Project Overview: devai-cli

## Project Summary

**devai-cli** is a privacy-first, AI-powered command-line tool for generating conventional commit messages using local Ollama instances.

---

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Project Name** | devai-cli |
| **Version** | 0.3.0 |
| **Project Type** | CLI Tool |
| **Repository Type** | Monolith |
| **Primary Language** | TypeScript |
| **Runtime** | Node.js >= 20.0.0 |
| **Architecture** | Clean Architecture (Hexagonal / Ports & Adapters) |
| **License** | MIT |
| **Author** | Dr Joe (Joseph Manghan) |

---

## Purpose

Generate high-quality conventional commit messages using AI, completely locally with zero telemetry or data exfiltration.

**Core Value Proposition:**
- ✅ **Privacy-First:** 100% local processing, no cloud APIs
- ✅ **Lightning Fast:** Sub-1 second response with adequate VRAM
- ✅ **Frictionless:** One-time setup, instant usage
- ✅ **Standards-Compliant:** Conventional Commits format
- ✅ **Smart Validation:** Format validation with automatic retries

---

## Technology Stack

### Core Technologies

- **TypeScript 5.9.3** - Type-safe development
- **Node.js >= 20.0.0** - Modern JavaScript runtime (ESM)
- **Commander 14.0.2** - CLI framework
- **Ollama 0.6.3** - Local LLM integration

### Development Tools

- **tsup** - Fast bundler (esbuild)
- **Vitest** - Test framework (80% coverage)
- **ESLint + Prettier** - Code quality
- **tsx** - Dev runtime

### UI/UX

- **@clack/prompts** - Interactive terminal prompts
- **ora** - Progress spinners

---

## Architecture Overview

### Clean Architecture Layers

```
Entry Point (index.ts)
         ↓
    main.ts (Composition Root)
         ↓
┌────────┴────────┬─────────────┐
│                 │             │
UI Layer    Features Layer   Core Layer
     ↓              ↓             ↓
Infrastructure Layer ← (implements) ← Ports
```

**Direction:** Dependencies flow inward
- Infrastructure implements core ports
- Features use core ports
- Core has zero dependencies

---

## Features

### 1. Commit Command

**Usage:** `devai-cli commit [-a]`

**What it does:**
1. Validates git repository and staged changes
2. Checks Ollama availability
3. Prompts user to select commit type (feat, fix, docs, etc.)
4. Reads staged git diff
5. Generates conventional commit message using AI
6. Allows user to approve, edit, regenerate, or cancel
7. Creates git commit

**Options:**
- `-a, --all` - Auto-stage all changes before generating

### 2. Setup Command

**Usage:** `devai-cli setup`

**What it does:**
1. Validates Ollama daemon is running
2. Ensures base model exists (qwen2.5-coder:1.5b)
3. Creates custom model with conventional commit system prompt
4. One-time setup, rarely needs re-running

---

## Directory Structure

```
devai-cli/
├── src/
│   ├── core/           # Domain layer (ports, types, errors)
│   ├── features/       # Application layer (commit, setup)
│   ├── infrastructure/ # Adapters (Ollama, Git, Editor)
│   ├── ui/             # Terminal interface
│   ├── index.ts        # Entry point
│   └── main.ts         # Composition root
├── tests/
│   ├── integration/    # Ollama integration tests
│   ├── e2e/            # Full workflow tests
│   └── helpers/        # Test utilities
├── scripts/            # Development scripts
├── dev/                # Generated documentation
└── dist/               # Build output
```

---

## Getting Started

### Installation

```bash
npm install devai-cli
```

### Prerequisites

1. **Node.js >= 20.0.0**
2. **Ollama installed and running**
   ```bash
   # Install from https://ollama.com/download
   ollama serve
   ```

### First-Time Setup

```bash
devai-cli setup
```

This will:
- Validate Ollama connection
- Pull base model (~2GB download)
- Create custom conventional commit model

### Usage

```bash
# Stage changes
git add <files>

# Generate and commit
devai-cli commit

# Or auto-stage and commit
devai-cli commit -a
```

---

## Development

### Install Dependencies

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

Output: `dist/index.js` (executable ESM bundle)

### Test

```bash
npm run test              # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests (requires Ollama)
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Generate coverage report
```

### Lint & Format

```bash
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues
npm run format            # Format with Prettier
npm run format:check      # Check formatting
```

### Type Checking

```bash
npm run typecheck         # TypeScript type checking
```

### Full PR Check

```bash
npm run pr                # format + lint + typecheck + test + build
npm run pr:lite           # Faster version (unit tests only)
```

---

## System Requirements

| Requirement | Specification |
|-------------|---------------|
| **Node.js** | >= 20.0.0 (LTS recommended) |
| **Ollama** | Latest version |
| **Model** | qwen2.5-coder:1.5b (~900MB) |
| **VRAM** | ~2GB for model inference |
| **Git** | Any recent version |
| **OS** | macOS, Linux, Windows (WSL recommended) |

---

## Testing Strategy

### Coverage Requirements

**Target:** 80% for lines, functions, branches, statements

### Test Distribution

- **21 unit tests** - Co-located with source (`*.test.ts`)
- **2 integration tests** - Real Ollama integration
- **2 e2e tests** - Full commit workflow
- **Test helpers** - Mock LLM, Git harness, performance tracker

---

## Links

- **Repository:** https://github.com/josephmanghan/devai-cli
- **npm Package:** https://www.npmjs.com/package/devai-cli
- **Ollama:** https://ollama.com
- **Conventional Commits:** https://conventionalcommits.org

---

## License

MIT License - See LICENSE file for details

---

**Document Version:** 1.0
**Generated:** 2025-12-02
**Project Version:** 0.3.0
