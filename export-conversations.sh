#!/usr/bin/env bash
# export-conversations.sh — Exporta el historial de conversaciones Claude
# a la unidad externa para poder importarlo en otro ordenador.
#
# Uso:
#   ./export-conversations.sh /media/usb/data4n6-setup
#   ./export-conversations.sh                            # exporta junto al script

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-$ROOT}"
CONVERSATIONS_DIR="$DEST/conversations"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
info() { echo -e "${CYAN}[→]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

# Buscar el directorio Claude de este proyecto
# Claude puede transformar el path de formas no triviales (p.ej. _ → -)
# así que buscamos el directorio que contenga los ficheros .jsonl del proyecto
find_claude_project_dir() {
  local projects_dir="$HOME/.claude/projects"
  [[ -d "$projects_dir" ]] || return 1

  # Primero intentar la conversión estándar (/ → -)
  local project_abs; project_abs="$(realpath "$ROOT")"
  local key; key="$(echo "$project_abs" | sed 's|/|-|g')"
  [[ -d "$projects_dir/$key" ]] && { echo "$projects_dir/$key"; return 0; }

  # Si no, probar también reemplazando _ por - (Claude hace esto a veces)
  local key2; key2="$(echo "$key" | tr '_' '-')"
  [[ -d "$projects_dir/$key2" ]] && { echo "$projects_dir/$key2"; return 0; }

  # Si tampoco, buscar el directorio que contenga .jsonl más reciente
  local best; best="$(find "$projects_dir" -maxdepth 2 -name "*.jsonl" -printf '%T@ %h\n' 2>/dev/null \
    | sort -rn | head -1 | awk '{print $2}')"
  [[ -n "$best" ]] && { echo "$best"; return 0; }

  return 1
}

CLAUDE_PROJ_DIR="$(find_claude_project_dir)" || { warn "No se encontró el directorio de proyecto Claude en $HOME/.claude/projects"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   data4n6 — Exportar historial Claude        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

if [[ ! -d "$CLAUDE_PROJ_DIR" ]]; then
  warn "No se encontró el directorio Claude: $CLAUDE_PROJ_DIR"
  exit 1
fi

JSONL_FILES=("$CLAUDE_PROJ_DIR"/*.jsonl)
if [[ ! -e "${JSONL_FILES[0]}" ]]; then
  warn "No hay ficheros de conversación en $CLAUDE_PROJ_DIR"
  exit 0
fi

mkdir -p "$CONVERSATIONS_DIR"

info "Exportando conversaciones a: $CONVERSATIONS_DIR"
echo ""

TOTAL_SIZE=0
COUNT=0
for f in "${JSONL_FILES[@]}"; do
  fname="$(basename "$f")"
  size=$(du -sh "$f" 2>/dev/null | cut -f1)
  cp "$f" "$CONVERSATIONS_DIR/$fname"
  echo "  $size  $fname"
  COUNT=$((COUNT + 1))
done

TOTAL=$(du -sh "$CONVERSATIONS_DIR" 2>/dev/null | cut -f1)
echo ""
ok "$COUNT conversaciones exportadas ($TOTAL total)"
echo ""
echo "  Directorio: $CONVERSATIONS_DIR"
echo ""
echo -e "  Ahora ejecuta ${CYAN}setup-dev.sh${NC} en el otro ordenador —"
echo -e "  detectará las conversaciones automáticamente."
echo ""
