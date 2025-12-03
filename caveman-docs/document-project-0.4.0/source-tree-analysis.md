# source tree analysis - devai-cli

## project overview

project devai-cli - ai-powered git commit message generator
architecture clean architecture ports adapters
type cli tool typescript/node.js
entry point src/index.ts src/main.ts

## directory structure

project-root/
src/ # main source code clean architecture
main.ts # application composition root cli setup
index.ts # executable entry point shebang
core/ # core business logic ports
index.ts # core exports
ports/ # interface definitions hexagon
index.ts # port exports
commit-ui-port.ts # ui interface commit operations
editor-port.ts # external editor interface
git-port.ts # git operations interface
llm-port.ts # llm/ai interface
setup-ui-port.ts # setup ui interface
types/ # type definitions domain models
index.ts # type exports
commit.types.ts # commit-related types
errors.types.ts # error handling types
git-types.ts # git operation types
llm-types.ts # llm interaction types
prompt.types.ts # prompt building types
setup.types.ts # setup configuration types
features/ # use cases organized domain
commit/ # commit generation functionality
controllers/ # feature controllers cli command handlers
commit-controller.ts # main commit command logic
commit-controller.test.ts
use-cases/ # business logic use cases
generate-commit.ts # generate commit message
validate-preconditions.ts # validate git state
tests # unit tests use cases
utils/ # commit-specific utilities
format-validator.ts # conventional commit validation
message-normalizer.ts # message formatting
prompt-builder.ts # ai prompt construction
type-enforcer.ts # commit type enforcement
setup/ # initial setup functionality
controllers/ # setup command handlers
setup-controller.ts
use-cases/ # setup business logic
ensure-base-model.ts # verify base model availability
provision-custom-model.ts # create custom model
validate-ollama-connection.ts # test ollama connectivity
infrastructure/ # external system adapters
adapters/ # implementation ports
editor/ # external editor integration
shell-editor-adapter.ts # shell command editor interface
git/ # git operations adapter
shell-git-adapter.ts # shell command git interface
ollama/ # ollama ai adapter
ollama-adapter.ts # ollama api client
config/ # configuration management
conventional-commit-model.config.ts # ai model configuration
logging/ # debug logging setup
debug-loggers.ts # debug logger configuration
ui/ # user interface adapters
adapters/ # ui implementation
commit-adapter.ts # cli commit ui implementation
commit/ # commit ui components
components/ # reusable ui components
action-selector/ # commit action selection ui
message-preview/ # message preview ui
type-selector/ # commit type selection ui
setup/ # setup ui components
console-setup-renderer.ts # console-based setup ui
tests/ # integration e2e tests
e2e/ # end-to-end test scenarios
commit-happy-path.test.ts # full workflow tests
commit-error-paths.test.ts # error handling tests
integration/ # integration tests
setup-auto-pull.test.ts # setup integration tests
helpers/ # test utilities mocks
git-harness.ts # git test environment setup
mock-commit-ui.ts # ui component mocks
mock-llm-provider.ts # llm service mocks
performance-tracker.ts # test performance monitoring
scripts/ # build utility scripts
dist/ # build output generated
project-docs/ # project documentation empty
dev/ # generated documentation analysis

## critical components analysis

### entry points

- src/index.ts - shebang-enabled executable entry point
- src/main.ts - composition root dependency injection setup

### core architecture layer

- ports src/core/ports/ define interfaces external dependencies
- types src/core/types/ domain models business logic types
- follows hexagonal architecture pattern clean separation

### feature organization

- commit feature complete commit generation workflow
- setup feature ollama configuration model provisioning
- feature follows controller use cases utils structure

### infrastructure layer

- git adapter shell-based git operations
- ollama adapter ai model communication
- editor adapter external editor integration
- configuration ai model settings parameters

### testing strategy

- unit tests alongside source files .test.ts
- integration tests real system integration
- e2e tests complete user workflows
- test helpers mocks utilities testing

### build quality tools

- build tsup typescript bundling
- testing vitest 80 coverage requirements
- linting eslint strict typescript rules
- formatting prettier import sorting

## integration points

### cli command flow

cli input commander.js feature controller use cases adapters external systems

### data flow

1.  setup cli setupcontroller ollamaadapter ollama api
2.  commit cli commitcontroller gitadapter ollamaadapter git ai

### external dependencies

- ollama local ai model server
- git version control system shell commands
- editor system default editor shell commands

## architecture quality indicators

clean architecture proper layer separation dependency inversion
test coverage comprehensive unit integration e2e tests
error handling custom error types remediation guidance
configuration environment-based type safety
build pipeline modern typescript tooling strict linting
documentation well-structured code jsdoc comments
