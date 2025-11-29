# Local Development Setup

## CLI Installation

After `npm run build`, make the `ollatool` command available:

```bash
npm link
```

### What `npm link` does

- Creates a symlink from `./dist/index.js` (your package's `bin` field) to your system's PATH
- Makes `ollatool` available system-wide during development
- Avoids needing `node dist/index.js` prefix for every command

### Verification

```bash
ollatool --help
ollatool --version
```

### Cleanup (when done)

```bash
npm unlink ollatool
```

**Note:** This is for local development only. For distribution, use `npm publish -g` for global installation.
