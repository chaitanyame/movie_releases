# Git Branching Instructions

Apply these guidelines for all Git operations in this project.

## Branch Strategy (Spec Kit Integration)

Branches are created by **Spec Kit's `/speckit.specify` command**, not manually.

```
main (production)
  └── dev (integration)
       ├── 001-user-authentication   ← Created by /speckit.specify
       ├── 002-dashboard-widgets     ← Created by /speckit.specify
       └── 003-real-time-chat        ← Created by /speckit.specify
```

## How Branches Are Created

When you run `/speckit.specify`, it automatically:
1. Scans existing specs to determine next feature number (001, 002, 003...)
2. Creates a semantic branch name from your description
3. Creates the branch and switches to it
4. Creates `specs/{branch-name}/` directory structure

**Example:**
```bash
# User runs:
/speckit.specify Real-time chat system with message history

# Spec Kit automatically:
# 1. Determines next number: 003
# 2. Creates branch: 003-real-time-chat
# 3. Creates: specs/003-real-time-chat/spec.md
```

## Branch Naming Convention

| Source | Pattern | Example |
|--------|---------|---------|
| Spec Kit | `{NNN}-{semantic-name}` | `003-real-time-chat` |
| Hotfix | `hotfix/{description}` | `hotfix/critical-security` |

> **Note**: Feature branches are created by Spec Kit. Hotfix branches are created manually.

## Workflow Per Specification

### 1. Create Specification (creates branch)
```bash
# Spec Kit creates the branch automatically
/speckit.specify "Photo album organizer with tagging"
# → Creates: 001-photo-album-organizer branch
# → Creates: specs/001-photo-album-organizer/spec.md
```

### 2. Plan and Generate Tasks
```bash
# Still on 001-photo-album-organizer branch
/speckit.plan       # → specs/001-photo-album-organizer/plan.md
/speckit.tasks      # → specs/001-photo-album-organizer/tasks.md
/harness.generate   # → memory/feature_list.json
```

### 3. Implementation (@Coder Sessions)
```bash
# All work happens on the Spec Kit branch
git branch --show-current
# → 001-photo-album-organizer

# Multiple @Coder sessions, each implementing one feature
git add .
git commit -m "feat(T001): add photo upload component"
git push origin 001-photo-album-organizer
```

### 4. Complete Specification
```bash
# When ALL features in feature_list.json pass:
BRANCH=$(git branch --show-current)
gh pr create --base dev --head $BRANCH \
  --title "feat: Complete $BRANCH" \
  --body "All features implemented and verified."
```

### 5. After PR Merge
```bash
# Switch to dev and clean up
git checkout dev
git pull origin dev
git branch -d 001-photo-album-organizer
```

## Commit Message Format

```
type(task-id): subject

body (optional)

Part of: {branch-name}
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `chore`: Maintenance

### Examples
```bash
git commit -m "feat(T001): add user login form

Part of: 001-user-authentication"

git commit -m "fix(T003): correct email validation regex

Part of: 001-user-authentication"

git commit -m "test(T001): add Playwright tests for login

Part of: 001-user-authentication"
```

## Tracking Progress

In `memory/claude-progress.md`, always note the Spec Kit branch:

```markdown
### Session 4 - 2024-12-04

**Spec Kit Branch**: `001-user-authentication`
**Feature Implemented**: T003 - Email Validation
**Status**: ✅ Complete (3/8 features passing)

**Next Session**:
- Implement T004 - Password Reset
```

## Recovery

### If current branch is broken
```bash
# Check what went wrong
git log --oneline -10
git diff

# Revert last commit if needed
git revert HEAD

# Or reset to last known good state
git reset --hard HEAD~1
```

### If specification is abandoned
```bash
# Switch back to dev
git checkout dev

# Delete the broken branch
git branch -D 001-broken-feature
git push origin --delete 001-broken-feature
```

## Rules

1. **Branches are created by `/speckit.specify`** - Don't create feature branches manually
2. **One specification = One branch** - All related features on same branch
3. **No sub-branches** - All implementation commits on the Spec Kit branch
4. **Push before ending session** (backup)
5. **PR to dev when all features pass**
6. **Delete branches after PR merge**

## Complete Workflow Diagram

```
                  /speckit.specify
                         │
                         ▼
              ┌──────────────────────┐
              │  001-feature-name    │ ← Branch created
              │  (Spec Kit branch)   │
              └──────────────────────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
        /speckit.plan  /speckit.tasks  /harness.generate
            │            │            │
            ▼            ▼            ▼
        plan.md      tasks.md    feature_list.json
                         │
                         ▼
              ┌──────────────────────┐
              │  @Coder Sessions     │
              │  (implement 1 at a   │
              │   time, commit to    │
              │   same branch)       │
              └──────────────────────┘
                         │
                         ▼
              All features pass?
                    │
              Yes ──┴── No → More @Coder sessions
                    │
                    ▼
              PR to dev → Merge → Delete branch
```
