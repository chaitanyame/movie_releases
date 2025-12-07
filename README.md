# Agent Harness Framework

A template repository for building **long-lived autonomous agents** within VS Code GitHub Copilot, based on [Anthropic's "Effective Harnesses for Long-Running Agents"](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

## The Problem

AI agents face a fundamental challenge: **each new context window starts with no memory**. Without proper scaffolding:
- Agents try to do too much at once
- They declare victory prematurely  
- Work gets left in broken states
- Time is wasted re-discovering context

## The Solution

This framework provides file-based artifacts that bridge context between sessions:

| Artifact | Purpose |
|----------|---------|
| `memory/feature_list.json` | Source of truth - all features with pass/fail tracking |
| `memory/claude-progress.md` | Session notes - what happened, what's next |
| `init.sh` / `init.ps1` | Environment setup script |
| Git history | Incremental progress with rollback capability |

## Quick Start

### 1. Use as Template

Click "Use this template" on GitHub, or clone directly:

```bash
git clone https://github.com/anthropics/agent-harness-framework.git my-project
cd my-project
```

### 2. Initialize Your Project

In VS Code with GitHub Copilot, invoke the Initializer agent:

```
@Initializer Set up a [describe your project]
```

The Initializer will:
- Create `memory/feature_list.json` with all features
- Set up project structure
- Create `init.sh` for environment setup
- Make the initial git commit

### 3. Implement Features

Use the Coder agent for subsequent sessions:

```
@Coder Continue implementing features
```

The Coder will:
- Read progress notes to get context
- Pick one feature to implement
- Test and verify
- Commit and update progress

## Two-Agent Pattern

### Initializer (Session 1)

Sets up the foundation for all future work:
- Creates comprehensive feature list
- Establishes project structure
- Documents everything for future agents

### Coder (Sessions 2+)

Makes incremental progress:
- Reads previous session notes
- Implements ONE feature at a time
- Tests before marking complete
- Leaves clean state for next session

## Directory Structure

```
├── .github/
│   ├── agents/           # Agent definitions
│   │   ├── initializer.agent.md
│   │   ├── coder.agent.md
│   │   ├── planner.agent.md
│   │   ├── researcher.agent.md
│   │   ├── reviewer.agent.md
│   │   └── orchestrator.agent.md
│   ├── prompts/          # Reusable prompt commands
│   ├── instructions/     # Context-specific instructions
│   └── copilot-instructions.md
├── .vscode/
│   ├── mcp.json          # MCP server configuration
│   └── settings.json     # VS Code settings
├── memory/
│   ├── constitution.md   # Project principles
│   ├── feature_list.json # Source of truth
│   ├── issues.json       # Adhoc issues and bugs
│   ├── claude-progress.md # Session notes
│   ├── state/            # Agent checkpoints
│   ├── context/          # Persisted knowledge
│   └── sessions/         # Session logs
├── templates/            # Templates for new agents/prompts
├── AGENTS.md             # Cross-agent instructions
├── init.sh               # Setup script (Unix)
├── init.ps1              # Setup script (Windows)
└── README.md
```

## Critical Rules

### Feature List is Sacred

`memory/feature_list.json` is the single source of truth:
- ✅ Change `"passes": false` → `"passes": true` when verified
- ❌ NEVER remove features
- ❌ NEVER edit descriptions  
- ❌ NEVER modify steps
- ❌ NEVER reorder features

### One Feature at a Time

Each session should focus on ONE feature:
1. Pick highest priority with `passes: false`
2. Implement completely
3. Test and verify
4. Commit and document

### Leave Clean State

Before ending any session:
- All work committed
- Progress notes updated
- No broken features
- Ready for next agent

## Available Agents

| Agent | Purpose | Use When |
|-------|---------|----------|
| `@Initializer` | First session setup | Starting new project |
| `@Coder` | Feature implementation | Continuing development |
| `@Planner` | Task breakdown | Complex planning needed |
| `@Researcher` | Context gathering | Need to understand codebase |
| `@Reviewer` | Quality assurance | Review completed work |
| `@Orchestrator` | Multi-agent coordination | Complex multi-step workflows |

## Workflows

### Spec-Driven Development (Recommended)

Use this workflow for new projects or features:

```
/speckit.constitution  →  Define project principles
       ↓
/speckit.specify      →  Create feature specifications
       ↓
/speckit.plan         →  Create implementation plan
       ↓
/speckit.tasks        →  Generate detailed task list
       ↓
/harness.generate     →  Convert to feature_list.json
       ↓
@Coder                →  Implement incrementally
```

### Quick Start Workflow

Use this for simpler projects:

```
@Initializer          →  Set up everything at once
       ↓
@Coder                →  Implement features
```

## Prompt Commands

### Spec Kit Commands

| Command | Purpose |
|---------|---------|
| `/speckit.constitution` | Create project principles and standards |
| `/speckit.specify` | Create detailed feature specification |
| `/speckit.plan` | Create implementation plan from specs |
| `/speckit.tasks` | Generate actionable task list |
| `/speckit.implement` | Implement a specific task |

### Harness Commands

| Command | Purpose |
|---------|---------|
| `/harness.generate` | Convert tasks.md to feature_list.json |
| `/harness.status` | View progress dashboard |
| `/harness.verify` | Verify passing features |
| `/harness.checkpoint` | Save session state |
| `/harness.resume` | Resume from checkpoint |
| `/harness.issue` | Add adhoc bug, hotfix, or request |
| `/harness.issues` | View issue tracking dashboard |

## Customization

### Adding New Agents

Create a file in `.github/agents/`:

```markdown
---
name: MyAgent
description: What this agent does
tools:
  - editFiles
  - search
---

# My Agent

Instructions for the agent...
```

### Adding New Prompts

Create a file in `.github/prompts/`:

```markdown
---
agent: agent
description: What this prompt does
---

# My Prompt

Prompt content...
```

## Based On

This framework implements patterns from:
- [Anthropic: Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic Quickstart: Autonomous Coding](https://github.com/anthropics/claude-quickstarts/tree/main/autonomous-coding)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and request features.

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## License

MIT License - see [LICENSE](LICENSE) for details.
