# /speckit.tasks - Generate Task List

Convert the implementation plan into a detailed task list ready for execution.

> **Note**: This command runs on the feature branch created by `/speckit.specify`

## Prerequisites

- Must be on a feature branch (e.g., `003-real-time-chat`)
- Plan must exist at `specs/{branch-name}/plan.md`

## Instructions

1. Verify you're on the correct feature branch:
   ```bash
   BRANCH=$(git branch --show-current)
   echo "Working on: $BRANCH"
   ```

2. Read `memory/constitution.md` for project principles

3. Read the plan:
   ```bash
   BRANCH=$(git branch --show-current)
   cat specs/$BRANCH/plan.md
   ```

4. Generate `specs/{branch-name}/tasks.md` with detailed, actionable tasks

## Task List Template

```markdown
# Task List

**Feature Branch**: {branch-name}
Generated from: [plan.md](plan.md)
Date: {YYYY-MM-DD}

## Overview
- **Total Tasks**: {count}
- **Estimated Sessions**: {count}

## Task Categories

### Category: {Category Name}

#### Task 1: {Task Title}
- **ID**: T001
- **Priority**: {P1/P2/P3}
- **Complexity**: {Low/Medium/High}
- **Depends On**: {task IDs or "None"}
- **Estimated Effort**: {1-3 sessions}

**Description**:
{Detailed description of what needs to be done}

**Acceptance Criteria**:
- [ ] {Criterion 1}
- [ ] {Criterion 2}

**Files to Modify/Create**:
- `path/to/file1.ts`
- `path/to/file2.ts`

**Testing Notes**:
{How to verify this task is complete}

---

#### Task 2: {Task Title}
...

## Dependency Graph

```
T001 ─┬─> T002 ─> T004
      └─> T003 ─┘
```

## Suggested Order
1. T001 - {title}
2. T003 - {title}
3. T002 - {title}
...
```

## Output

Create `specs/{branch-name}/tasks.md`.

Example: If on branch `003-real-time-chat`, create:
- `specs/003-real-time-chat/tasks.md`

## Next Step

Run `/harness.generate` to convert tasks to `memory/feature_list.json` for the @Coder agent.
All implementation happens on this same feature branch.