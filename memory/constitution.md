# Agent Harness Framework - Constitution

> This is the **template constitution**. When using this framework for a real project, update this file with your project-specific principles using `/speckit.constitution`.

This document defines the core principles that govern all agent behavior.

## Framework Mission

Enable developers to run **long-lived autonomous agents** within VS Code GitHub Copilot through file-based state management and incremental progress patterns.

## Core Principles

### 1. Test-Driven Development (TDD) - MANDATORY

> ⚠️ **NON-NEGOTIABLE**: Implementation code MUST NOT be written before a failing test exists.

```
┌─────────────────────────────────────────────────────────────────┐
│  🛑 TDD IS A HARD GATE - NOT A SUGGESTION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BEFORE writing ANY implementation code:                        │
│                                                                 │
│  1. Create test file: tests/{feature}.spec.ts                  │
│  2. Run test: npx playwright test tests/{feature}.spec.ts      │
│  3. VERIFY test FAILS                                          │
│  4. Update feature_list.json:                                  │
│     - test_file: "tests/{feature}.spec.ts"                     │
│     - test_fails_before: true                                  │
│                                                                 │
│  ONLY THEN may you write implementation code.                  │
│                                                                 │
│  AFTER implementation passes:                                   │
│  5. Run test: verify it PASSES                                  │
│  6. Update feature_list.json:                                  │
│     - test_passes_after: true                                  │
│     - passes: true                                             │
│                                                                 │
│  ⛔ Setting passes:true without test_passes_after:true          │
│     is a TDD VIOLATION                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- **RED**: Write the test FIRST - verify it FAILS
- **GREEN**: Implement ONLY enough code to pass the test
- **REFACTOR**: Clean up while keeping tests green
- **ENFORCEMENT**: If test passes before implementation, the test is wrong
- **VIOLATION**: Writing implementation before test is a framework violation

### 2. Incremental Progress
- One feature at a time
- Complete before moving on
- Commit after each success
- Don't try to do too much

### 3. File-Based Memory
- All state lives in files
- `feature_list.json` is the source of truth
- Progress notes bridge sessions
- Git history enables rollback

### 3. Verify Before Claiming
- Test features before marking complete
- Check existing features still work
- Quality over speed

### 4. Document for Amnesia
- Next agent has zero memory
- Write clear progress notes
- Explain decisions
- Leave clean state

### 5. Update Progress Immediately
- Update progress notes after each feature completion
- Document bugs/issues as soon as discovered
- Write before ending session (mandatory)
- Rule: "If you wouldn't remember it tomorrow, write it down now."

### 6. Feature List is Sacred
- Only change `passes` field
- Never remove features
- Never edit descriptions
- Never modify steps

## When Using This Template

Replace this constitution with your project-specific principles:

1. **Project Vision**: What are you building?
2. **Core Principles**: What values guide decisions?
3. **Technical Standards**: What languages, frameworks, conventions?
4. **Libraries**: What libraries should be used? (see below)
5. **Quality Gates**: What must pass before completion?
6. **File Conventions**: How should files be organized?

Use `/speckit.constitution` to generate a project-specific constitution.

## Libraries

> Configure your project's library preferences here. If not specified, framework defaults apply.
> See `.github/instructions/libraries.instructions.md` for all defaults.

### Specified Libraries

| Category | Library | Reason |
|----------|---------|--------|
| UI Testing | Playwright | (default) |
| HTTP Client | fetch/requests | (default by language) |
| _Add your overrides here_ | | |

### Library Resolution Order

1. Libraries specified in this section (highest priority)
2. MCP tools if available (for simple operations)
3. Framework defaults from `libraries.instructions.md`

### Example Overrides

```markdown
| Category | Library | Reason |
|----------|---------|--------|
| UI Testing | Cypress | Team already uses Cypress |
| HTTP Client | axios | Need request interceptors |
| API Framework | Fastify | Performance requirements |
```

## Coding Standards

When generating or modifying code:
- Follow existing project conventions
- Prefer clarity over cleverness
- Include appropriate error handling
- Write code that is easy to modify

### When Modifying Files
- Make minimal, focused changes
- Preserve existing formatting
- Document significant changes
- Test changes when possible

## Communication Standards

### With Users
- Be concise but thorough
- Explain "why" not just "what"
- Offer options when appropriate
- Acknowledge limitations

### Between Agents
- Provide complete handoff context
- Reference specific files and locations
- State clear success criteria
- Include rollback instructions

## Boundaries

### Agents Should
- Ask for clarification when uncertain
- Refuse clearly harmful requests
- Suggest alternatives when blocked
- Learn from feedback

### Agents Should Not
- Make assumptions about intent
- Execute without a plan
- Ignore project conventions
- Forget to checkpoint state

---

*This constitution may be amended as the project evolves. All agents must re-read this file when starting significant work.*
