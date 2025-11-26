# Deep Research Prompt: Node.js CLI Project Setup Style Guide

## Context

I'm building a **Git Commit Message Generator CLI** (`ollacli commit`) that:

- Uses Ollama with `llama3.2:1b` for local SLM inference
- Analyzes staged git changes and generates Conventional Commit messages
- Built with Node.js (I'm a beginner with Node.js, experienced with Angular/frontend)
- Must be professional, maintainable, and MVP-scoped
- Target: M1/M2 Mac, developer workflow tool

**Full project brief:** https://github.com/user/ollama-cli-application/blob/main/dev/brief.md (if accessible, or use context below)

**Key requirements:**

- Professional project structure for a CLI tool
- Easy to test, build, and distribute
- Modular architecture (separate concerns: CLI layer, git integration, Ollama integration, formatting)
- TypeScript preferred if it doesn't add significant complexity

## Research Objective

**Produce a concise, actionable style guide** for setting up this Node.js CLI project following industry best practices.

This style guide will be used during:

1. Architecture design phase
2. PRD creation
3. First implementation story (project setup)
4. Ongoing development

## Required Output Format

**Style guide must be:**

- ✅ **High signal, low noise** (token-efficient, no verbose explanations)
- ✅ **Prescriptive** ("Use X, not Y" with brief rationale)
- ✅ **Project-specific** (tailored to CLI + Ollama + git integration context)
- ✅ **Actionable** (can be directly applied during implementation)
- ✅ **Concise** (aim for ~1000-1500 words max, not a 10-page document)

**Format structure:**

```
# Node.js CLI Setup Style Guide

## Recommended Stack
[Specific recommendations: TS vs JS, CLI framework, etc.]

## Project Structure
[Folder structure with brief rationale]

## Key Dependencies
[Essential libraries with 1-line purpose]

## Testing Strategy
[Approach for CLI testing]

## Build & Distribution
[How to package and distribute]

## Configuration Management
[How to handle user config]

## Quick Start Checklist
[Step-by-step setup for Story #1]
```

## Specific Questions to Answer

1. **Language choice:** TypeScript vs plain JavaScript for this use case?
2. **CLI framework:** Commander.js vs yargs vs oclif vs others (for simple single-command tool that may expand)?
3. **Project structure:** Best folder organization for modularity (src/commands, src/services, src/utils, etc.)?
4. **Testing:** Jest? Vitest? How to test CLI tools effectively?
5. **Build process:** Do we need a build step? Transpilation? Bundling?
6. **Distribution:** npm package? Standalone binary? What's simplest for MVP?
7. **Configuration:** How to manage user preferences (dotfiles, config files, etc.)?
8. **Error handling:** Best practices for CLI error handling and user-friendly messages?
9. **Dependencies:** What are the essential libraries (e.g., prompts/inquirer for user interaction, chalk for colors, etc.)?

## Success Criteria

The style guide should enable a beginner Node.js developer to:

- Set up a professional CLI project structure in <1 hour
- Understand which tools/frameworks to use and why (briefly)
- Have clear patterns for testing and distribution
- Avoid common beginner mistakes

## Output Constraints

- **Maximum length:** ~1500 words
- **No fluff:** Skip generic explanations, focus on specific recommendations
- **Token-efficient:** This will be loaded into LLM context during development
- **Markdown format:** Headings, code blocks, lists (easy to scan)

---

**Run this as Gemini Deep Research. Output will be saved as `/dev/style-guides/nodejs-cli-setup.md`**
