#!/usr/bin/env bash
# export-db.sh — Vuelca la base de datos de producción a un fichero SQL
# para poder importarla en el entorno Docker de otra máquina.
#
# Uso:
#   ./export-db.sh                     # guarda data4n6_dump.sql junto al script
#   ./export-db.sh /media/usb/setup    # guarda en la ruta indicada

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-$ROOT}"
DUMP_FILE="$DEST/data4n6_dump.sql"

DB_HOST="${DB_HOST:-192.168.0.16}"
DB_PORT="${DB_PORT:-5433}"
DB_USER="${DB_USER:-data4n6}"
DB_PASS="${DB_PASS:-data4n6}"
DB_NAME="${DB_NAME:-data4n6}"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
info() { echo -e "${CYAN}[→]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   data4n6 — Exportar base de datos           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

command -v pg_dump &>/dev/null || die "pg_dump no encontrado. Instala postgresql-client."

info "Conectando a $DB_HOST:$DB_PORT/$DB_NAME..."
nc -z -w3 "$DB_HOST" "$DB_PORT" 2>/dev/null || die "No se puede conectar a $DB_HOST:$DB_PORT"

info "Volcando base de datos (puede tardar un momento)..."
PGPASSWORD="$DB_PASS" pg_dump \
  -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner --no-acl \
  -f "$DUMP_FILE"

SIZE=$(du -sh "$DUMP_FILE" | cut -f1)
ok "Dump generado: $DUMP_FILE ($SIZE)"
echo ""
echo -e "  Copia este fichero a la unidad externa junto a ${CYAN}setup-dev.sh${NC}."
echo -e "  El script de setup lo importará automáticamente."
echo ""
