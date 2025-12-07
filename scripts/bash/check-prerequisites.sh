#!/bin/bash
# check-prerequisites.sh - Verify environment prerequisites
# Part of Agent Harness Framework

set -e

echo "🔍 Checking prerequisites for Agent Harness Framework..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} Git installed: $(git --version)"
else
    echo -e "${RED}✗${NC} Git not found - required for version control"
    ERRORS=$((ERRORS + 1))
fi

# Check VS Code
if command -v code &> /dev/null; then
    echo -e "${GREEN}✓${NC} VS Code CLI available"
else
    echo -e "${YELLOW}⚠${NC} VS Code CLI not in PATH (optional)"
fi

# Check Node.js (optional, for JS/TS projects)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js installed: $(node --version)"
else
    echo -e "${YELLOW}⚠${NC} Node.js not found (optional, needed for JS/TS projects)"
fi

# Check Python (optional, for Python projects)
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python installed: $(python3 --version)"
elif command -v python &> /dev/null; then
    echo -e "${GREEN}✓${NC} Python installed: $(python --version)"
else
    echo -e "${YELLOW}⚠${NC} Python not found (optional, needed for Python projects)"
fi

echo ""

# Check required directories
echo "📁 Checking directory structure..."

REQUIRED_DIRS=(
    ".github/agents"
    ".github/prompts"
    ".github/instructions"
    "memory"
    "memory/state"
    "memory/context"
    "memory/sessions"
    "specs"
    "templates"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${RED}✗${NC} $dir - missing"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Check required files
echo "📄 Checking required files..."

REQUIRED_FILES=(
    "memory/constitution.md"
    ".github/agents/initializer.agent.md"
    ".github/agents/coder.agent.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${YELLOW}⚠${NC} $file - not found (will be created by framework)"
    fi
done

echo ""

# Summary
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All prerequisites met!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run @Initializer to set up your project"
    echo "  2. Or use /speckit.constitution to create project principles"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS issues that need attention${NC}"
    exit 1
fi
