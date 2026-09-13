#!/usr/bin/env bash
#
# OmniAudit-GEO — Instant Automated One-Liner Installer
# Adobe University Hackathon 2026 (Round 3 CRP)
#
# Usage (Direct via curl — No git required!):
#   curl -fsSL https://raw.githubusercontent.com/SH20RAJ/adobe-hackathon-2026/main/install.sh | bash
#
# Or from a cloned repository:
#   ./install.sh
#

set -e

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
DIM="\033[2m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║             OmniAudit-GEO — Instant CLI & Skill Installer             ║"
echo "║             Adobe University Hackathon 2026 (Round 3 CRP)             ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${RESET}"

# 1. Check Python installation (>= 3.10)
PYTHON_BIN=""
for cmd in python3 python; do
  if command -v "$cmd" >/dev/null 2>&1; then
    PY_MAJOR=$($cmd -c 'import sys; print(sys.version_info.major)' 2>/dev/null || echo 0)
    PY_MINOR=$($cmd -c 'import sys; print(sys.version_info.minor)' 2>/dev/null || echo 0)
    if [ "$PY_MAJOR" -ge 3 ] && [ "$PY_MINOR" -ge 10 ]; then
      PYTHON_BIN="$cmd"
      PY_VER=$($cmd -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
      break
    fi
  fi
done

if [ -z "$PYTHON_BIN" ]; then
  echo -e "${RED}❌ Error: Python 3.10 or higher is required.${RESET}"
  echo "Please install Python 3.10+ from https://www.python.org/ or via your package manager."
  exit 1
fi

echo -e "✓ Python runtime: ${BOLD}$PYTHON_BIN ($PY_VER)${RESET}"

# 2. Determine source repository location (Local clone vs. Remote curl download)
SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/cli.py" ] && [ -d "$SCRIPT_DIR/skills" ]; then
  INSTALL_ROOT="$SCRIPT_DIR"
  echo -e "✓ Using local repository directory: ${CYAN}$INSTALL_ROOT${RESET}"
elif [ -f "./cli.py" ] && [ -d "./skills" ]; then
  INSTALL_ROOT="$(pwd)"
  echo -e "✓ Using current working directory: ${CYAN}$INSTALL_ROOT${RESET}"
else
  INSTALL_ROOT="$HOME/.local/share/omniaudit-geo"
  echo -e "\n${BOLD}⬇️  Fetching OmniAudit-GEO repository archive from GitHub...${RESET}"
  echo -e "${DIM}Downloading skills, MCP server, and CLI runtime directly via Python stdlib...${RESET}"
  
  "$PYTHON_BIN" -c "
import urllib.request, zipfile, io, shutil, sys
from pathlib import Path

dest = Path('$INSTALL_ROOT')
dest.mkdir(parents=True, exist_ok=True)
url = 'https://github.com/SH20RAJ/adobe-hackathon-2026/archive/refs/heads/main.zip'

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'OmniAudit-Installer'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        for member in zf.infolist():
            parts = Path(member.filename).parts
            if len(parts) > 1:
                target = dest / Path(*parts[1:])
                if member.is_dir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with zf.open(member) as src, open(target, 'wb') as dst:
                        shutil.copyfileobj(src, dst)
    print('✓ Successfully unpacked OmniAudit-GEO into: ' + str(dest))
except Exception as e:
    print(f'❌ Download failed: {e}', file=sys.stderr)
    sys.exit(1)
"
fi

cd "$INSTALL_ROOT"

# 3. Configure package and console commands
echo -e "\n${BOLD}📦 Configuring 'omniaudit' and 'omni' CLI commands...${RESET}"

USER_BIN_DIR="$HOME/.local/bin"
mkdir -p "$USER_BIN_DIR"

# Attempt pip install in current virtualenv or user space
if [ -n "$VIRTUAL_ENV" ]; then
  "$PYTHON_BIN" -m pip install -e "$INSTALL_ROOT" --quiet 2>/dev/null || true
else
  "$PYTHON_BIN" -m pip install -e "$INSTALL_ROOT" --user --break-system-packages --quiet 2>/dev/null || \
  "$PYTHON_BIN" -m pip install -e "$INSTALL_ROOT" --user --quiet 2>/dev/null || true
fi

# Always guarantee direct zero-dependency executable symlinks
ln -sf "$INSTALL_ROOT/cli.py" "$USER_BIN_DIR/omniaudit"
ln -sf "$INSTALL_ROOT/cli.py" "$USER_BIN_DIR/omni"
chmod +x "$INSTALL_ROOT/cli.py" "$USER_BIN_DIR/omniaudit" "$USER_BIN_DIR/omni" 2>/dev/null || true

echo -e "✓ Executables linked: ${CYAN}$USER_BIN_DIR/omniaudit${RESET} and ${CYAN}$USER_BIN_DIR/omni${RESET}"

# 4. PATH Verification
PATH_WARNING=false
case ":$PATH:" in
  *":$USER_BIN_DIR:"*) ;;
  *)
    PATH_WARNING=true
    echo -e "\n${YELLOW}⚠️  Notice: $USER_BIN_DIR is not currently in your system PATH.${RESET}"
    echo -e "To run 'omni' from any terminal, add this to your shell config (~/.zshrc or ~/.bashrc):"
    echo -e "  ${BOLD}export PATH=\"\$HOME/.local/bin:\$PATH\"${RESET}"
    ;;
esac

# 5. Verify CLI Execution
echo -e "\n${BOLD}🔍 Verifying CLI execution...${RESET}"
if command -v omniaudit >/dev/null 2>&1; then
  EXEC_CMD="omniaudit"
elif command -v omni >/dev/null 2>&1; then
  EXEC_CMD="omni"
elif [ -x "$USER_BIN_DIR/omni" ]; then
  EXEC_CMD="$USER_BIN_DIR/omni"
else
  EXEC_CMD="$INSTALL_ROOT/cli.py"
fi

$EXEC_CMD --help >/dev/null
echo -e "${GREEN}✓ CLI execution verified successfully!${RESET}"

echo -e "\n${BOLD}═══════════════════════════════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}🎉 OmniAudit-GEO is Installed and Ready!${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════════════════════════════${RESET}"
echo -e "Quickstart commands:"
echo -e "  • Immediate site audit     : ${BOLD}$EXEC_CMD --url https://example.com${RESET}"
echo -e "  • Specialist crawl audit   : ${BOLD}$EXEC_CMD specialist crawl --url https://example.com${RESET}"
echo -e "  • Specialist entity audit  : ${BOLD}$EXEC_CMD specialist structured --url https://example.com${RESET}"
echo -e "  • Specialist AEO audit     : ${BOLD}$EXEC_CMD specialist aeo --url https://example.com${RESET}"
echo -e "  • Launch local Web UI      : ${BOLD}$EXEC_CMD serve --port 8000${RESET}"
echo -e "  • Model Context Protocol   : ${BOLD}$EXEC_CMD mcp --test${RESET}"
echo -e "  • 6-Gate verification loop : ${BOLD}$EXEC_CMD verify --ci${RESET}"
echo -e "  • 16 Golden Benchmarks     : ${BOLD}$EXEC_CMD benchmark${RESET}\n"

if [ "$PATH_WARNING" = true ]; then
  echo -e "${YELLOW}Tip: Export ~/.local/bin to run '$EXEC_CMD' without path prefix:${RESET}"
  echo -e "  ${BOLD}export PATH=\"\$HOME/.local/bin:\$PATH\"${RESET}\n"
fi

echo -e "Detailed guide: ${CYAN}docs/USAGE_GUIDE.md${RESET}\n"
