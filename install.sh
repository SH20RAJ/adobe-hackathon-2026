#!/usr/bin/env bash
#
# OmniAudit-GEO — Instant Local Installation Script
# Adobe University Hackathon 2026 (Round 3 CRP)
#
# Usage:
#   ./install.sh
#   or:
#   curl -fsSL https://raw.githubusercontent.com/SH20RAJ/adobe-hackathon-2026/main/install.sh | bash
#

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║             OmniAudit-GEO — Instant CLI & Skill Installer             ║"
echo "║             Adobe University Hackathon 2026 (Round 3 CRP)             ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# 1. Check Python installation
PYTHON_BIN=""
for cmd in python3 python; do
  if command -v "$cmd" >/dev/null 2>&1; then
    PY_VER=$($cmd -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
    PY_MAJOR=$($cmd -c 'import sys; print(sys.version_info.major)')
    PY_MINOR=$($cmd -c 'import sys; print(sys.version_info.minor)')
    if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 10 ]; then
      PYTHON_BIN="$cmd"
      break
    fi
  fi
done

if [ -z "$PYTHON_BIN" ]; then
  echo -e "${RED}❌ Error: Python 3.10 or higher is required.${RESET}"
  echo "Please install Python 3.10+ from https://www.python.org/ or via your package manager."
  exit 1
fi

echo -e "✓ Found Python: ${BOLD}$PYTHON_BIN ($PY_VER)${RESET}"

# 2. Determine repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 3. Install CLI package or create direct symlinks
echo -e "\n${BOLD}📦 Configuring 'omniaudit' and 'omni' CLI commands...${RESET}"

USER_BIN_DIR="$HOME/.local/bin"
mkdir -p "$USER_BIN_DIR"

INSTALL_SUCCESS=false

if [ -n "$VIRTUAL_ENV" ]; then
  echo -e "Detected active virtual environment: ${CYAN}$VIRTUAL_ENV${RESET}"
  if "$PYTHON_BIN" -m pip install -e . --quiet 2>/dev/null; then
    INSTALL_SUCCESS=true
  fi
else
  # Try pip install with break-system-packages fallback for Homebrew / Debian
  if "$PYTHON_BIN" -m pip install -e . --user --break-system-packages --quiet 2>/dev/null; then
    INSTALL_SUCCESS=true
  elif "$PYTHON_BIN" -m pip install -e . --user --quiet 2>/dev/null; then
    INSTALL_SUCCESS=true
  fi
fi

# Always ensure direct symlinks exist in ~/.local/bin as a zero-dependency guarantee
ln -sf "$SCRIPT_DIR/cli.py" "$USER_BIN_DIR/omniaudit"
ln -sf "$SCRIPT_DIR/cli.py" "$USER_BIN_DIR/omni"
chmod +x "$SCRIPT_DIR/cli.py"
chmod +x "$USER_BIN_DIR/omniaudit" "$USER_BIN_DIR/omni" 2>/dev/null || true

echo -e "✓ Installed executables to: ${CYAN}$USER_BIN_DIR/omniaudit${RESET} and ${CYAN}$USER_BIN_DIR/omni${RESET}"

case ":$PATH:" in
  *":$USER_BIN_DIR:"*) ;;
  *)
    echo -e "${YELLOW}⚠️  Notice: $USER_BIN_DIR is not currently in your system PATH.${RESET}"
    echo -e "To run 'omni' from anywhere, append this to your ~/.zshrc or ~/.bashrc:"
    echo -e "  ${BOLD}export PATH=\"\$HOME/.local/bin:\$PATH\"${RESET}\n"
    ;;
esac

# 5. Verify CLI Execution
echo -e "\n${BOLD}🔍 Verifying CLI installation...${RESET}"
if command -v omniaudit >/dev/null 2>&1; then
  EXEC_CMD="omniaudit"
elif command -v omni >/dev/null 2>&1; then
  EXEC_CMD="omni"
else
  EXEC_CMD="$SCRIPT_DIR/cli.py"
fi

$EXEC_CMD --help >/dev/null

echo -e "${GREEN}✓ CLI Verified Successfully!${RESET}\n"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}🎉 OmniAudit-GEO is Ready to Use!${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════${RESET}"
echo -e "Quickstart commands:"
echo -e "  • Immediate site audit     : ${BOLD}$EXEC_CMD --url https://example.com${RESET}"
echo -e "  • Specialist crawl audit   : ${BOLD}$EXEC_CMD specialist crawl --url https://example.com${RESET}"
echo -e "  • Launch local Web UI      : ${BOLD}$EXEC_CMD serve --port 8000${RESET}"
echo -e "  • Model Context Protocol   : ${BOLD}$EXEC_CMD mcp --test${RESET}"
echo -e "  • Run 6-gate verification  : ${BOLD}$EXEC_CMD verify --ci${RESET}"
echo -e "  • 16 Golden Benchmarks     : ${BOLD}$EXEC_CMD benchmark${RESET}\n"
echo -e "For full documentation, see: ${CYAN}docs/USAGE_GUIDE.md${RESET}\n"
