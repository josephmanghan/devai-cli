# architecture documentation - devai-cli

## executive summary

devai-cli typescript-based command-line interface generates conventional git commit messages using local ai models. application follows clean architecture principles hexagonal port/adapter pattern ensuring complete separation concerns testability.

key characteristics

- local-first ai processing happens locally via ollama
- privacy-preserving external api calls data transmission
- clean architecture hexagonal design dependency inversion
- type-safe full typescript implementation strict type checking
- testable comprehensive test coverage 80 mock adapters

## technology stack

### core technologies

- language typescript 5.9.3 es2022 modules
- runtime node.js 20.0.0
- build system tsup typescript bundler
- package manager npm

### frameworks libraries

- cli framework commander.js 14.0.2
- ai integration ollama.js 0.6.3
- ui components clack/prompts 0.11.0
- process execution execa 9.6.1
- spinner/ui ora 9.0.0
- debug logging debug 4.4.3

### development toolchain

- testing vitest 4.0.14 v8 coverage
- linting eslint 9.39.1 typescript support
- formatting prettier 3.0.0 import sorting
- type checking typescript strict mode

## architecture pattern

### hexagonal ports adapters architecture

application implements clean architecture hexagonal pattern

cli interface layer

commander clack/prompts ora spinner

application layer

controllers use cases ui adapters

core layer

ports types domain
interfaces logic

infrastructure layer

git adapter ollama editor
adapter adapter

### layer responsibilities

cli interface layer

- command parsing routing
- user interaction prompts
- progress indication feedback

application layer

- command controllers orchestration
- ui adapters cli components
- use case coordination

core layer

- business logic domain models
- port interfaces external contracts
- type definitions error handling

infrastructure layer

- external system integrations
- shell command adapters
- configuration logging

## component architecture

### core domain model

#### types interfaces

typescript
// core domain types
interface commitmessage
type string
description string
body string

interface gitdiff
files filechange
summary string

interface ollamaresponse
message string
model string
done boolean

#### ports external interfaces

typescript
// git operations port
interface gitport
getstagedchanges promisegitdiff
commitmessage string promisevoid
validaterepository promiseboolean

// llm integration port
interface llmport
generatecommitdiff gitdiff type string promisestring
validateconnection promiseboolean

// user interface port
interface commituiport
selectcommittype promisestring
previewmessagemessage string promiseboolean
editmessagemessage string promisestring

### feature architecture

#### commit generation feature

commitcontroller
validatepreconditions gitrepo ollama connection
generatecommit ai conventional commits
formatvalidator commit format rules
messagenormalizer standardization
typeenforcer conventional types

#### setup feature

setupcontroller
validateollamaconnection connectivity test
ensurebasemodel model availability
provisioncustommodel custom model creation
consolesetuprenderer setup ui

### adapter implementations

#### git adapter

- technology shell commands via execa
- operations git diff git status git commit git log
- error handling git error parsing user-friendly messages

#### ollama adapter

- technology ollama.js library
- models qwen2.5-coder1.5b custom system prompt
- configuration temperature 0.2 131k context window
- error recovery retry logic fallback strategies

#### editor adapter

- technology shell editor commands
- editors support system default editor
- integration temporary file creation cleanup

## data architecture

### data flow patterns

#### commit generation flow

1.  cli command controller
2.  controller validatepreconditions git ollama
3.  ui selectcommittype user input
4.  controller generatecommit ai processing
5.  ui previewmessage user review
6.  controller gitadapter.commit git operation
7.  ui success feedback

#### setup flow

1.  cli command setupcontroller
2.  validateollamaconnection connection test
3.  ensurebasemodel model check
4.  provisioncustommodel model creation
5.  consolesetuprenderer progress feedback
6.  configuration validation

### configuration management

#### model configuration

typescript
const conventional_commit_model_config
model devai-cli-commitlatest
basemodel qwen2.5-coder1.5b
systemprompt conventional commits expert...
temperature 0.2
num_ctx 131072
keep_alive

#### error handling strategy

typescript
// custom error hierarchy
apperror
giterror repository issues
ollamaerror ai service issues
validationerror input validation
configurationerror setup issues

## integration architecture

### external system integrations

#### ollama integration

- protocol http rest api
- endpoint http//localhost11434
- authentication none local instance
- model management automatic provisioning validation

#### git integration

- protocol shell commands
- operations status diff commit log
- repository access current working directory
- error handling git exit code parsing

#### editor integration

- protocol shell environment variables
- editors editor environment variable
- workflow temporary file creation editor launch file read cleanup

### security architecture

#### privacy protection

- local processing ai processing happens locally
- external apis network calls external services
- data persistence user data stored transmitted

#### command security

- input validation strict parameter validation
- shell injection prevention parameterized shell commands
- file system access limited current repository

## development architecture

### testing architecture

testing pyramid

e2e tests
tests - complete workflows

integration tests
test - setup validation

unit tests
70 tests - individual components

### test infrastructure

- mock adapters isolated testing predictable behavior
- git harness temporary git repositories testing
- performance tracking test execution time monitoring
- coverage requirements 80 minimum coverage

### build architecture

build pipeline
source typescript tsup bundle esm executable

type checking minification node.js shebang

error prevention size reduction cli ready

## deployment architecture

### distribution model

- package npm package devai-cli
- installation npm install devai-cli
- binary generated javascript executable
- dependencies runtime dependencies included

### runtime requirements

- node.js v20 es2022 module support
- ollama local instance compatible model
- vram 2gb ai model loading
- operating system cross-platform macos linux windows

## performance architecture

### ai model optimization

- model selection qwen2.5-coder1.5b optimized code analysis
- context management efficient git diff processing
- memory management proper model lifecycle management
- response time target 2s typical commits

### git operation optimization

- diff processing streaming large repositories
- caching smart caching git operations
- error recovery graceful handling git repository issues

### cli performance

- startup time fast module loading es modules
- memory usage efficient memory management
- user feedback progress indicators long operations

## quality assurance architecture

### code quality metrics

- test coverage 80 across layers
- typescript strictness full strict mode enabled
- lint rules comprehensive eslint configuration
- code complexity maximum 10 per function

### continuous integration

- automated testing unit integration e2e tests
- code quality linting formatting checks
- type safety typescript compilation validation
- build verification production build testing

architecture ensures maintainability testability reliability providing fast private user-friendly cli experience ai-powered commit message generation.
