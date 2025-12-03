## [unreleased]

### Added

- **Provide Prompt feature**: Added option to provide custom intent to the model during commit generation, allowing users to describe the general context and improve commit message accuracy

## [0.4.0] - 03/12/2025

### Added

- **Spinner functionality**: Visual feedback during commit message generation to improve user experience
- **Post-install notification**: Added npm postinstall script to guide users to run `devai-cli setup` after installation or upgrade

### Fixed

- **Error message consistency**: Updated outdated UI pattern references in validation error messages to match modern Commander Select interface
- **Configuration conflicts**: Resolved hardcoded default parameters in GenerateCommit class that conflicted with CONVENTIONAL_COMMIT_MODEL_CONFIG by implementing dependency injection pattern

## [0.3.0] - 02/12/2025

### Added

- **Documentation**: Added README.md with accurate feature descriptions, Commander Select interface examples, and VRAM requirements

## [0.2.0] - 02/12/2025

### Fixed

- **Help documentation completeness**: Updated help command to include the `-a, --all` global option for staging all changes before commit generation
- **Commander.js error handling**: Fixed error messages appearing when using `--help` and `--version` flags by properly detecting Commander.js success exit codes (exit code 0) and handling them without routing to the error handler

## [0.1.0] - 02/12/2025

### Added

- **Core CLI functionality**: Complete command-line interface with help and version support
- **Setup command**: Configure Ollama integration and provision custom model for commit generation
- **Commit command**: Generate conventional commit messages using AI and commit staged changes
- **All changes staging**: Added `-a, --all` flag to automatically stage all changes before generating commit messages
