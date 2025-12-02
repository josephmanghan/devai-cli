# **Architecting Reliability: A Comprehensive ESLint Strategy for Node.js Command-Line Interfaces**

## **Executive Summary**

The development of Command-Line Interfaces (CLIs) in the Node.js ecosystem has undergone a radical transformation in the last half-decade. The convergence of TypeScript for static type safety, Vite/Vitest for rapid testing cycles, and sophisticated argument parsers like Commander has elevated the humble CLI script into the realm of complex, mission-critical software engineering. In this context, static analysis via ESLint is no longer a peripheral utility for enforcing indentation; it is a structural pillar of application stability, supply chain security, and developer velocity.

This report presents an exhaustive analysis of the optimal ESLint configuration for a modern Node.js CLI stack in 2025\. It moves beyond the superficial application of "recommended" presets to explore the deep interaction between the linter, the TypeScript compiler, and the Node.js runtime. We prioritize pragmatism—defined here as the maximization of bug detection with the minimization of developer friction. Over-engineering, characterized by rigid stylistic enforcement that yields no runtime safety, is explicitly rejected in favor of rules that prevent race conditions, memory leaks, and unhandled promise rejections.

The following analysis leverages the ESLint "Flat Config" system, the new standard for configuration, to architect a linting strategy that is modular, type-aware, and performance-optimized. We dissect high-value rules across four primary dimensions: TypeScript correctness, Node.js runtime constraints, Asynchronous control flow, and Test suite integrity.

---

## **1\. The Paradigm Shift: Flat Configuration in the Modern Stack**

The transition to ESLint's Flat Configuration (eslint.config.js) represents the most significant architectural shift in the tool's history. For years, the cascading complexity of .eslintrc, .eslintrc.json, and .eslintrc.js files created a dependency resolution nightmare, particularly in monorepos or projects using ESM (ECMAScript Modules). In 2025, the Flat Config is not merely an option; it is the prerequisite for a robust, predictable linting environment.1

### **1.1 The Architecture of Flat Config**

Unlike the legacy format, which relied on implicit merging of configuration objects and opaque plugin resolution, Flat Config treats configuration as a standard JavaScript array of objects. This change is profound for TypeScript projects. It allows developers to import plugins directly as JavaScript modules, eliminating the fragility of string-based package names (e.g., "plugin:prettier/recommended") that often failed when packages were hoisted incorrectly by package managers like pnpm or yarn.2

For a Node.js CLI, specifically one using type: "module" in package.json, the Flat Config allows the linter to operate natively within the ESM lifecycle. This means the configuration file itself can use import statements to pull in rules from typescript-eslint, eslint-plugin-n, and eslint-plugin-vitest. This native integration ensures that the linter's view of the dependency graph matches the runtime's view, reducing the class of bugs where the linter passes but the application fails to start due to module resolution errors.

| Feature                 | Legacy Config (.eslintrc)   | Flat Config (eslint.config.js)   | Impact on Node.js CLI                                 |
| :---------------------- | :-------------------------- | :------------------------------- | :---------------------------------------------------- |
| **Module Loading**      | Custom resolver system      | Native Node.js import/require    | Eliminates "plugin not found" errors in ESM projects. |
| **Scope definition**    | Cascading directories       | Explicit files and ignores globs | Precise control over bin/ vs lib/ vs test/.           |
| **Plugin Dependencies** | Peer dependencies (hoisted) | Direct imports (explicit)        | Simplifies dependency management in CI/CD pipelines.  |
| **Type Safety**         | None (JSON/JS object)       | Typed via JSDoc or TS            | Enables IDE autocompletion for rule configuration.    |

### **1.2 Monorepo-Style Linting within a CLI**

Even a "simple" CLI application usually consists of three distinct zones, each requiring a different linting strategy:

1. **The Source (src/)**: strict type checking, no console logging (except via loggers), strict architectural boundaries.
2. **The Entry Point (bin.ts)**: permissive execution constraints, allowance of \#\! headers, allowance of process termination.
3. **The Test Suite (tests/ or \*.test.ts)**: usage of testing globals, relaxed type assertions for mocking, specific Vitest rules.

Flat Config enables this "zoning" within a single file. By defining separate configuration objects with distinct files properties (e.g., files: \["src/\*\*/\*.ts"\] vs files: \["\*\*/\*.test.ts"\]), we can apply expensive type-aware rules only where they provide value, and disable noisy rules where they impede productivity. This is a massive performance optimization; applying type-checked rules to test files, which often contain deliberately loose typing for mocks, can double the linting time without providing commensurate safety.3

### **1.3 The Prerequisite: typescript-eslint Infrastructure**

To leverage the full power of Flat Config with TypeScript, the project must utilize the typescript-eslint tooling. This involves the parser (@typescript-eslint/parser) and the plugin (@typescript-eslint/eslint-plugin). In the modern stack, these are configured via the tseslint.config() helper function, which provides type safety for the configuration itself.

The critical "must-have" setting here is parserOptions.projectService: true (or the older project: true). This instructs ESLint to use the closest tsconfig.json to generate the type information required for semantic linting. Without this, the linter is merely checking syntax; with it, the linter understands the data flow.1

---

## **2\. TypeScript Integration: Balancing Strictness and Pragmatism**

In a Node.js CLI context, TypeScript serves as the primary line of defense against runtime crashes. However, the default TypeScript configuration is often permissive. ESLint fills the gap by enforcing strictness that the compiler might allow for backward compatibility. The goal is "pragmatic strictness"—rules that prevent bugs, not rules that enforce academic purity.1

### **2.1 The Case for recommended-type-checked**

There is a perennial debate between using the recommended vs. strict configurations. For a production-grade CLI, the research indicates that plugin:@typescript-eslint/recommended-type-checked is the highest-value baseline.

The "Type-Checked" variant is distinct because it utilizes the TypeScript compiler's understanding of the code. Standard rules can see that a variable is named args, but Type-Checked rules know that args is an array of strings derived from process.argv. This context is vital for a CLI where inputs are external and untrusted.

**Key Insight:** While strict-type-checked offers the maximum theoretical safety, it often flags patterns that are idiomatic in Node.js scripts (like loose null checks). The pragmatic approach is to start with recommended-type-checked and selectively enable specific "strict" rules that target high-risk areas like promises and generic casting.1

### **2.2 Managing the any Type in Command Handlers**

The rule @typescript-eslint/no-explicit-any is often the first rule developers disable. In a Commander-based CLI, this is a mistake. Commander, by default, passes options as a loosely typed object. Using any to handle these options defeats the purpose of TypeScript.

**High-Value Rule:** @typescript-eslint/no-explicit-any (Severity: Error)

- **Pragmatic Exception:** Use unknown.
- **Context:** When defining a command action in Commander:  
  TypeScript  
  // BAD: using any disables all checks  
  program.action((options: any) \=\> {  
   console.log(options.force \+ 1); // No error, but might result in NaN  
  });

  // GOOD: using unknown forces validation  
  program.action((options: unknown) \=\> {  
   if (isOptions(options)) {  
   // Safe to use  
   }  
  });

- **Insight:** This rule drives the architecture of the CLI towards schema validation (e.g., using zod to validate CLI flags at the runtime boundary). It turns a potential runtime crash ("undefined is not a function") into a compile-time error.7

### **2.3 Strict Boolean Expressions and Argument Parsing**

**High-Value Rule:** @typescript-eslint/strict-boolean-expressions

- **The CLI Problem:** CLI flags often have "falsy" values that are valid. An optional number flag \--retries 0 parses to 0\.
  - Code: if (options.retries) {... }
  - Result: If retries is 0, the block is skipped. The user intended 0 retries, but the code behaves as if the flag wasn't set.
- **The Fix:** This rule forces the developer to write if (options.retries\!== undefined).
- **Configuration:**  
  JavaScript  
  '@typescript-eslint/strict-boolean-expressions':

- **Why it's must-have:** It eliminates an entire category of "silent failure" bugs where user configuration is ignored due to JavaScript's type coercion rules.6

### **2.4 Performance-Conscious Imports**

**High-Value Rule:** @typescript-eslint/consistent-type-imports

- **Mechanism:** This rule enforces import type {... } for imports that are only used for type annotations.
- **Node.js Implication:** CLI startup time is a critical metric (the "Time to Hello World"). If a CLI imports a massive library just for a type definition, and that import remains in the runtime code, Node.js has to parse that library on every execution. By enforcing import type, the TypeScript compiler elides (removes) the import entirely from the JavaScript output.
- **Pragmatism:** Use the fixStyle: "inline-type-imports" option. This allows mixing values and types (import { Command, type Option } from 'commander'), preventing the file header from doubling in size.9

---

## **3\. Runtime Safety: The eslint-plugin-n Ecosystem**

While TypeScript handles the logic, eslint-plugin-n (formerly eslint-plugin-node) handles the environment. Node.js has specific behaviors, globals, and limitations that general JS linters miss. For a CLI, checking against the supported Node.js version is critical to avoid syntax errors on user machines.11

### **3.1 The process.exit() Controversy**

**Rule:** n/no-process-exit

- **The Theory:** Calling process.exit() terminates the Node.js event loop immediately. Pending writes to stdout (like the final success message) might be truncated because the stream buffers haven't flushed.
- **The CLI Reality:** A CLI _must_ be able to exit with a non-zero code when an error occurs.
- **Pragmatic Strategy:**
  1. Enable the rule globally to prevent deep library functions from killing the app.
  2. Disable the rule _only_ in src/bin.ts or src/commands/\*.ts.
  3. **Advanced Insight:** For complex CLIs, prefer setting process.exitCode \= 1 and letting the code bubble up to the main() function, which then exits. This allows destructors and finally blocks to run.13

### **3.2 Supply Chain Security: Imports**

**Rule:** n/no-extraneous-import and n/no-missing-import

- **The Problem:** In a monorepo or complex project, it is easy to import a file that exists on your local machine but is not listed in dependencies. For example, importing vitest in the production code.
- **The Consequence:** The CLI works on the developer's machine but crashes instantly for the user because vitest is in devDependencies, which are not installed in a production environment.
- **Why it's must-have:** This is a top source of broken releases. This rule verifies that every import is resolvable via package.json.11

### **3.3 The Modern Node Protocol**

**Rule:** n/prefer-node-protocol

- **Mechanism:** Enforces import fs from 'node:fs' over import fs from 'fs'.
- **Value:**
  1. **Clarity:** It makes it obvious which imports are built-ins.
  2. **Safety:** It prevents "dependency confusion" attacks where a malicious package named fs in node_modules shadows the built-in module.
  3. **Performance:** It saves Node.js a small amount of module resolution work.11

### **3.4 Executable Integrity**

**Rule:** n/hashbang

- **Context:** A CLI entry point (bin.ts) must have \#\!/usr/bin/env node at the top.
- **The Check:** This rule checks the bin field in package.json, finds the corresponding file, and verifies the hashbang exists.
- **Pragmatism:** This prevents the confusing "Syntax Error" users get if they try to run a script that the shell attempts to execute as Bash instead of Node.11

---

## **4\. Asynchronous Control Flow and Promise Safety**

Node.js is asynchronous. CLIs, however, often appear synchronous (step 1: read file, step 2: process, step 3: write). This impedance mismatch is the source of the most dangerous bugs: unhandled rejections and race conditions.16

### **4.1 The "Floating Promise" Hazard**

**Critical Rule:** @typescript-eslint/no-floating-promises

- **Scenario:** You call an async function writeConfig() but forget await.  
  TypeScript  
  // BAD  
  program.action(() \=\> {  
   writeConfig(); // Promise created but ignored  
   console.log("Done"); // "Done" prints, process exits, write is killed.  
  });

- **Impact:** The process exits before the asynchronous operation completes. The file is never written. The user thinks it succeeded.
- **Pragmatism:** Configure with { ignoreVoid: true }. This allows the developer to explicitly opt-out for "fire-and-forget" logic (like analytics logging) by writing void logAnalytics(), signaling intent.17

### **4.2 Misused Promises in Loops**

**Critical Rule:** @typescript-eslint/no-misused-promises

- **Scenario:** Passing an async function to Array.forEach.  
  TypeScript  
  // BAD  
  files.forEach(async (file) \=\> {  
   await upload(file);  
  });

- **Impact:** forEach does not await the callback. The code will fire off all uploads simultaneously (potentially hitting API rate limits) and then immediately continue execution before any upload finishes.
- **The Fix:** The linter flags this, guiding the developer to use Promise.all(files.map(...)) or a for...of loop.16

### **4.3 Stack Traces and return await**

**High-Value Rule:** @typescript-eslint/return-await (Set to always)

- **The Myth:** "Return await is redundant."
- **The Reality:** If you return a promise without awaiting it inside a try/catch block, the catch block **will not catch the error**. The promise returns, the function pops off the stack, and the error rejects later, unhandled.
- **Debuggability:** Even outside try/catch, return await keeps the current function in the stack trace. For a CLI tool where users send you screenshots of crash logs, these stack frames are essential for debugging. The performance cost in modern V8 is negligible.20

---

## **5\. Framework-Specific Nuances: Commander and Interaction**

The choice of commander as the framework introduces specific patterns that the linter must accommodate.

### **5.1 Shadowing and Command scopes**

**Rule:** @typescript-eslint/no-shadow

- **Context:** In deep command hierarchies, it's common to have an options variable at the global level and another options variable inside a specific command action.
- **Pragmatism:** While shadowing is generally bad, blocking it strictly can make Commander code verbose (forcing names like globalOptions and cmdOptions).
- **Recommendation:** Enable the rule but use allow options for common generic names if the team finds it too restrictive, or strictly enforce it to prevent the bug where a command accidentally reads the global configuration instead of its own flags.21

### **5.2 Parameter Properties**

**Rule:** @typescript-eslint/parameter-properties

- **Context:** Commander often encourages class-based command definitions. TypeScript allows defining properties in the constructor: constructor(private readonly service: Service) {}.
- **Value:** This reduces boilerplate. Some strict configs ban this. For a pragmatist, this feature should be allowed as it reduces the line count of command classes significantly.22

---

## **6\. Testing Integrity: The Vitest Rule Set**

Tests are the safety net for refactoring. If the tests are flawed, the safety net is an illusion. The eslint-plugin-vitest rules are essential for ensuring that tests actually test what they claim to.23

### **6.1 preventing "Zombie" Tests**

**Critical Rule:** vitest/expect-expect

- **The Problem:** A test that calls a function but asserts nothing.  
  TypeScript  
  it('should process user', () \=\> {  
   processUser(); // If this doesn't throw, test passes. But did it work?  
  });

- **The Fix:** This rule requires every test case to contain at least one expect() call.
- **Nuance:** If you use custom assertion helpers (e.g., assertUserIsValid()), you must configure the assertFunctionNames option so the linter knows these wrapper functions contain assertions.23

### **6.2 Test Isolation and Titles**

**Rule:** vitest/no-identical-title

- **Impact:** When a test suite fails, the reporter prints the test title. If five tests are named "should work", debugging is impossible. This rule enforces unique names.

**Rule:** vitest/no-disabled-tests (Set to warn)

- **Pragmatism:** Developers use .skip or .only during debugging. It is very easy to commit these accidentally, disabling the CI suite. Setting this to warn (or error in CI) prevents technical debt accumulation.24

### **6.3 Type Testing**

**Rule:** vitest/prefer-expect-type-of

- **Context:** Vitest allows testing types: expectTypeOf(result).toEqualTypeOf\<string\>().
- **Value:** For a TypeScript CLI, testing that your utility functions return the correct _types_ (not just values) is powerful. This rule encourages utilizing Vitest's built-in type checkers over ad-hoc solutions.23

---

## **7\. Dependency Management and Import Hygiene**

In large CLI projects, imports can become chaotic. Two philosophies exist: granular enforcement (eslint-plugin-import) and automated simplicity (eslint-plugin-simple-import-sort).

### **7.1 The Case for Simple Import Sort**

**Recommendation:** eslint-plugin-simple-import-sort

- **The Problem:** "Bikeshedding" in code reviews. "This import should go above that one."
- **The Solution:** This plugin enforces a strict, deterministic sort order (Packages \-\> Absolute Imports \-\> Relative Imports).
- **Why Must-Have:** It is auto-fixable. The developer runs eslint \--fix, and the imports are sorted. This eliminates merge conflicts caused by two developers adding imports to the same file in different orders. It requires zero configuration, unlike eslint-plugin-import which requires complex regex groups.25

### **7.2 Dependency Boundaries**

**Rule:** import/no-extraneous-dependencies (or n/no-extraneous-import)

- **Refinement:** We covered this in the Node section, but it bears repeating. This rule must be configured to allow devDependencies in test files but ban them in src files.
- **Flat Config Implementation:**  
  JavaScript  
  {  
   files: \["src/\*\*/\*.ts"\],  
   rules: { "n/no-extraneous-import": "error" } // Strict  
  },  
  {  
   files: \["tests/\*\*/\*.ts"\],  
   rules: { "n/no-extraneous-import": "off" } // Permissive  
  }

  This zoning is crucial for pragmatism.27

---

## **8\. The Pragmatic Stylistic Boundary: Prettier vs. ESLint**

A comprehensive report must address the boundary between "linting" (code quality) and "formatting" (visual style). In 2025, the industry standard is to strictly separate these concerns.

### **8.1 The "No Formatting in ESLint" Rule**

ESLint should **not** enforce:

- Semicolons
- Trailing commas
- Indentation
- Line length

Reasoning: These rules are computationally expensive for ESLint to check and fix. Prettier is an AST-based printer that handles this instantly.  
Configuration: Use eslint-config-prettier to explicitly disable all ESLint rules that conflict with Prettier. This prevents the "fighting linters" scenario where ESLint and Prettier disagree, causing the editor to flash back and forth.29

### **8.2 Naming Conventions**

**Rule:** @typescript-eslint/naming-convention

- **Value:** Enforcing camelCase for variables and PascalCase for classes helps readability.
- **Pragmatism:** Do not enforce Hungarian notation (e.g., bIsDone).
- **Commander Specific:** Commander flags usually map to camelCase properties. Enforcing this ensures that the CLI code matches the runtime object keys generated by Commander.31

---

## **9\. Implementation: The Ultimate eslint.config.js**

Based on the research and analysis above, here is the complete, annotated, production-ready configuration. This setup assumes a project structure with src/ (app), tests/ (Vitest), and tsconfig.json at the root.

JavaScript

// eslint.config.js  
import eslint from '@eslint/js';  
import tseslint from 'typescript-eslint';  
import nodePlugin from 'eslint-plugin-n';  
import vitest from '@vitest/eslint-plugin';  
import simpleImportSort from 'eslint-plugin-simple-import-sort';  
import globals from 'globals';

/\*\*  
 \* 2025 High-Value ESLint Configuration for Node.js/TS CLI  
 \*  
 \* Focus:  
 \* 1\. Type Safety (typescript-eslint)  
 \* 2\. Async Safety (Promise handling)  
 \* 3\. Node.js Runtime Correctness (eslint-plugin-n)  
 \* 4\. Test Integrity (eslint-plugin-vitest)  
 \*/  
export default tseslint.config(  
 // \========================================================================  
 // 1\. Global Ignores  
 // \========================================================================  
 // Stop ESLint from scanning build artifacts.  
 {  
 ignores: \['dist/', 'coverage/', 'node_modules/', '\*.js'\],  
 },

// \========================================================================  
 // 2\. Base Configuration & Parser Setup  
 // \========================================================================  
 eslint.configs.recommended,  
 ...tseslint.configs.recommendedTypeChecked,  
 ...tseslint.configs.stylisticTypeChecked,  
 {  
 languageOptions: {  
 parserOptions: {  
 // ESSENTIAL: Links ESLint to the TS Compiler for type-aware rules  
 projectService: true,  
 tsconfigRootDir: import.meta.dirname,  
 },  
 globals: {  
 ...globals.node, // Inject Node.js globals (process, Buffer, etc.)  
 },  
 ecmaVersion: 2024, // Enable modern syntax (top-level await)  
 },  
 },

// \========================================================================  
 // 3\. Core TypeScript Rules (The Safety Net)  
 // \========================================================================  
 {  
 rules: {  
 // PRAGMATISM: Allow unused vars if prefixed with underscore.  
 // Useful for implementing interfaces or Commander callbacks with unused args.  
 '@typescript-eslint/no-unused-vars': \[  
 'error',  
 { argsIgnorePattern: '^\_', varsIgnorePattern: '^\_', caughtErrorsIgnorePattern: '^\_' },  
 \],

      // ASYNC SAFETY: Prevent "fire and forget" bugs.
      // Forces explicit \`void\` if you truly want to ignore a promise.
      '@typescript-eslint/no-floating-promises': \['error', { ignoreVoid: true }\],

      // ASYNC SAFETY: Prevent passing async functions to callbacks that don't await.
      '@typescript-eslint/no-misused-promises':,

      // DEBUGGABILITY: Keep stack traces intact.
      '@typescript-eslint/return-await': \['error', 'always'\],

      // TYPE SAFETY: Prevent usage of \`any\` which bypasses protection.
      // Use \`unknown\` for Commander inputs instead.
      '@typescript-eslint/no-explicit-any': 'error',

      // BOOLEAN SAFETY: Prevent \`if (count)\` bugs where count is 0\.
      '@typescript-eslint/strict-boolean-expressions':,

      // PERFORMANCE: Elide types from runtime bundles.
      '@typescript-eslint/consistent-type-imports':,

      // STYLE: Standardize Interface naming (optional but recommended)
      '@typescript-eslint/naming-convention': \[
        'warn',
        { selector: 'default', format: \['camelCase'\] },
        { selector: 'typeLike', format: \['PascalCase'\] },
        // Allow snake\_case for external APIs or database columns
        { selector: 'property', format: null },
      \],
    },

},

// \========================================================================  
 // 4\. Node.js Specific Rules (Runtime Integrity)  
 // \========================================================================  
 {  
 files: \['\*\*/\*.ts'\],  
 plugins: {  
 n: nodePlugin,  
 },  
 rules: {  
 ...nodePlugin.configs\['recommended-module'\].rules,

      // SECURITY: explicit node: protocol
      'n/prefer-node-protocol': 'error',

      // EXECUTABLE: Verify bin file has \#\!
      'n/hashbang': 'error',

      // DEPENDENCIES: Ensure imports exist.
      // Note: We might relax no-missing-import if using TS-paths,
      // as TS compiler checks this better.
      'n/no-missing-import': 'off',

      // SAFETY: Ban process.exit() generally (see override below).
      'n/no-process-exit': 'error',
    },

},

// \========================================================================  
 // 5\. Entry Point Override (The "Controller" Layer)  
 // \========================================================================  
 {  
 // These files are allowed to control the process lifecycle  
 files: \['src/bin.ts', 'src/commands/\*\*/\*.ts'\],  
 rules: {  
 'n/no-process-exit': 'off',  
 'no-console': 'off', // CLI output requires console  
 },  
 },

// \========================================================================  
 // 6\. Test Suite Configuration (Vitest)  
 // \========================================================================  
 {  
 files: \['\*\*/\*.test.ts', '\*\*/\*.spec.ts'\],  
 plugins: {  
 vitest,  
 },  
 rules: {  
 ...vitest.configs.recommended.rules,

      // QUALITY: Tests must verify something.
      'vitest/expect-expect': 'error',

      // HYGIENE: Clean up skipped tests.
      'vitest/no-disabled-tests': 'warn',

      // PRAGMATISM: Testing code often breaks strict TS rules (mocking).
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // NODE: Allow devDependencies in tests
      'n/no-extraneous-import': 'off',
    },

},

// \========================================================================  
 // 7\. Import Sorting (Mechanical consistency)  
 // \========================================================================  
 {  
 plugins: {  
 'simple-import-sort': simpleImportSort,  
 },  
 rules: {  
 'simple-import-sort/imports': 'error',  
 'simple-import-sort/exports': 'error',  
 },  
 }  
);

---

## **10\. Conclusion**

The landscape of Node.js CLI development in 2025 demands a shift from passive linting to active architectural enforcement. By adopting the rules detailed in this report, teams can eliminate entire classes of bugs—specifically unhandled promises and type coercion errors—before code ever reaches the repository.

The recommended configuration prioritizes **pragmatism over purity**. It allows console.log where it belongs (in commands), allows any where it is safe (in tests), and enforces strict asynchronous hygiene everywhere else. This balance ensures that the linter acts as a force multiplier for the developer, providing the confidence to refactor and ship rapidly in a complex TypeScript environment. The combination of typescript-eslint for logic, eslint-plugin-n for runtime constraints, and eslint-plugin-vitest for verification creates a comprehensive safety net suitable for enterprise-grade command-line applications.

#### **Works cited**

1. Getting Started \- typescript-eslint, accessed November 29, 2025, [https://typescript-eslint.io/getting-started/](https://typescript-eslint.io/getting-started/)
2. Latest way on updating an ESLint config file (2024) \- Stack Overflow, accessed November 29, 2025, [https://stackoverflow.com/questions/78974317/latest-way-on-updating-an-eslint-config-file-2024](https://stackoverflow.com/questions/78974317/latest-way-on-updating-an-eslint-config-file-2024)
3. Modern Linting in 2025: ESLint Flat Config with TypeScript and JavaScript, accessed November 29, 2025, [https://advancedfrontends.com/eslint-flat-config-typescript-javascript/](https://advancedfrontends.com/eslint-flat-config-typescript-javascript/)
4. Configure ESLint (eslint.config.js) to only analyze TypeScript files (\*.ts) \- Stack Overflow, accessed November 29, 2025, [https://stackoverflow.com/questions/78827606/configure-eslint-eslint-config-js-to-only-analyze-typescript-files-ts](https://stackoverflow.com/questions/78827606/configure-eslint-eslint-config-js-to-only-analyze-typescript-files-ts)
5. what is the best linting config for typescript? \- Reddit, accessed November 29, 2025, [https://www.reddit.com/r/typescript/comments/1aoq5gb/what_is_the_best_linting_config_for_typescript/](https://www.reddit.com/r/typescript/comments/1aoq5gb/what_is_the_best_linting_config_for_typescript/)
6. Shared Configs \- typescript-eslint, accessed November 29, 2025, [https://typescript-eslint.io/users/configs/](https://typescript-eslint.io/users/configs/)
7. ESLint config : r/typescript \- Reddit, accessed November 29, 2025, [https://www.reddit.com/r/typescript/comments/1eva0go/eslint_config/](https://www.reddit.com/r/typescript/comments/1eva0go/eslint_config/)
8. Disable typescript-eslint plugin rule (no-explicit-any) with inline comment \- Stack Overflow, accessed November 29, 2025, [https://stackoverflow.com/questions/59147324/disable-typescript-eslint-plugin-rule-no-explicit-any-with-inline-comment](https://stackoverflow.com/questions/59147324/disable-typescript-eslint-plugin-rule-no-explicit-any-with-inline-comment)
9. Make consistent-type-imports 'error' for the recommended config · Issue \#9036 \- GitHub, accessed November 29, 2025, [https://github.com/typescript-eslint/typescript-eslint/issues/9036](https://github.com/typescript-eslint/typescript-eslint/issues/9036)
10. Consistent Type Imports and Exports: Why and How | typescript-eslint, accessed November 29, 2025, [https://typescript-eslint.io/blog/consistent-type-imports-and-exports-why-and-how/](https://typescript-eslint.io/blog/consistent-type-imports-and-exports-why-and-how/)
11. eslint-plugin-n \- NPM, accessed November 29, 2025, [https://www.npmjs.com/package/eslint-plugin-n](https://www.npmjs.com/package/eslint-plugin-n)
12. eslint-community/eslint-plugin-n: Additional ESLint rules for ... \- GitHub, accessed November 29, 2025, [https://github.com/eslint-community/eslint-plugin-n](https://github.com/eslint-community/eslint-plugin-n)
13. sindresorhus/eslint-plugin-unicorn: More than 100 powerful ESLint rules \- GitHub, accessed November 29, 2025, [https://github.com/sindresorhus/eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn)
14. " 78:6 error Don't use process.exit(); throw an error instead no-process-exit" \#795 \- GitHub, accessed November 29, 2025, [https://github.com/eslint/eslint/issues/795](https://github.com/eslint/eslint/issues/795)
15. How to properly cleanup Node.js abnormal exit/termination process \- Stack Overflow, accessed November 29, 2025, [https://stackoverflow.com/questions/62905602/how-to-properly-cleanup-node-js-abnormal-exit-termination-process](https://stackoverflow.com/questions/62905602/how-to-properly-cleanup-node-js-abnormal-exit-termination-process)
16. No Floating Promises: an eslint rule to prevent async code errors \- Mike Bifulco, accessed November 29, 2025, [https://mikebifulco.com/posts/eslint-no-floating-promises](https://mikebifulco.com/posts/eslint-no-floating-promises)
17. What is the best way to deal with "@typescript-eslint/no-floating-promises" while using async/await inside useEffect? \[closed\] \- Stack Overflow, accessed November 29, 2025, [https://stackoverflow.com/questions/77592895/what-is-the-best-way-to-deal-with-typescript-eslint-no-floating-promises-whil](https://stackoverflow.com/questions/77592895/what-is-the-best-way-to-deal-with-typescript-eslint-no-floating-promises-whil)
18. node:test APIs returning Promises clashes with no-floating-promises lint rule \#51292, accessed November 29, 2025, [https://github.com/nodejs/node/issues/51292](https://github.com/nodejs/node/issues/51292)
19. No floating promises check in TypeScript \- Stack Overflow, accessed November 29, 2025, [https://stackoverflow.com/questions/62463653/no-floating-promises-check-in-typescript](https://stackoverflow.com/questions/62463653/no-floating-promises-check-in-typescript)
20. return-await \- typescript-eslint, accessed November 29, 2025, [https://typescript-eslint.io/rules/return-await/](https://typescript-eslint.io/rules/return-await/)
21. Improving Code Quality in React with ESLint, Prettier, and TypeScript | by Saurabh Lende, accessed November 29, 2025, [https://medium.com/globant/improving-code-quality-in-react-with-eslint-prettier-and-typescript-86635033d803](https://medium.com/globant/improving-code-quality-in-react-with-eslint-prettier-and-typescript-86635033d803)
22. eslint-config-isaacscript, accessed November 29, 2025, [https://isaacscript.github.io/eslint-config-isaacscript/](https://isaacscript.github.io/eslint-config-isaacscript/)
23. eslint plugin for vitest \- GitHub, accessed November 29, 2025, [https://github.com/vitest-dev/eslint-plugin-vitest](https://github.com/vitest-dev/eslint-plugin-vitest)
24. Enabling \`eslint-plugin-vitest\` recommended rules · Issue \#9067 \- GitHub, accessed November 29, 2025, [https://github.com/containers/podman-desktop/issues/9067](https://github.com/containers/podman-desktop/issues/9067)
25. lydell/eslint-plugin-simple-import-sort \- GitHub, accessed November 29, 2025, [https://github.com/lydell/eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)
26. Automatic import sorting with ESLint \- DEV Community, accessed November 29, 2025, [https://dev.to/receter/automatic-import-sorting-in-vscode-275m](https://dev.to/receter/automatic-import-sorting-in-vscode-275m)
27. Building the Best Next.js TypeScript Standard Vitest ESLint Configuration \- Medium, accessed November 29, 2025, [https://medium.com/@santi020k/building-the-best-next-js-typescript-standard-vitest-eslint-configuration-f6d91d6346e7](https://medium.com/@santi020k/building-the-best-next-js-typescript-standard-vitest-eslint-configuration-f6d91d6346e7)
28. Resolving ESLint 'require' vs 'import' errors in TypeScript tests without losing code coverage, accessed November 29, 2025, [https://stackoverflow.com/questions/79808615/resolving-eslint-require-vs-import-errors-in-typescript-tests-without-losing](https://stackoverflow.com/questions/79808615/resolving-eslint-require-vs-import-errors-in-typescript-tests-without-losing)
29. Setting Up ESLint and Prettier for a TypeScript Project | by Robin Viktorsson | Medium, accessed November 29, 2025, [https://medium.com/@robinviktorsson/setting-up-eslint-and-prettier-for-a-typescript-project-aa2434417b8f](https://medium.com/@robinviktorsson/setting-up-eslint-and-prettier-for-a-typescript-project-aa2434417b8f)
30. Prettier vs ESLint: Choosing the Right Tool for Code Quality \- Better Stack, accessed November 29, 2025, [https://betterstack.com/community/guides/scaling-nodejs/prettier-vs-eslint/](https://betterstack.com/community/guides/scaling-nodejs/prettier-vs-eslint/)
31. Linting and Formatting TypeScript in 2025 \- A Complete Guide \- Finn Nannestad, accessed November 29, 2025, [https://finnnannestad.com/blog/linting-and-formatting](https://finnnannestad.com/blog/linting-and-formatting)
