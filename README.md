# Deploy Container Prod

Container deployment automation tool for managing Azure Container Registry (ACR) images between development and production environments.

## Overview

This project provides automated workflows for:
- **Image Copy**: Transfer container images from dev ACR to prod ACR with version tagging
- **Mode-based Operations**: Support for pull-only, push-only, or full copy operations
- **GitHub Actions Integration**: Automated workflows with proper Azure authentication handling

## Features

- 🔄 **Flexible Modes**: Pull, push, or full copy operations
- 🔐 **Secure Authentication**: External Azure CLI authentication support for CI/CD
- 🧪 **Dry Run Mode**: Test operations without making actual changes
- 📋 **Comprehensive Logging**: Detailed operation feedback and error reporting
- ⚡ **TypeScript**: Modern ES modules with strict type checking

## Architecture

- **TypeScript ESM**: Modern ES modules with strict TypeScript configuration
- **tsx**: Direct TypeScript execution without compilation step  
- **GitHub Actions**: Two-step workflow automation for secure image management
- **Docker CLI**: Image operations via `execa` process execution
- **Azure CLI**: Authentication and ACR integration

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Docker
- Azure CLI (for local usage)

### Installation

```bash
pnpm install
```

### Environment Variables

Required environment variables:

```bash
IMAGE_NAME=myorg/api              # Container image name (with or without tag)
VERSION=1.0.0                     # Version tag to apply
SOURCE_ACR=dev.azurecr.io         # Source ACR URL
TARGET_ACR=prod.azurecr.io        # Target ACR URL
DRY_RUN=false                     # Enable dry-run mode (optional)
MODE=full                         # Operation mode: pull, push, or full (optional)
SKIP_AUTH=false                   # Skip internal auth for external management (optional)
```

## Usage

### Local Development

```bash
# Full copy (default)
pnpm copy-acr

# Pull and tag only
MODE=pull pnpm copy-acr

# Push only (assumes image already tagged locally)
MODE=push pnpm copy-acr

# Dry run to test without executing
DRY_RUN=true pnpm copy-acr

# Skip authentication (when using external Azure CLI login)
SKIP_AUTH=true MODE=pull pnpm copy-acr
```

### GitHub Actions

The project includes a GitHub Actions workflow that automatically handles the two-step process:

1. **Step 1**: Login to source ACR → Pull and tag image
2. **Step 2**: Login to target ACR → Push image

#### Required Secrets

Set these secrets in your GitHub repository:

```bash
# Source ACR credentials (JSON format)
AZURE_CREDENTIAL_SOURCE_ACR={
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}

# Target ACR credentials (JSON format)  
AZURE_CREDENTIAL_TARGET_ACR={
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}

# ACR URLs (if not provided as workflow inputs)
SOURCE_ACR=dev.azurecr.io
TARGET_ACR=prod.azurecr.io
```

#### Workflow Usage

1. Go to Actions tab in your GitHub repository
2. Select "Copy ACR Image" workflow
3. Click "Run workflow"
4. Fill in the parameters:
   - **Image Name**: `myorg/api` (with or without tag)
   - **Version**: `1.0.0` (target version tag)
   - **Dry Run**: Check to test without executing

## Operation Modes

### Full Mode (Default)
Complete copy operation: authenticate → pull → tag → push
```bash
pnpm copy-acr
```

### Pull Mode
Pull from source and tag for target (no push):
```bash
MODE=pull pnpm copy-acr
```

### Push Mode  
Push previously tagged image to target:
```bash
MODE=push pnpm copy-acr
```

## Authentication

### Local Usage
Uses Azure CLI authentication:
```bash
# Login to Azure first
az login

# Then run the script
pnpm copy-acr
```

### GitHub Actions
Uses service principal authentication via `azure/login@v1` action with separate credentials for source and target ACRs.

### Skip Authentication
When using external authentication management:
```bash
SKIP_AUTH=true pnpm copy-acr
```

## Development Commands

```bash
# Development with watch mode
pnpm dev

# Run once
pnpm start

# Testing
pnpm test              # Run tests with watch mode
pnpm test:ci           # Single test run for CI
pnpm test:coverage     # Generate coverage report

# Code Quality
pnpm check-types       # TypeScript type checking
pnpm lint              # TypeScript + ESLint check
pnpm lint:fix          # Auto-fix linting issues
pnpm format            # Format with Prettier

# Build
pnpm build             # Bundle for distribution

# Dependencies
pnpm upgrade-deps      # Interactive dependency updates
```

## Error Handling

The script provides comprehensive error handling with:
- Detailed error messages for each operation
- Proper exit codes for CI/CD integration
- Dry-run validation before actual execution
- Authentication failure detection

## Examples

### Copy specific version
```bash
IMAGE_NAME=myorg/api:latest VERSION=1.2.3 pnpm copy-acr
```

### Copy untagged image
```bash
IMAGE_NAME=myorg/api VERSION=1.2.3 pnpm copy-acr
# Result: myorg/api:1.2.3 in target ACR
```

### Two-step deployment
```bash
# Step 1: Pull and prepare
MODE=pull pnpm copy-acr

# Step 2: Deploy to production  
MODE=push pnpm copy-acr
```

## License

MIT