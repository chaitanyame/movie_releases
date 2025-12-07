````prompt
# /harness.issue - Add Adhoc Issue

Add a bug, hotfix, enhancement, or adhoc request to `memory/issues.json`.

> **Note**: Issues are for work discovered outside the normal Spec Kit workflow.
> They can be fixed on the current branch (default) or a separate hotfix branch.

## Usage

```
/harness.issue "Login button not working on mobile"
/harness.issue --category=bug --priority=critical "Database connection timeout"
/harness.issue --separate-branch "Urgent security patch needed"
```

## Interactive Flow

When you run `/harness.issue`, the agent will:

1. **Capture Details**
   - Description (required)
   - Category: `bug` | `hotfix` | `enhancement` | `adhoc`
   - Priority: `critical` | `high` | `medium` | `low`
   - Steps to reproduce (for bugs)
   - Related feature ID (if applicable)

2. **Ask About Branch Strategy**
   ```
   ┌─────────────────────────────────────────────────────────────────┐
   │  🔀 BRANCH DECISION                                             │
   ├─────────────────────────────────────────────────────────────────┤
   │                                                                 │
   │  Should this issue be fixed on:                                 │
   │                                                                 │
   │  [1] Current branch (default - recommended for most issues)    │
   │  [2] Separate hotfix branch (for critical/isolated fixes)       │
   │                                                                 │
   │  Choose [1] or [2]:                                             │
   │                                                                 │
   └─────────────────────────────────────────────────────────────────┘
   ```

3. **Create Issue Entry**
   - Generate next issue ID (I001, I002, etc.)
   - Add to `memory/issues.json`
   - If separate branch: create `hotfix/I{id}-{description}`

## Issue Template

```json
{
  "id": "I003",
  "category": "bug",
  "status": "open",
  "priority": "high",
  "description": "User-provided description",
  "steps_to_reproduce": ["Step 1", "Step 2"],
  "same_branch": true,
  "branch": null,
  "related_feature_id": null,
  "discovered_in_session": "YYYY-MM-DD-HH-MM",
  "regression_test_file": null,
  "test_fails_before": false,
  "test_passes_after": false,
  "created_at": "ISO timestamp",
  "closed_at": null
}
```

## TDD Enforcement for Bugs

When category is `bug`, remind the agent:

```
┌─────────────────────────────────────────────────────────────────┐
│  🧪 TDD REQUIRED FOR BUGS                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Before closing this bug, you MUST:                             │
│                                                                 │
│  1. Create regression test: tests/issues/I{id}-{desc}.spec.ts  │
│  2. Verify test FAILS (reproduces bug)                         │
│  3. Fix the bug                                                │
│  4. Verify test PASSES                                         │
│  5. Update issues.json:                                        │
│     - regression_test_file: "path/to/test"                     │
│     - test_fails_before: true                                  │
│     - test_passes_after: true                                  │
│     - status: "closed"                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Separate Branch Workflow

If user chooses separate branch:

```bash
# 1. Get current branch for later merge
CURRENT_BRANCH=$(git branch --show-current)

# 2. Create hotfix branch
git checkout -b hotfix/I{id}-{description}

# 3. Fix the issue
# ... implementation ...

# 4. Commit
git add .
git commit -m "fix(I{id}): {description}"

# 5. Create PR or merge back
git checkout $CURRENT_BRANCH
git merge hotfix/I{id}-{description}
# OR
gh pr create --base $CURRENT_BRANCH --head hotfix/I{id}-{description}
```

## Output

After running `/harness.issue`:

1. ✅ Issue added to `memory/issues.json`
2. ✅ Issue ID displayed: `Created issue I003`
3. ✅ If separate branch: branch created and switched
4. ✅ Reminder about TDD if category is `bug`

## Quick Reference

| Flag | Purpose | Example |
|------|---------|---------|
| `--category=X` | Set category | `--category=bug` |
| `--priority=X` | Set priority | `--priority=critical` |
| `--separate-branch` | Use hotfix branch | `--separate-branch` |
| `--related=N` | Link to feature | `--related=3` |

````
