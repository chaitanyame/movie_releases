# Agent Harness Framework - Global Copilot Instructions

This workspace uses the **Agent Harness Framework** for building long-lived autonomous agents within GitHub Copilot, based on [Anthropic's "Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) integrated with [GitHub Spec Kit](https://github.com/github/spec-kit).

## Framework Overview

This framework solves the core challenge of long-running agents: **bridging context between sessions**. Each new session starts with no memory, so we use file-based artifacts to maintain continuity.

Key artifacts:
- **`specs/{branch}/`** - Specification, plan, and tasks per feature
- **`memory/feature_list.json`** - Source of truth for all work (features with pass/fail status)
- **`memory/claude-progress.md`** - Session-to-session progress notes
- **Git branches** - Each specification gets its own branch (created by Spec Kit)

## Spec Kit + Harness Workflow

### Planning Phase (Spec Kit)
1. `/speckit.specify` - Creates spec + **auto-creates branch** (e.g., `003-real-time-chat`)
2. `/speckit.plan` - Creates implementation plan
3. `/speckit.tasks` - Generates detailed task list
4. `/harness.generate` - Converts tasks to `feature_list.json`

### Implementation Phase (Harness)
5. `@Coder` - Implements features one at a time on Spec Kit branch
6. Repeat @Coder until all features pass
7. Create PR to merge Spec Kit branch to dev

## Critical Principles

1. **TDD is MANDATORY** - Write failing test FIRST, then implement, then refactor. Never implement without a failing test.

### 🛑 TDD ENFORCEMENT GATES (Non-Negotiable)

```
┌──────────────────────────────────────────────────────────────────┐
│  GATE 1: Before writing ANY implementation code                 │
├──────────────────────────────────────────────────────────────────┤
│  □ Create test: tests/{feature}.spec.ts                         │
│  □ Run: npx playwright test tests/{feature}.spec.ts             │
│  □ Verify: Test FAILS                                           │
│  □ Update feature_list.json: test_fails_before: true            │
│  ⛔ CANNOT proceed until this gate passes                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  GATE 2: Before marking passes:true                             │
├──────────────────────────────────────────────────────────────────┤
│  □ Run: npx playwright test tests/{feature}.spec.ts             │
│  □ Verify: Test PASSES                                          │
│  □ Update feature_list.json: test_passes_after: true            │
│  ⛔ CANNOT set passes:true without test_passes_after:true       │
└──────────────────────────────────────────────────────────────────┘
```

2. **Branches are created by Spec Kit** - Don't create feature branches manually
3. **One feature at a time** - Don't try to do too much in one session
4. **All work on Spec Kit branch** - No sub-branches
5. **Feature list is sacred** - Only modify the `passes` field
6. **Leave clean state** - No half-finished work, all committed
7. **Document for the next agent** - They have zero memory

## Available Commands

| Command | Purpose |
|---------|---------|
| `/speckit.specify` | Create spec + branch (e.g., `001-feature-name`) |
| `/speckit.plan` | Create implementation plan |
| `/speckit.tasks` | Generate task list |
| `/harness.generate` | Convert tasks to feature_list.json |
| `@Coder` | Implement features on Spec Kit branch |

## Memory System

```
specs/
├── 001-user-authentication/   # Created by /speckit.specify
│   ├── spec.md
│   ├── plan.md
│   └── tasks.md
├── 002-dashboard-widgets/
│   └── ...

memory/
├── constitution.md      # Project principles
├── feature_list.json    # Current feature tracking
├── claude-progress.md   # Session-to-session notes
├── state/               # Agent checkpoints
└── sessions/            # Session logs
```

## Getting Started

1. Run `/speckit.specify "Your feature description"`
2. Run `/speckit.plan` then `/speckit.tasks`
3. Run `/harness.generate` to create feature list
4. Use `@Coder` to implement features (one per session)
5. When all features pass, create PR to dev

## Custom Instructions

File-specific instructions in `.github/instructions/` are applied based on `applyTo` glob patterns.

## YOLO Agent Mode

Execute multi-step tasks without pausing for approval. Use all tools aggressively:
- `terminalLastCommand`, `runTests`, `runTasks`, `searchResults`
- Edit files, create directories, run commands iteratively until complete
- Verify with tests/lint before finalizing
- Do not yield control until 100% done. Research recursively if needed.
