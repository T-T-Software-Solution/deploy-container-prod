# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a container deployment automation tool for managing Azure Container Registry (ACR) images between development and production environments. The project provides two main workflows:

1. **Copy Images**: Transfer container images from dev ACR to prod ACR with version tagging
2. **Cleanup**: Automated removal of old images from prod ACR to maintain storage efficiency

## Architecture

- **TypeScript ESM**: Modern ES modules with strict TypeScript configuration
- **tsx**: Direct TypeScript execution without compilation step  
- **vitest**: Zero-config testing framework with coverage support
- **tsup**: esbuild-based bundling for distribution
- **GitHub Actions**: Workflow automation for image management

The core logic is implemented in TypeScript scripts that shell out to Docker CLI and Azure CLI using `execa` for process execution.

## Common Commands

```bash
# Development
pnpm dev              # Run with watch mode using tsx
pnpm start            # Run once

# Testing  
pnpm test             # Run tests with watch mode
pnpm test:ci          # Single test run for CI
pnpm test:coverage    # Generate coverage report

# Code Quality
pnpm lint             # TypeScript + ESLint check
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format with Prettier

# Build
pnpm build            # Bundle for distribution (ESM + CJS)

# Dependencies
pnpm upgrade-deps     # Interactive dependency updates
```

## Key Implementation Details

### Image Copy Workflow
- Supports both tagged (`myorg/api:1.0.0`) and untagged (`myorg/api`) image specifications
- Untagged images automatically use the provided version parameter as tag
- Dry run mode for safe testing of operations
- Azure authentication via service principal secrets

### Cleanup Workflow  
- Scheduled daily execution (12:00 UTC+7)
- Configurable retention count via `keepLatest` parameter
- Sorts images by push timestamp, preserving most recent
- Supports dry run mode for validation

### Docker Operations
All Docker commands (pull/tag/push/delete) are executed via `execa` with proper error handling and logging. Authentication to both dev and prod ACRs is handled through Azure CLI integration.