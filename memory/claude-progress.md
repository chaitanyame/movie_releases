# Claude Progress Notes

This file bridges context between agent sessions. Each agent reads this at the start of their session and updates it at the end.

## Current Status

**Project**: Agent Harness Framework (Template Repository)
**Status**: Ready for use as template
**Features**: Template - not applicable
**Last Updated**: 2025-12-06

## What's Been Done

This is a **template repository** for building long-lived agents. It includes:

- ✅ Directory structure for agents, prompts, and memory
- ✅ Spec Kit prompts (`/speckit.*`) for spec-driven development
- ✅ Harness prompts (`/harness.*`) for session management
- ✅ Agent definitions (Initializer, Coder, Planner, Researcher, Reviewer, Orchestrator)
- ✅ Scripts for project setup (Bash and PowerShell)
- ✅ Templates for specs, plans, tasks, and feature lists
- ✅ VS Code configuration for Copilot integration
- ✅ **Playwright testing support** - instructions and templates
- ✅ **TDD enforcement gates** - mandatory test-first workflow
- ✅ **Issue tracking system** - adhoc bugs, hotfixes, and requests

## Session History

### Session 6 - 2025-12-06

**Feature**: Add Adhoc Issue Tracking System
**Status**: ✅ Complete

#### Accomplished
- Created `templates/issues-template.json`:
  - 3-state lifecycle: open → in-progress → closed
  - Categories: bug, hotfix, enhancement, adhoc
  - TDD enforcement for bugs (regression tests mandatory)
  - Branch policy: same-branch by default, optional hotfix branch
  - Related feature linking and session discovery tracking

- Created `/harness.issue` prompt (`.github/prompts/harness.issue.prompt.md`):
  - Interactive issue capture with category/priority
  - Branch decision prompt: same branch vs separate hotfix branch
  - TDD reminder for bugs
  - Issue ID generation (I001, I002, etc.)

- Created `/harness.issues` prompt (`.github/prompts/harness.issues.prompt.md`):
  - Issue dashboard with status summary
  - PR readiness check (blocking if critical issues open)
  - Priority-sorted issue listing
  - Stale issue detection (>7 days)

- Updated `@Coder` agent (`.github/agents/coder.agent.md`):
  - Step 1: Now reads issues.json
  - Step 1.5: Check for critical issues before features
  - Step 10.5: Issue processing workflow with TDD gates for bugs
  - Issue discovery protocol during implementation

- Updated `/harness.status` prompt:
  - Added issues summary section
  - Added PR readiness check box

- Updated `AGENTS.md`:
  - Added issues.json to critical artifacts
  - Added Issue Tracking section with commands and categories
  - Added PR Readiness Rules (blocking on critical issues)
  - Added issue tests to file conventions

- Created supporting files:
  - `tests/issues/README.md` - documentation for issue regression tests
  - `templates/tests/issue.spec.template.ts` - template for bug regression tests
  - Updated `README.md` with new harness commands and directory structure

#### Files Changed
- `templates/issues-template.json` (new)
- `.github/prompts/harness.issue.prompt.md` (new)
- `.github/prompts/harness.issues.prompt.md` (new)
- `.github/agents/coder.agent.md` (updated)
- `.github/prompts/harness.status.prompt.md` (updated)
- `AGENTS.md` (updated)
- `README.md` (updated)
- `tests/issues/README.md` (new)
- `templates/tests/issue.spec.template.ts` (new)

#### Issue Workflow Now
```
User discovers issue
       ↓
/harness.issue "description"
       ↓
Agent asks: Same branch or separate?
       ↓
Issue added to memory/issues.json
       ↓
@Coder processes (TDD for bugs)
       ↓
Issue closed, PR ready check
```

---

### Session 5 - 2025-12-05

**Feature**: Strengthen TDD Enforcement
**Status**: ✅ Complete

#### Accomplished
- Added TDD enforcement gates to feature_list template
- Added pre/post implementation gates to coder.agent.md
- Strengthened TDD blocks in constitution.md
- Added TDD gates to speckit.implement prompt
- Updated AGENTS.md and copilot-instructions.md with TDD gates

#### Key Changes
- Features now require: test_file, test_fails_before, test_passes_after
- Visual gate boxes force attention before implementation
- Cannot set passes:true without test_passes_after:true

---

### Session 4 - 2024-12-04

**Feature**: Add Git Feature Branching to Workflow
**Status**: ✅ Complete

#### Accomplished
- Updated `@Coder` agent with feature branching steps:
  - Step 5: Create feature branch before implementing
  - Step 9: Commit and push to feature branch
  - Step 10: Create PR or merge to dev
- Updated `/speckit.implement` prompt with branching workflow
- Created `.github/instructions/git-branching.instructions.md`:
  - Branch naming conventions
  - Workflow per feature
  - Commit message format
  - Recovery procedures

#### Files Changed
- `.github/agents/coder.agent.md` (updated)
- `.github/prompts/speckit.implement.prompt.md` (updated)
- `.github/instructions/git-branching.instructions.md` (new)

#### Branch Workflow Now
```
1. git checkout -b feature/{id}-{name}
2. Implement feature
3. git commit -m "feat({id}): {name}"
4. git push origin feature/{id}-{name}
5. Create PR or merge to dev
```

---

### Session 3 - 2024-12-04

**Feature**: Verify Anthropic Pattern Compliance
**Status**: ✅ Complete

#### Accomplished
- Reviewed Anthropic autonomous-coding repository principles
- Verified framework follows all key patterns:
  - Two-agent pattern (Initializer + Coder) ✅
  - feature_list.json as source of truth ✅
  - Progress notes for context bridging ✅
  - init.sh for environment setup ✅
  - Git-based incremental progress ✅
  - One-feature-at-a-time enforcement ✅
  - Verification before implementation ✅

#### Files Reviewed
- `.github/agents/coder.agent.md` - follows session protocol
- `memory/feature_list.json` - has rules for passes-only edits
- `init.sh` - displays progress, checks prerequisites
- `AGENTS.md` - documents all principles

#### No Changes Needed
Framework is compliant with Anthropic patterns.

---

### Session 2 - 2024-12-04

**Feature**: Add Playwright UI Testing Support
**Status**: ✅ Complete

#### Accomplished
- Created `.github/instructions/playwright.instructions.md` with:
  - Setup instructions
  - Best practices (Page Object Model, data-testid, assertions)
  - Running tests commands
  - Configuration template
  - Integration with harness feature verification
- Created `templates/tests/feature.spec.template.ts` - Playwright test template
- Updated `templates/docs/spec-template.md` - Added UI Tests section

#### Files Changed
- `.github/instructions/playwright.instructions.md` (new)
- `templates/tests/feature.spec.template.ts` (new)
- `templates/docs/spec-template.md` (updated)

#### Next Steps
- Commit changes
- Consider adding example Playwright config to templates

---

### Session 1 - 2024-12-04

**Feature**: Spec Kit + Harness Integration
**Status**: ✅ Complete

#### Accomplished
- Created Spec Kit prompts (`/speckit.*`)
- Created Harness prompts (`/harness.*`)
- Created setup scripts (Bash + PowerShell)
- Created documentation templates
- Updated README with workflows

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/speckit.constitution` | Define project principles |
| `/speckit.specify` | Create feature spec |
| `/speckit.plan` | Create implementation plan |
| `/speckit.tasks` | Generate task list |
| `/harness.generate` | Convert to feature_list.json |
| `/harness.status` | View progress |
| `@Initializer` | Quick setup (alternative) |
| `@Coder` | Implement features |

---

## Session Log Format

When using this template for a real project, update this file with:

```markdown
### Session N - YYYY-MM-DD HH:MM

**Agent**: [agent name]
**Duration**: ~X minutes
**Features Completed**: X/Y

#### Accomplished
- [What was done]

#### Issues Found
- [Any bugs or problems discovered]

#### Next Steps
- [What the next agent should do]
```
