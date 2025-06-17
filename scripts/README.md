# ACR Copy Script

This script copies container images from a source Azure Container Registry (ACR) to a target ACR with version tagging.

## Usage

The script accepts configuration through environment variables and validates them using Zod schema.

### Environment Variables

| Variable     | Required | Description                                | Example                          |
| ------------ | -------- | ------------------------------------------ | -------------------------------- |
| `IMAGE_NAME` | ✅        | Container image name (with or without tag) | `myorg/api` or `myorg/api:1.0.0` |
| `VERSION`    | ✅        | Version tag to apply to target image       | `1.2.0`                          |
| `SOURCE_ACR` | ✅        | Source ACR URL                             | `dev.azurecr.io`                 |
| `TARGET_ACR` | ✅        | Target ACR URL                             | `prod.azurecr.io`                |
| `DRY_RUN`    | ❌        | Enable dry-run mode (default: false)       | `true` or `false`                |

### Running the Script

```bash
# Copy a tagged image
IMAGE_NAME=myorg/api:1.0.0 VERSION=1.2.0 SOURCE_ACR=dev.azurecr.io TARGET_ACR=prod.azurecr.io pnpm copy-acr

# Copy an untagged image (will pull latest and tag with VERSION)
IMAGE_NAME=myorg/api VERSION=1.2.0 SOURCE_ACR=dev.azurecr.io TARGET_ACR=prod.azurecr.io pnpm copy-acr

# Dry run mode (shows what would be done without executing)
IMAGE_NAME=myorg/api VERSION=1.2.0 SOURCE_ACR=dev.azurecr.io TARGET_ACR=prod.azurecr.io DRY_RUN=true pnpm copy-acr
```

### Using .env file

Create a `.env` file in the project root:

```env
IMAGE_NAME=myorg/api
VERSION=1.2.0
SOURCE_ACR=dev.azurecr.io
TARGET_ACR=prod.azurecr.io
DRY_RUN=false
```

Then run:

```bash
pnpm copy-acr
```

## Script Behavior

### Image Handling

- **Tagged images** (`myorg/api:1.0.0`): Pulls the specific tag from source, tags with VERSION for target
- **Untagged images** (`myorg/api`): Pulls `latest` from source, tags with VERSION for target

### Process Flow

1. **Environment Validation**: Validates all required environment variables using Zod
2. **ACR Authentication**: Authenticates to both source and target ACRs using `az acr login`
3. **Image Pull**: Pulls the image from source ACR using `docker pull`
4. **Image Tagging**: Tags the pulled image for target ACR with specified version
5. **Image Push**: Pushes the tagged image to target ACR using `docker push`

### Example Output

```
🔍 Authenticating to dev.azurecr.io...
✅ Authenticated to dev.azurecr.io
🔍 Authenticating to prod.azurecr.io...
✅ Authenticated to prod.azurecr.io
📥 Pulling dev.azurecr.io/myorg/api:1.0.0...
✅ Image pulled successfully
🏷️  Tagging as prod.azurecr.io/myorg/api:1.2.0...
✅ Image tagged successfully
📤 Pushing prod.azurecr.io/myorg/api:1.2.0...
✅ Image pushed successfully
✅ Copy completed: myorg/api:1.0.0 → prod.azurecr.io/myorg/api:1.2.0
```

### Dry Run Mode

When `DRY_RUN=true`, the script will:
- Show what commands would be executed without running them
- Validate environment variables
- Display the planned operations with `[DRY RUN]` prefix

## Prerequisites

- **Azure CLI**: Must be installed and configured
- **Docker**: Must be installed and running
- **ACR Access**: Must have pull access to source ACR and push access to target ACR
- **Authentication**: Must be logged into Azure CLI with appropriate permissions

## Error Handling

The script provides detailed error messages for common failures:
- Environment variable validation errors
- ACR authentication failures
- Docker pull/tag/push failures
- Missing dependencies

All errors result in a non-zero exit code suitable for CI/CD pipelines.

