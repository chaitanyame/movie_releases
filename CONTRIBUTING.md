# Contributing to Agent Harness Framework

First off, thank you for considering contributing to the Agent Harness Framework! 🎉

This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- VS Code with GitHub Copilot extension
- Git
- Node.js 18+ (for MCP servers)
- Basic understanding of AI agents and prompt engineering

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agent-harness-framework.git
   cd agent-harness-framework
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/chaitanyame/github_copilot_harness_framework.git
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, VS Code version, Copilot version)
- **Screenshots** if applicable

### Suggesting Features

Feature requests are welcome! Please include:

- **Clear use case** - What problem does this solve?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What other options did you think about?
- **Additional context** - Any examples or mockups?

### Contributing Code

1. **Find an issue** to work on, or create one first
2. **Comment on the issue** to let others know you're working on it
3. **Create a branch** from `dev`:
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following our style guidelines
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Setup

### Project Structure

```
├── .github/
│   ├── agents/           # Agent definitions (*.agent.md)
│   ├── prompts/          # Prompt commands (*.prompt.md)
│   ├── instructions/     # Context instructions (*.instructions.md)
│   └── copilot-instructions.md
├── memory/               # Memory system templates
├── templates/            # Document and code templates
├── scripts/              # Setup and utility scripts
└── specs/                # Feature specifications
```

### Key Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Cross-agent instructions |
| `.github/copilot-instructions.md` | Global Copilot context |
| `memory/constitution.md` | Project principles template |

### Testing Changes

1. **Agent changes**: Test by invoking the agent in VS Code Copilot
2. **Prompt changes**: Test by running the prompt command
3. **Instruction changes**: Verify instructions are applied to matching files

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of the changes
- [ ] Documentation updated if needed
- [ ] No breaking changes (or documented if necessary)

### PR Title Format

Use conventional commits format:
- `feat: Add new agent for X`
- `fix: Correct prompt template Y`
- `docs: Update contribution guidelines`
- `refactor: Simplify harness workflow`
- `chore: Update dependencies`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
How were these changes tested?

## Related Issues
Closes #123
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, maintainers will merge

## Style Guidelines

### Markdown Files

- Use ATX-style headers (`#`, `##`, `###`)
- Include blank lines before and after headers
- Use fenced code blocks with language identifiers
- Keep lines under 100 characters when possible

### Agent Definitions (`.agent.md`)

```markdown
---
name: AgentName
description: Clear, concise description
tools:
  - editFiles
  - search
---

# Agent Name

## Purpose
What this agent does

## Instructions
Step-by-step instructions

## Critical Rules
Important constraints
```

### Prompt Commands (`.prompt.md`)

```markdown
# /command.name - Brief Description

Full description of what this command does.

## Instructions

1. Step one
2. Step two

## Output

Expected output format
```

### Instructions (`.instructions.md`)

```markdown
---
applyTo: "glob/pattern/**/*.ts"
---

# Instructions Title

Context-specific instructions for matching files.
```

## Areas for Contribution

### High Priority

- 🧪 Additional testing patterns and examples
- 📝 Documentation improvements
- 🔧 New utility scripts
- 🌐 Internationalization support

### Feature Ideas

- New agent types for specific workflows
- Integration with additional MCP servers
- Enhanced progress tracking dashboards
- IDE-specific optimizations

### Good First Issues

Look for issues labeled `good first issue` for beginner-friendly contributions.

## Community

### Getting Help

- Open an issue for questions
- Check existing documentation
- Review closed issues for similar questions

### Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes for significant contributions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Agent Harness Framework! 🚀
