#!/bin/bash
# =============================================================================
# release.sh — TutioLMS Production Release Script
# EC2 Ubuntu · ap-south-1 (Mumbai)
#
# භාවිතය (Usage):
#   chmod +x release.sh   # එකවරක් පමණි (run once only)
#   ./release.sh
#
# මෙම script සෑම step එකක් fail වූ විට ස්වයංක්‍රීයව exit වේ.
# Build fail වූ විට PM2 restart නොවේ — live app protected.
# =============================================================================

set -e  # ඕනෑම command fail වූ විට script exit කරන්න

# ── වර්ණ codes (terminal output) ─────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Directories ───────────────────────────────────────────────────────────────
PROJECT_DIR="/home/ubuntu/lms"
BACKEND_DIR="$PROJECT_DIR/backend-reference"

# ── Helper functions ──────────────────────────────────────────────────────────
log()     { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✔ $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }
error()   { echo -e "${RED}✘ $1${NC}"; exit 1; }

# ── Trap: script fail වූ විට message පෙන්වන්න ──────────────────────────────
trap 'error "Release failed at the step above. Check the error and retry."' ERR

# =============================================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     TutioLMS — Production Release        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo -e "  Started at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ── Step 1: Project directory verify කරන්න ───────────────────────────────────
log "Project directory confirm කරමින්..."
[ -d "$PROJECT_DIR" ] || error "Project directory not found: $PROJECT_DIR"
[ -d "$BACKEND_DIR" ] || error "Backend directory not found: $BACKEND_DIR"
cd "$PROJECT_DIR"
success "Directory confirmed: $PROJECT_DIR"

# ── Step 2: GitHub සිට නවතම code pull කරන්න ─────────────────────────────────
log "GitHub සිට නවතම code pull කරමින් (git pull)..."
git reset --hard HEAD
git pull origin main
success "Code pulled successfully."

# ── Step 3: Frontend dependencies install කරන්න ──────────────────────────────
log "Frontend dependencies install කරමින් (npm install)..."
cd "$PROJECT_DIR"
npm install --prefer-offline --no-audit --no-fund
success "Frontend dependencies updated."

# ── Step 4: Backend dependencies install කරන්න ───────────────────────────────
log "Backend dependencies install කරමින් (npm install)..."
cd "$BACKEND_DIR"
npm install --prefer-offline --no-audit --no-fund
success "Backend dependencies updated."

# ── Step 5: Prisma client generate කරන්න ─────────────────────────────────────
log "Prisma client generate කරමින් (prisma generate)..."
cd "$PROJECT_DIR"
npx prisma generate
success "Prisma client generated."

# ── Step 6: Database migrations apply කරන්න ──────────────────────────────────
log "Database migrations apply කරමින් (prisma migrate deploy)..."
npx prisma migrate deploy
success "Database migrations applied."

# ── Step 7: Backend Prisma client generate කරන්න ─────────────────────────────
log "Backend Prisma client generate කරමින්..."
cd "$BACKEND_DIR"
npx prisma generate
success "Backend Prisma client generated."

# ── Step 8 (old 7): Backend build කරන්න (NestJS) ─────────────────────────────
log "Backend build කරමින් (NestJS — npm run build)..."
cd "$BACKEND_DIR"
npm run build
success "Backend build completed."

# ── Step 9: Frontend build කරන්න (Next.js) ────────────────────────────────────
log "Frontend build කරමින් (Next.js — npm run build)..."
cd "$PROJECT_DIR"
npm run build
success "Frontend build completed."

# ── Step 10: PM2 processes restart කරන්න (නැත්නම් start කරන්න) ──────────────
log "PM2 processes restart කරමින්..."
if pm2 describe tutiolms-backend > /dev/null 2>&1; then
  pm2 restart tutiolms-backend
else
  warn "tutiolms-backend process not found — starting fresh..."
  pm2 start "$BACKEND_DIR/dist/src/main.js" --name tutiolms-backend --cwd "$BACKEND_DIR"
fi
if pm2 describe tutiolms-frontend > /dev/null 2>&1; then
  pm2 restart tutiolms-frontend
else
  warn "tutiolms-frontend process not found — starting fresh..."
  pm2 start npm --name tutiolms-frontend --cwd "$PROJECT_DIR" -- start
fi
pm2 save
success "PM2 processes restarted."

# ── Step 11: Process status confirm කරන්න ────────────────────────────────────
log "Process status confirm කරමින්..."
pm2 list

# ── සාර්ථකයි! ────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✔  Release Deployed Successfully!      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo -e "  Finished at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
warn "Browser හරහා site verify කිරීමට අමතක නොකරන්න."
echo ""
