#!/bin/bash
# new-session.sh - Start a new implementation session
# Part of Agent Harness Framework

set -e

echo "🔄 Starting new session..."
echo ""

# Check if we're in the right directory
if [ ! -f "memory/feature_list.json" ]; then
    echo "❌ Error: memory/feature_list.json not found"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

# Get current date for session log
SESSION_DATE=$(date +%Y-%m-%d-%H-%M)
SESSION_FILE="memory/sessions/${SESSION_DATE}.md"

# Show current progress
echo "📊 Current Progress:"
if command -v jq &> /dev/null; then
    TOTAL=$(jq '.features | length' memory/feature_list.json)
    PASSING=$(jq '[.features[] | select(.passes == true)] | length' memory/feature_list.json)
    echo "   Features: $PASSING/$TOTAL passing"
else
    echo "   (install jq for detailed stats)"
fi
echo ""

# Show recent git history
echo "📝 Recent commits:"
git log --oneline -5 2>/dev/null || echo "   (no git history)"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    echo ""
fi

# Run init script if it exists
if [ -f "init.sh" ]; then
    echo "🔧 Running init.sh..."
    ./init.sh
    echo ""
fi

# Create session log
cat > "$SESSION_FILE" << EOF
# Session Log: $(date +"%Y-%m-%d %H:%M")

## Session Goal
{Define what you want to accomplish}

## Starting State
- Features: {X/Y} passing
- Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
- Last commit: $(git log --oneline -1 2>/dev/null || echo "none")

## Accomplishments
- {To be filled during session}

## Commits Made
- {To be filled during session}

## Issues Encountered
- {To be filled during session}

## Session End State
- Features: {X/Y} passing
- Environment: {running/stopped}
- Uncommitted changes: {yes/no}

## Next Session Should
1. {First priority}
2. {Second priority}
EOF

echo "📄 Session log created: $SESSION_FILE"
echo ""
echo "✅ Ready for implementation!"
echo ""
echo "Quick reference:"
echo "  /harness.status     - View feature progress"
echo "  /harness.verify     - Verify passing features"
echo "  /speckit.implement  - Implement a feature"
echo "  /harness.checkpoint - Save progress before ending"
echo "  @Coder              - Full implementation mode"
