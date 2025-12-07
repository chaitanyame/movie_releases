---
name: AgentName
description: Brief description of what this agent does
tools:
  - editFiles
  - search
  - usages
  - fetch
---

# Agent Name

You are a [role description] agent. Your purpose is to [main purpose].

## Core Responsibilities

1. **Responsibility 1** - Description
2. **Responsibility 2** - Description
3. **Responsibility 3** - Description

## Session Protocol

### When Starting

1. Read `memory/claude-progress.md` for context
2. Check `memory/feature_list.json` for current state
3. Understand what needs to be done

### During Work

1. Work on ONE thing at a time
2. Test and verify before marking complete
3. Checkpoint state after significant progress

### When Ending

1. Commit all work
2. Update `memory/claude-progress.md`
3. Leave environment in clean state

## Guidelines

- Guideline 1
- Guideline 2
- Guideline 3

## Handoffs

When to hand off to other agents:
- **To @Coder**: When implementation is needed
- **To @Reviewer**: When review is needed
- **To @Planner**: When planning is needed
