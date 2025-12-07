# /speckit.plan - Create Implementation Plan

Create an implementation plan for the current feature specification.

> **Note**: This command runs on the feature branch created by `/speckit.specify`

## Prerequisites

- Must be on a feature branch (e.g., `003-real-time-chat`)
- Specification must exist at `specs/{branch-name}/spec.md`

## Instructions

1. Verify you're on the correct feature branch:
   ```bash
   git branch --show-current
   # Should return something like: 003-real-time-chat
   ```

2. Read `memory/constitution.md` for project principles

3. Read the specification:
   ```bash
   # Get current branch name
   BRANCH=$(git branch --show-current)
   cat specs/$BRANCH/spec.md
   ```

4. Create the implementation plan at `specs/{branch-name}/plan.md`

## Plan Template

```markdown
# Implementation Plan

**Feature Branch**: {branch-name}
**Specification**: [spec.md](spec.md)
**Created**: {YYYY-MM-DD}

## Specifications Covered
- [spec.md](spec.md)

## Implementation Phases

### Phase 1: {Phase Name}
**Goal**: {What this phase achieves}
**Duration**: {Estimated sessions}

#### Tasks
1. {Task 1}
   - Depends on: {dependencies}
   - Complexity: {low/medium/high}
2. {Task 2}

### Phase 2: {Phase Name}
...

## Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| {Risk 1} | {L/M/H} | {L/M/H} | {Strategy} |

## Success Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}

## Open Decisions
- {Decision 1}: {options}
```

## Output

Create `specs/{branch-name}/plan.md` with the implementation plan.

Example: If on branch `003-real-time-chat`, create:
- `specs/003-real-time-chat/plan.md`

## Next Step

Run `/speckit.tasks` to convert plan into actionable tasks.
