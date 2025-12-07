#!/bin/bash
# setup-project.sh - Initialize a new project with the Harness framework
# Part of Agent Harness Framework

set -e

echo "🚀 Setting up Agent Harness Framework..."
echo ""

# Get project name
PROJECT_NAME="${1:-$(basename "$(pwd)")}"
echo "Project: $PROJECT_NAME"
echo ""

# Create directory structure
echo "📁 Creating directory structure..."

mkdir -p .github/agents
mkdir -p .github/prompts
mkdir -p .github/instructions
mkdir -p memory/state
mkdir -p memory/context
mkdir -p memory/sessions
mkdir -p specs
mkdir -p templates/commands
mkdir -p templates/docs
mkdir -p scripts/bash
mkdir -p scripts/powershell
mkdir -p .vscode

echo "✓ Directories created"

# Create VS Code settings
if [ ! -f .vscode/settings.json ]; then
    cat > .vscode/settings.json << 'EOF'
{
    "chat.promptFiles": true,
    "github.copilot.chat.codeGeneration.useInstructionFiles": true,
    "chat.commandCenter.enabled": true
}
EOF
    echo "✓ VS Code settings created"
fi

# Create basic constitution if not exists
if [ ! -f memory/constitution.md ]; then
    cat > memory/constitution.md << EOF
# $PROJECT_NAME Constitution

## Vision
{Define the project vision}

## Core Principles
1. Quality over speed - production-ready code
2. Incremental progress - one feature at a time
3. Documentation is mandatory - explain decisions
4. Test before commit - verify everything works

## Technical Standards
- **Language**: {primary language}
- **Framework**: {frameworks}
- **Style Guide**: {coding standards}

## Quality Gates
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Changes committed

## File Conventions
- Use descriptive names
- Follow language conventions
- Keep files focused and small

## Testing Strategy
{Define testing approach}

## Documentation Requirements
- README for new features
- Inline comments for complex logic
- API documentation for public interfaces
EOF
    echo "✓ Constitution template created"
fi

# Create empty feature list if not exists
if [ ! -f memory/feature_list.json ]; then
    cat > memory/feature_list.json << EOF
{
  "name": "$PROJECT_NAME",
  "description": "Feature list for $PROJECT_NAME",
  "version": "1.0.0",
  "features": []
}
EOF
    echo "✓ Feature list created"
fi

# Create progress notes if not exists
if [ ! -f memory/claude-progress.md ]; then
    cat > memory/claude-progress.md << EOF
# Progress Notes

## Current Status
- Features: 0/0 passing
- Last session: Not started

## Session History

### $(date +%Y-%m-%d) - Initial Setup
- Created project structure
- Ready for @Initializer or /speckit.constitution

## Next Steps
1. Define project constitution with /speckit.constitution
2. Create specifications with /speckit.specify
3. Generate plan with /speckit.plan
4. Create tasks with /speckit.tasks
5. Generate feature list with /harness.generate
6. Start implementation with @Coder

## Notes
{Add session notes here}
EOF
    echo "✓ Progress notes created"
fi

# Create init script
if [ ! -f init.sh ]; then
    cat > init.sh << 'EOF'
#!/bin/bash
# init.sh - Environment setup script
# Run this at the start of each session

echo "🔧 Initializing environment..."

# Add project-specific setup here:
# - Start servers
# - Install dependencies
# - Set environment variables

echo "✅ Environment ready"
EOF
    chmod +x init.sh
    echo "✓ init.sh created"
fi

# Initialize git if not already
if [ ! -d .git ]; then
    git init
    echo "✓ Git repository initialized"
fi

echo ""
echo "✅ Project setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit memory/constitution.md with your project principles"
echo "  2. Run /speckit.specify to create feature specifications"
echo "  3. Run /speckit.plan to create implementation plan"
echo "  4. Run /speckit.tasks to generate task list"
echo "  5. Run /harness.generate to create feature_list.json"
echo "  6. Use @Coder to implement features incrementally"
