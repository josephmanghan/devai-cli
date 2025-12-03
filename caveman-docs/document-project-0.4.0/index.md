# project documentation index - devai-cli

## project overview

- type cli tool
- primary language typescript/node.js
- architecture clean architecture hexagonal
- repository type monolith parts

## quick reference

- tech stack typescript node.js commander.js ollama vitest
- entry point`src/index.ts`cli executable
- architecture pattern clean architecture dependency inversion
- ai model qwen2.5-coder1.5b via local ollama instance

## generated documentation

- project overview./project-overview.md - executive summary project status
- architecture./architecture.md - clean architecture implementation design patterns
- source tree analysis./source-tree-analysis.md - complete annotated directory structure
- development guide./development-guide.md - setup build development workflows
- component inventory./component-inventory.md _to generated_
- api contracts./api-contracts.md _to generated_
- data models./data-models.md _to generated_
- integration architecture./integration-architecture.md _to generated_

## existing documentation

- readme.md../readme.md - user-facing documentation features quick start
- changelog.md../changelog.md - version history release notes

## getting started

### users

1.  install`npm install devai-cli`2. setup`ollama serve && devai-cli setup`3. use`git add <files> && devai-cli commit`### developers

1.  clone repository github
1.  setup`npm install && npm run validate:setup`3. develop`npm run dev`development mode
1.  test`npm run test`comprehensive testing
1.  build`npm run build`production build

### development commands

- development`npm run dev`hot reload
- testing`npm run test`tests`npm run test:coverage`coverage
- code quality`npm run lint``npm run format`- build`npm run build`production`npm run pr`full validation

### key requirements

- node.js v20 required
- ollama local instance qwen2.5-coder1.5b model
- vram 2gb ai model loading
- privacy 100 local processing external apis

## architecture highlights

### clean architecture implementation

- core layer business logic port interfaces
- application layer use cases controllers
- infrastructure layer external system adapters git ollama editor
- ui layer cli components user interaction

### key components

- commit generation ai-powered conventional commit creation
- setup management ollama configuration model provisioning
- git integration shell-based git operations
- error handling comprehensive error recovery user guidance

### testing strategy

- unit tests 70 tests individual components
- integration tests system component interactions
- e2e tests complete user workflows
- coverage 80 minimum across modules
- mock adapters isolated testing predictable behavior

## project status

version 0.4.0 stable production-ready
license mit
maintainer dr joe joseph manghan
repository https//github.com/josephmanghan/devai-cli

## core commands

###`devai-cli setup`- configures ollama integration

- provisions custom ai model
- validates system requirements

###`devai-cli commit`- analyzes staged git changes

- generates conventional commit message
- provides review editing options

###`devai-cli commit --all`- automatically stages changes

- generates commit message
- creates commit

## ai model configuration

model`devai-cli-commit:latest`custom provisioned
base model`qwen2.5-coder:1.5b`temperature 0.2 consistent responses
context window 131072 tokens
processing local privacy-first

## integration points

### ollama integration

- protocol http rest api
- endpoint http//localhost11434
- model automatic provisioning management

### git integration

- protocol shell commands via execa
- operations status diff commit log
- repository current working directory

### editor integration

- protocol system default editor
- workflow temporary file creation cleanup

## development workflow

### feature development

1.  define ports`src/core/ports/`2. implement adapters`src/infrastructure/adapters/`3. create use cases`src/features/[feature]/use-cases/`4. add controllers`src/features/[feature]/controllers/`5. write comprehensive tests
2.  update documentation

### quality gates

- type safety typescript strict mode
- code quality eslint prettier validation
- test coverage 80 minimum requirement
- build success production build verification

## performance characteristics

### response times

- commit generation 2s typical repositories
- model loading 5s initial cached afterward
- ui interactions 100ms response times

### memory usage

- ai model 2gb vram qwen2.5-coder1.5b
- application 50mb node.js process
- git processing streaming large diffs

## security privacy

### privacy protection

- 100 local processing
- external api calls
- data transmission
- usage telemetry

### security measures

- input validation sanitization
- shell injection prevention
- file system access limitation
- error information filtering

documentation serves primary reference understanding developing extending devai-cli codebase. ai-assisted development start architecture./architecture.md development guide./development-guide.md comprehensive implementation details.
