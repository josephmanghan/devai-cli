# project overview - devai-cli

## project name purpose

devai-cli ai-powered git commit message generator operates completely locally using ollama. generates conventional commit messages analyzing staged git changes processes local ai model ensuring complete privacy fast response times.

## executive summary

devai-cli solves common developer challenge writing meaningful standardized commit messages. leveraging local ai processing eliminates privacy concerns cloud-based alternatives providing convenience automated commit message generation. tool enforces conventional commit standards supports git workflow best practices maintains complete local data sovereignty.

### key value propositions

- privacy-first 100 local processing - code never leaves machine
- lightning fast sub-1s response time adequate vram
- frictionless setup quick one-time setup automatic model provisioning
- standards compliant generates messages following conventional commit format
- smart validation built-in format validation automatic retry logic

## tech stack summary

category technology version purpose

---

language typescript 5.9.3 type-safe development strict checking
runtime node.js 20.0.0 javascript runtime es2022 support
cli framework commander.js 14.0.2 command-line interface parsing routing
ai integration ollama.js 0.6.3 local ai model communication
ui components clack/prompts 0.11.0 interactive cli user interface
build tool tsup latest typescript bundling compilation
testing vitest 4.0.14 unit integration e2e testing
code quality eslint prettier 9.39.1 3.0.0 linting formatting code standards

## architecture type classification

### architecture pattern clean architecture hexagonal

- layer separation cli application core infrastructure
- dependency inversion core layer defines interfaces infrastructure implements
- testability mockable adapters external dependencies
- maintainability clear separation concerns single responsibility

### repository structure monolith

- type single cohesive codebase
- organization feature-based directory structure
- modularity internal separation architectural layers

### application type cli tool

- interface command-line interactive prompts
- deployment npm package distribution
- runtime node.js executable shebang

## repository structure```

devai-cli/ src/ # Main source code │ main.ts # CLI composition root │ index.ts # Executable entry point │ core/ # Core business logic │ │ ports/ # External interfaces │ │ types/ # Domain types │ features/ # Feature modules │ │ commit/ # Commit generation │ │ setup/ # Initial setup │ infrastructure/ # External integrations │ │ adapters/ # Port implementations │ │ config/ # Configuration │ │ logging/ # Debug utilities │ ui/ # User interface │ adapters/ # UI implementations │ commit/ # Commit UI components │ setup/ # Setup UI components tests/ # Test suites │ e2e/ # End-to-end tests │ integration/ # Integration tests │ helpers/ # Test utilities dist/ # Build output project-docs/ # Project documentation dev/ # Generated analysis and docs

````## current status

 ### version 0.4.0 stable

 - release date december 2025
 - development stage production-ready comprehensive testing
 - installation`npm install devai-cli`### core features implemented

 - setup command automatic ollama configuration model provisioning
 - commit command ai-powered conventional commit generation
 - validation built-in commit message format validation
 - error handling comprehensive error recovery user guidance
 - performance sub-second response times efficient processing
 - privacy complete local data processing

 ### quality metrics

 - test coverage 80 across modules
 - type safety 100 typescript strict mode
 - code quality comprehensive linting formatting
 - documentation complete architectural user documentation

 ## quick reference

 ### installation commands```bash
# Install from npm npm install devai-cli # Install and configure Ollama ollama serve devai-cli setup # Generate commit message git add <files> devai-cli commit
```### available commands

 -`devai-cli setup`- configure ollama provision ai model
 -`devai-cli commit`- generate create conventional commit
 -`devai-cli commit --all`- stage changes generate commit
 -`devai-cli --version`- show version information
 -`devai-cli --help`- display usage information

 ### configuration requirements

 - node.js v20 required
 - ollama local instance qwen2.5-coder1.5b model
 - vram 2gb ai model loading
 - git repository valid git repository staged changes

 ## development status

 ### active development yes

 - maintainer dr joe joseph manghan
 - license mit
 - repository https//github.com/josephmanghan/devai-cli
 - issues accepting bug reports feature requests

 ### recent releases

 - 0.4.0 dec 2025 added spinner ui post-install notifications
 - 0.3.0 dec 2025 updated documentation help system
 - 0.2.0 dec 2025 fixed help documentation commander.js error handling
 - 0.1.0 dec 2025 initial release core functionality

 ### next development priorities

 - performance optimization large repositories
 - additional ai model support
 - custom commit type configuration
 - integration popular git workflows

 ## getting started

 ### users

 1. install`npm install devai-cli`2. setup`ollama serve && devai-cli setup`3. use`git add . && devai-cli commit`### developers

 1. clone`git clone https://github.com/josephmanghan/devai-cli`2. setup`npm install && npm run validate:setup`3. develop`npm run dev`development mode
 4. test`npm run test`comprehensive testing
 5. build`npm run build`production build

 ### contributors

 - code style automatic formatting prettier
 - testing 80 coverage requirement new features
 - documentation update relevant documentation files
 - pull requests use`npm run pr`pre-commit validation

 project represents modern well-architected cli tool prioritizes user privacy performance developer experience maintaining high standards code quality maintainability.
````
