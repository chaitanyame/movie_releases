# /harness.generate - Convert Tasks to Feature List

Convert the current feature's tasks into `memory/feature_list.json` for the @Coder agent.

> **Note**: This command runs on the feature branch created by `/speckit.specify`

## Prerequisites

- Must be on a feature branch (e.g., `003-real-time-chat`)
- Tasks file must exist at `specs/{branch-name}/tasks.md`

## Instructions

1. Verify you're on the correct feature branch:
   ```bash
   BRANCH=$(git branch --show-current)
   echo "Generating feature list for: $BRANCH"
   ```

2. Read the tasks file:
   ```bash
   BRANCH=$(git branch --show-current)
   cat specs/$BRANCH/tasks.md
   ```

3. Read `memory/constitution.md` for project context

4. Generate `memory/feature_list.json` in the required format

## Feature List Format

```json
{
  "name": "{Project Name}",
  "description": "{Project description from constitution}",
  "version": "1.0.0",
  "features": [
    {
      "id": 1,
      "name": "{Feature Name}",
      "description": "{From task description}",
      "priority": "high|medium|low",
      "passes": false,
      "steps": [
        "{Step 1 from acceptance criteria}",
        "{Step 2 from acceptance criteria}",
        "{Step 3 - verification step}"
      ]
    }
  ]
}
```

## Conversion Rules


1. **Task → Feature**: Each task becomes a feature
2. **ID**: Sequential integers starting from 1
3. **Priority**: Map P1→high, P2→medium, P3→low
4. **Passes**: Always start as `false`
5. **Steps**: Convert acceptance criteria to testable steps
   - Last step should always be a verification step
   - Steps should be atomic and verifiable

## Example Conversion

**From tasks.md:**
```markdown
#### Task 1: Add User Login
- **ID**: T001
- **Priority**: P1
- **Acceptance Criteria**:
  - [ ] Login form exists at /login
  - [ ] Form validates email format
  - [ ] Successful login redirects to dashboard
```

**To feature_list.json:**
```json
{
  "id": 1,
  "name": "Add User Login",
  "description": "Create login functionality with form validation",
  "priority": "high",
  "passes": false,
  "steps": [
    "Create login form component at /login route",
    "Add email format validation to form",
    "Implement login API integration",
    "Add redirect to dashboard on success",
    "Verify login flow works end-to-end"
  ]
}
```

## Output

1. Create/Update `memory/feature_list.json` with features for this branch
2. Update `memory/claude-progress.md` with:
   - Current branch name
   - Feature count and status
   - Suggested starting feature
   - Environment setup notes

## Branch Tracking

The feature_list.json should include branch metadata:
```json
{
  "branch": "003-real-time-chat",
  "specification": "specs/003-real-time-chat/spec.md",
  "name": "Real-time Chat System",
  ...
}
```

## Next Step

Use `@Coder` agent to implement features on this branch.
All commits happen on the feature branch until all features pass.
When complete, create a PR to merge back to `dev`.
