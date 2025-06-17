## 1. Copy Images from Dev ACR to Prod ACR

### Workflow: `copy-images.yml`

**Trigger:** `workflow_dispatch`
**Inputs:**

* `images`: array of string, e.g. `["myorg/web", "myorg/api:0.2.0"]`
* `version`: string, e.g. `"1.0.0"`
* `dry_run`: boolean (default: false)

#### **Logic**

* For each image in `images`:

  1. **If tag not specified** (e.g. `myorg/api`):
     → Use `version` as the tag, so `myorg/api` becomes `myorg/api:1.0.0`
  2. **If tag is specified** (e.g. `myorg/web:0.2.0`):
     → Use as provided.
* **For each resolved image**:

  1. **Pull** from Dev ACR
  2. **Tag** for Prod ACR
  3. **Push** to Prod ACR
  4. If `dry_run`, just log actions, skip Docker commands.
* **Authentication** to both Dev and Prod ACRs with Azure credentials (via secrets).

#### **Implementation**

* TypeScript script (e.g., `copy-images.ts`) using `execa` to shell out to Docker.
* `tsx` to run in Actions.
* Support logging all operations; if `dry_run`, do not execute `pull/tag/push`.
* Output success/failure and final image list.

---

## 2. Remove Old Images from Prod ACR

### Workflow: `cleanup-prod-acr.yml`

**Trigger:** `schedule` (daily, 12:00 UTC+7)
**Config:**

* `keepLatest`: integer (e.g., `2`, as repo secret or input)

#### **Logic**

* **List all repositories** in Prod ACR.
* For each repository:

  1. **List all image tags**, with their push timestamp.
  2. **Sort tags by push time (desc)**.
  3. **Keep only `keepLatest` most recent tags**.
  4. **Delete** all older tags (support `dry_run` to log only).
* **Authentication**: via Azure CLI or Service Principal.
* Support for large repo count (paginate if needed).

#### **Implementation**

* TypeScript script (e.g., `cleanup-acr.ts`) using `execa` to:

  * Use Azure CLI to list images/tags/timestamps
  * Use Docker CLI/Azure CLI to delete tags
* `tsx` runner.
* Dry run: log tags that *would* be deleted, but do not delete.
* Output summary of deletions (actual or simulated).

---

## 3. Directory Structure Suggestion

```
.github/
  workflows/
    copy-images.yml
    cleanup-prod-acr.yml
scripts/
  copy-images.ts
  cleanup-acr.ts
package.json
tsconfig.json
```

---

## 4. Example Inputs

### Dispatch Workflow Input (manual trigger):

```yaml
with:
  images: '["myorg/web", "myorg/api"]'
  version: '1.0.0'
  dry_run: false
```

### Clean-up Schedule (in workflow):

```yaml
env:
  KEEP_LATEST: 2
  DRY_RUN: true
```

---

## 5. Key Notes

* **Authentication**: Use Azure login action with service principal for CLI.
* **Dry run**: Always check for this option; never mutate if enabled.
* **Error handling/logging**: Each step logs and fails gracefully if Docker or Azure CLI errors occur.
* **Extensibility**: Add new features (e.g., selective cleanup, more filters) via TypeScript script.
