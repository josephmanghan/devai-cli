# 🏗️ Master Plan: Epic 2 Refactor (Hexagonal Architecture & UI Ports)

**Objective:**
Refactor the Setup and Ollama Management flow to strictly adhere to Hexagonal Architecture. Decouple the Feature layer from Infrastructure details and UI implementation. Implement "Headless" Adapters using Async Generators for progress emission.

**Constraints:**

- **Strict Hexagonal Architecture:** Features must depend _only_ on Core Interfaces (`LlmPort`, `SetupUiPort`).
- **Headless Adapter:** `OllamaAdapter` must **NOT** import `ora` or `console`. It must yield progress data via Async Generators.
- **UI as a Port:** All visual output must be handled by a dedicated Renderer implementing a Core Interface.
- **Composition Root:** Dependency injection must happen in `main.ts` using the existing configuration files.
- **Zero Pollution:** Do not create test-specific ("Silent") classes in the production `src/` folder. Use stubs within test files.

### 1\. Target Source Tree (Exact State)

_The agent must verify the final file structure matches this layout exactly._

```text
src
├── core
│   ├── ports
│   │   ├── index.ts                # Barrel file
│   │   ├── llm-port.ts             # [UPDATED] Methods return AsyncGenerator<ProgressUpdate>
│   │   └── setup-ui-port.ts        # [NEW] Interface for UI Renderer
│   └── types
│       ├── errors.types.ts         # [EXISTING]
│       ├── index.ts                # Barrel file
│       ├── llm-types.ts            # [EXISTING]
│       └── ui.types.ts             # [NEW] ProgressUpdate interface
├── features
│   └── setup
│       ├── setup-command.ts        # [REFACTORED] Pure orchestration. No 'ora', no factories.
│       └── setup-command.test.ts   # [UPDATED] Uses generator mocks.
├── infrastructure
│   ├── adapters
│   │   └── index.ts                # Barrel file
│   ├── config
│   │   └── conventional-commit-model.config.ts  # [CRITICAL] Config injected in main.ts
│   ├── llm
│   │   ├── ollama-adapter.ts       # [REFACTORED] Headless. Yields events. No 'console'.
│   │   └── ollama-adapter.test.ts  # [UPDATED] Consumes generators.
│   └── logging
│       ├── debug-loggers.ts        # [EXISTING]
│       └── index.ts                # Barrel file
├── ui                              # [NEW LAYER]
│   ├── setup
│   │   └── console-setup-renderer.ts # [NEW] The ONLY place 'ora' exists.
│   └── index.ts                    # [NEW] Barrel file
├── index.ts                        # [EXISTING] CLI Entry point
└── main.ts                         # [UPDATED] Composition Root.
```

---

### 2\. Implementation Steps

#### **Phase 1: Interfaces & Types (The Contract)**

1.  **Create `src/core/types/ui.types.ts`:**
    - Define `ProgressUpdate` interface:
      ```typescript
      export interface ProgressUpdate {
        status: string;
        current?: number;
        total?: number;
      }
      ```
    - Export via `src/core/types/index.ts`.
2.  **Create `src/core/ports/setup-ui-port.ts`:**
    - Define `SetupUiPort` interface with semantic methods:
      - `showIntro(): void`
      - `showOutro(config: OllamaModelConfig): void`
      - `onCheckStarted(step: 'daemon' | 'base-model' | 'custom-model', details?: string): void`
      - `onCheckSuccess(step: 'daemon' | 'base-model' | 'custom-model', message?: string): void`
      - `onCheckFailure(step: 'daemon' | 'base-model' | 'custom-model', error: Error): void`
      - `onProgress(progress: ProgressUpdate): void`
    - Export via `src/core/ports/index.ts`.
3.  **Update `src/core/ports/llm-port.ts`:**
    - Update `pullModel` return type to `AsyncGenerator<ProgressUpdate>`.
    - Update `createModel` return type to `AsyncGenerator<ProgressUpdate>`.

#### **Phase 2: Purify Infrastructure (The Headless Adapter)**

1.  **Refactor `src/infrastructure/llm/ollama-adapter.ts`:**
    - **REMOVE** `ora` import and all `console.log` calls.
    - **Refactor `pullModel`:**
      - Call `this.ollamaClient.pull({ ..., stream: true })`.
      - Use `for await` to iterate the stream.
      - Yield `ProgressUpdate` objects mapped from the SDK response.
    - **Refactor `createModel`:**
      - Call `this.ollamaClient.create({ ..., stream: true })`.
      - Use `for await` to iterate and yield status updates.

#### **Phase 3: Establish UI Layer (The Renderer)**

1.  **Create `src/ui/setup/console-setup-renderer.ts`:**
    - Implement the `SetupUiPort` interface.
    - Import `ora`.
    - **Move Logic:** Transfer all spinner management, emoji rendering, and console output logic from the old `SetupCommand` into these methods.
    - **Progress Handling:** Ensure `onProgress` updates the _active_ spinner text/suffix.
2.  **Create `src/ui/index.ts`:** Export the renderer.

#### **Phase 4: Refactor Feature (The Orchestration)**

1.  **Refactor `src/features/setup/setup-command.ts`:**
    - **REMOVE** `createOllamaAdapter` factory function.
    - **Constructor:** Accept `LlmPort` and `SetupUiPort` via dependency injection.
    - **Execute:**
      - Replace direct UI logic with calls to `this.ui.onCheckStarted(...)`.
      - **Stream Consumption:**
        ```typescript
        // Example pipe pattern
        const stream = this.llm.pullModel(this.config.baseModel);
        for await (const progress of stream) {
          this.ui.onProgress(progress);
        }
        ```

#### **Phase 5: Composition Root (Wiring)**

1.  **Refactor `src/main.ts`:**
    - Import `CONVENTIONAL_COMMIT_MODEL_CONFIG` from `infrastructure/config/...`.
    - Import `OllamaAdapter` and `ConsoleSetupRenderer`.
    - Instantiate `adapter = new OllamaAdapter(...)`.
    - Instantiate `ui = new ConsoleSetupRenderer()`.
    - Instantiate `command = new SetupCommand(CONVENTIONAL_COMMIT_MODEL_CONFIG, adapter, ui)`.
    - Remove any usage of the deleted factory function.

---

### 3\. Testing Strategy Update

#### **Unit Tests (Feature Layer)**

**File:** `src/features/setup/setup-command.test.ts`

- **Critical Mocking Requirement:** You must use `async function*` to mock the stream.

<!-- end list -->

```typescript
// ✅ CORRECT MOCK PATTERN
const mockPullModel = vi.fn().mockImplementation(async function* () {
  yield { status: 'downloading', current: 10, total: 100 };
  yield { status: 'downloading', current: 100, total: 100 };
});

// Setup
const mockUi = { onProgress: vi.fn(), onCheckStarted: vi.fn(), ... }; // Mock the Port
const mockLlm = { pullModel: mockPullModel, ... }; // Mock the Port
const command = new SetupCommand(config, mockLlm, mockUi);

// Assertions
await command.execute();
expect(mockUi.onProgress).toHaveBeenCalledTimes(2); // Verified stream consumption
```

#### **Integration Tests**

**File:** `integration/setup-auto-pull.test.ts`

- **Constraint:** Do NOT import `ConsoleSetupRenderer`. It will spam the CI logs.
- **Action:** Define a `StubUi` class _inside_ the test file.

<!-- end list -->

```typescript
// Define locally
class StubUi implements SetupUiPort {
  showIntro() {}
  onCheckStarted() {}
  onProgress() {}
  // ... implement all methods as empty no-ops
}

const command = new SetupCommand(config, realAdapter, new StubUi());
```

---

### 4\. Final Validation

Run the following command to verify the refactor is complete and compliant:

```bash
npm run pr
```

**Requirement:** This must pass Formatting (Prettier), Linting (ESLint), and Testing (Vitest) with **0 errors**.
