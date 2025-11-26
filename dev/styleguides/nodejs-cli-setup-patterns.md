# Node.js CLI Setup Patterns

## Package Configuration Pattern
```json
{
  "name": "ollacli",
  "type": "module",
  "engines": { "node": ">=18.0.0" },
  "bin": { "ollacli": "./dist/index.js" }
}
```

## TypeScript Configuration Pattern
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

## CLI Framework Selection Pattern
**Recommended**: Commander.js
```bash
npm install commander @clack/prompts
```
- Commander: Argument parsing
- @clack/prompts: Interactive UX (modern replacement for inquirer)

## Project Structure Pattern
```
src/
├── cli/
│   ├── commands/
│   │   └── *.command.ts
│   └── ui/
├── core/
│   ├── entities/
│   ├── services/
│   └── interfaces/
├── infrastructure/
│   └── adapters/
└── utils/
```

## Essential Dependencies Pattern
```bash
# Runtime
npm install commander @clack/prompts execa ollama zod cosmiconfig chalk

# Development
npm install -D typescript tsup vitest @types/node eslint prettier
```

## Build Configuration Pattern (tsup.config.ts)
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  minify: true,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

## Testing Configuration Pattern (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
```

## Entry Point Pattern (bin/ollacli.js)
```javascript
#!/usr/bin/env node
require('../dist/index.js');
```

## Git Integration Pattern (execa)
```typescript
import { execa } from 'execa';

// Get staged diff
const { stdout } = await execa('git', ['diff', '--cached']);

// Commit with message
await execa('git', ['commit', '-m', message]);
```

## Error Handling Pattern
```typescript
class AppError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AppError';
  }
}
```

## Development Workflow Pattern
```bash
npm run build    # Compile TypeScript
npm run dev      # Build + npm link
npm test         # Run tests
npm run lint     # ESLint
```

## Configuration Loading Pattern (cosmiconfig + zod)
```typescript
import cosmiconfig from 'cosmiconfig';
import { z } from 'zod';

const ConfigSchema = z.object({
  model: z.string().default('llama3.2:1b'),
  timeout: z.number().min(1000).default(30000),
});

const explorer = cosmiconfig('ollacli');
const result = await explorer.search();
const config = ConfigSchema.parse(result?.config);
```

## Development Installation Pattern
```bash
# For local development
npm link

# Test globally
ollacli --help
```