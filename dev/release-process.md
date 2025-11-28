# Release Process

## Overview

This project uses a **Release Prep Branch** approach to separate development artifacts from published releases. This preserves all valuable development context while ensuring clean, production-ready releases.

## Release Process

### 1. Development Workflow

- Work normally in `develop`/feature branches
- All artifacts remain in repo: `dev/`, docs, architecture files, etc.
- No artificial separation during active development
- All dependencies (dev + prod) included in root `package.json`

### 2. Release Preparation

When ready to create a release:

```bash
# Create release prep branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Remove development-only artifacts
rm -rf dev/
rm -rf docs/
rm -rf *.md README.md  # Keep root README.md
rm -rf .claude/
rm -rf .github/

# Update package.json if needed
# (Typically no changes needed if using standard dev dependencies)

# Test the clean build
npm ci
npm test
npm run build
```

### 3. Release

```bash
# Merge to main and tag
git checkout main
git merge --no-ff release/v1.0.0
git tag v1.0.0

# Push to trigger deployment
git push origin main
git push origin v1.0.0

# Clean up release prep branch
git branch -d release/v1.0.0
```

## Key Principles

### 1. **No Dev Dependencies in Release Prep**

- Design codebase to use only production dependencies
- Keep dev dependencies strictly for tooling (TypeScript, testing, linting)
- Release builds should work with `npm ci --production`

### 2. **Preserve Development Artifacts**

- All BMAD artifacts stay in development workflow
- Architecture decisions, research, and specs are never lost
- Git history preserves everything but release commits are clean

### 3. **Clean Releases**

- Published versions contain only what's needed to run the tool
- No development artifacts in npm package or binary
- Consumers get minimal, focused distribution

## What Gets Removed in Release Prep

```
/dev/           - BMAD artifacts, specs, documentation
/docs/          - Additional documentation files
*.md            - Markdown docs (except root README.md)
.claude/        - Claude Code configuration
.github/        - Development workflows, templates
```

## What Gets Published

```
/src/           - Compiled implementation
package.json    - Production-ready package configuration
README.md       - User-facing documentation
LICENSE         - License file
/dist/          - Built CLI binary (if applicable)
```

## Version Strategy

- **Major releases:** Breaking changes in CLI interface or core behavior
- **Minor releases:** New features, new commit types, improved AI models
- **Patch releases:** Bug fixes, performance improvements, error handling

## Future Automation Opportunities

While currently manual, this process can be automated with:

- **GitHub Actions:** Automated release prep workflow
- **npm scripts:** `npm run release:prep` to remove artifacts
- **Semantic release:** Automated version bumping based on commit messages

## Benefits

1. **No Context Switching** - Development happens naturally in one place
2. **Preserves All Work** - Architecture files, research, and specs never lost
3. **Clean Deployments** - Published packages contain only production code
4. **Standard Workflows** - Works with conventional CI/CD practices
5. **Flexibility** - Easy to add new development artifacts without restructuring
