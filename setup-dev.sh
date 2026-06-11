#!/usr/bin/env bash
# setup-dev.sh — Configura el entorno de desarrollo data4n6 en una máquina nueva
# Ejecutar desde una unidad externa. No requiere nada instalado salvo git y Docker.
#
# Uso:
#   ./setup-dev.sh                          # clona en ~/dev/data4n6
#   ./setup-dev.sh /ruta/destino            # clona en la ruta indicada
#   REPO_URL=https://... ./setup-dev.sh     # usa otro repositorio

set -euo pipefail

# ── Configuración ─────────────────────────────────────────────────────────────
REPO_URL="${REPO_URL:-https://github.com/RobertoBlasco/data4n6_v2.git}"
DEST_DIR="${1:-$HOME/dev/data4n6}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()   { echo -e "${CYAN}[→]${NC} $*"; }
ok()     { echo -e "${GREEN}[✓]${NC} $*"; }
warn()   { echo -e "${YELLOW}[!]${NC} $*"; }
die()    { echo -e "${RED}[✗]${NC} $*"; exit 1; }
header() { echo ""; echo -e "${BOLD}${CYAN}── $* ──────────────────────────────────────────${NC}"; echo ""; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   data4n6 — Setup entorno de desarrollo      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Repo:    ${CYAN}$REPO_URL${NC}"
echo -e "  Destino: ${CYAN}$DEST_DIR${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────
# 1. PREREQUISITOS
# ─────────────────────────────────────────────────────────────────────────────
header "1. Verificando prerequisitos"

# Git
command -v git &>/dev/null || die "git no encontrado. Instala git primero."
ok "git $(git --version | awk '{print $3}')"

# Docker
command -v docker &>/dev/null || die "Docker no encontrado. Instálalo desde: https://docs.docker.com/get-docker/"
docker info &>/dev/null       || die "Docker no está corriendo. Arranca el daemon Docker primero."
ok "Docker $(docker --version | awk '{print $3}' | tr -d ',')"

# Java 21+
command -v java &>/dev/null || die "Java 21 no encontrado.
  Ubuntu/Debian:  sudo apt install openjdk-21-jdk
  SDKMAN:         sdk install java 21-tem  (https://sdkman.io)"
JAVA_VER=$(java -version 2>&1 | grep -oP '(?<=version ")[0-9]+' | head -1)
[[ "${JAVA_VER:-0}" -ge 21 ]] || die "Se requiere Java 21+. Versión detectada: ${JAVA_VER:-?}.
  Instala la versión correcta o usa SDKMAN."
ok "Java $JAVA_VER"

# Maven
command -v mvn &>/dev/null || die "Maven no encontrado.
  Ubuntu/Debian:  sudo apt install maven
  SDKMAN:         sdk install maven"
ok "Maven $(mvn --version 2>&1 | head -1 | awk '{print $3}')"

# Node.js — busca en varias ubicaciones
NODE_CMD=""
for candidate in \
    "$(command -v node 2>/dev/null || true)" \
    "/opt/plesk/node/24/bin/node" \
    "/opt/plesk/node/22/bin/node" \
    "/usr/local/bin/node" \
    "$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node/" 2>/dev/null | sort -V | tail -1)/bin/node"; do
  [[ -n "$candidate" && -x "$candidate" ]] && { NODE_CMD="$candidate"; break; }
done

[[ -n "$NODE_CMD" ]] || die "Node.js no encontrado.
  Instala con nvm:    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
                      nvm install 22
  O directamente:     https://nodejs.org"

NODE_VER=$("$NODE_CMD" --version 2>&1 | tr -d 'v' | cut -d. -f1)
[[ "${NODE_VER:-0}" -ge 18 ]] || die "Node.js 18+ requerido. Versión detectada: v$NODE_VER"
NODE_BIN_DIR="$(dirname "$NODE_CMD")"
ok "Node.js v$NODE_VER  ($NODE_BIN_DIR)"

# ─────────────────────────────────────────────────────────────────────────────
# 2. CLONAR REPOSITORIO
# ─────────────────────────────────────────────────────────────────────────────
header "2. Repositorio"

if [[ -d "$DEST_DIR/.git" ]]; then
  ok "Repo ya existe en $DEST_DIR — actualizando (git pull)..."
  git -C "$DEST_DIR" pull --ff-only
else
  info "Clonando $REPO_URL → $DEST_DIR ..."
  mkdir -p "$(dirname "$DEST_DIR")"
  git clone "$REPO_URL" "$DEST_DIR"
  ok "Repo clonado"
fi

ROOT="$DEST_DIR"
BACKEND="$ROOT/data4n6-backend"
FRONTEND="$ROOT/data4n6-frontend"

# ─────────────────────────────────────────────────────────────────────────────
# 3. CONTENEDORES DOCKER
# ─────────────────────────────────────────────────────────────────────────────
header "3. Arrancando contenedores Docker"

cd "$BACKEND"
info "Levantando PostgreSQL y MinIO..."
docker compose up -d postgres minio

info "Esperando a que PostgreSQL esté disponible..."
for i in $(seq 1 30); do
  docker compose exec -T postgres pg_isready -U data4n6 &>/dev/null && { ok "PostgreSQL listo (${i}s)"; break; }
  sleep 1
  [[ $i -eq 30 ]] && die "PostgreSQL no arrancó. Revisa: docker compose logs postgres"
done

ok "MinIO listo → API: localhost:9000  Consola: http://localhost:9001  (data4n6 / data4n6secret)"

# Crear bucket
sleep 2
docker compose exec -T minio mc alias set local http://localhost:9000 data4n6 data4n6secret &>/dev/null 2>&1 && \
  docker compose exec -T minio mc mb --ignore-existing local/data4n6 &>/dev/null 2>&1 && \
  ok "Bucket MinIO 'data4n6' listo" || \
  warn "No se pudo configurar el bucket automáticamente. Créalo en http://localhost:9001"

# ─────────────────────────────────────────────────────────────────────────────
# 4. CONFIGURACIÓN LOCAL DEL BACKEND
# ─────────────────────────────────────────────────────────────────────────────
header "4. Configuración local"

# application-local.properties — apunta a Docker local
LOCAL_PROPS="$BACKEND/src/main/resources/application-local.properties"
if [[ ! -f "$LOCAL_PROPS" ]]; then
  cat > "$LOCAL_PROPS" << 'PROPS'
# Overrides para entorno de desarrollo local con Docker
# NO commitear este archivo
spring.datasource.url=jdbc:postgresql://localhost:5432/data4n6
minio.endpoint=http://localhost:9000
PROPS
  ok "Creado application-local.properties"
fi

# Ficheros de configuración para restart.sh
echo "local"         > "$ROOT/.spring-profile"
echo "$NODE_BIN_DIR" > "$ROOT/.node-bin-dir"
ok "restart.sh configurado (spring profile: local, node: $NODE_BIN_DIR)"

# .gitignore — asegura que no se commiteen los ficheros locales
GITIGNORE="$ROOT/.gitignore"
[[ ! -f "$GITIGNORE" ]] && touch "$GITIGNORE"
for entry in ".node-bin-dir" ".spring-profile"; do
  grep -qxF "$entry" "$GITIGNORE" || echo "$entry" >> "$GITIGNORE"
done
BACKEND_GITIGNORE="$BACKEND/.gitignore"
[[ -f "$BACKEND_GITIGNORE" ]] && ! grep -q "application-local.properties" "$BACKEND_GITIGNORE" && \
  echo "application-local.properties" >> "$BACKEND_GITIGNORE"

# ─────────────────────────────────────────────────────────────────────────────
# 5. DEPENDENCIAS FRONTEND
# ─────────────────────────────────────────────────────────────────────────────
header "5. Instalando dependencias frontend (npm install)"

cd "$FRONTEND"
if [[ ! -d "node_modules" ]]; then
  info "npm install — puede tardar 1-2 minutos..."
  PATH="$NODE_BIN_DIR:$PATH" npm install
  ok "npm install completado"
else
  ok "node_modules ya existe (saltando)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. COMPILAR JAR DEL BACKEND
# ─────────────────────────────────────────────────────────────────────────────
header "6. Compilando backend (mvn package)"

cd "$BACKEND"
JAR="$BACKEND/target/data4n6-backend-0.0.1-SNAPSHOT.jar"
if [[ ! -f "$JAR" ]]; then
  info "Primera compilación — puede tardar 5-15 minutos..."
  mvn package -DskipTests -q
  ok "JAR generado: $(ls -lh "$JAR" | awk '{print $5}')"
else
  ok "JAR ya existe — usa 'cd data4n6-backend && mvn package -DskipTests -q' para recompilar"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. CONTEXTO CLAUDE CODE
# ─────────────────────────────────────────────────────────────────────────────
header "7. Instalando contexto Claude Code"

MEMORY_SOURCE="$ROOT/setup/claude-memory"
if [[ -d "$MEMORY_SOURCE" ]]; then
  # Claude deriva el nombre del directorio de la ruta absoluta del proyecto
  CLAUDE_PROJ_KEY="$(echo "$ROOT" | sed 's|/|-|g')"
  CLAUDE_MEM_DIR="$HOME/.claude/projects/$CLAUDE_PROJ_KEY/memory"
  mkdir -p "$CLAUDE_MEM_DIR"
  cp -r "$MEMORY_SOURCE/." "$CLAUDE_MEM_DIR/"
  ok "Contexto Claude instalado ($(ls "$CLAUDE_MEM_DIR" | wc -l) archivos)"
  echo "   Directorio: $CLAUDE_MEM_DIR"
else
  warn "No se encontraron archivos de memoria — saltando"
fi

# ─────────────────────────────────────────────────────────────────────────────
# LISTO
# ─────────────────────────────────────────────────────────────────────────────
cd "$ROOT"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓  Entorno listo                           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Proyecto:${NC}  $ROOT"
echo ""
echo -e "  ${BOLD}Infraestructura:${NC}"
echo -e "    PostgreSQL → localhost:5432  (data4n6 / data4n6)"
echo -e "    MinIO API  → localhost:9000  (data4n6 / data4n6secret)"
echo -e "    MinIO UI   → ${CYAN}http://localhost:9001${NC}"
echo ""
echo -e "  ${BOLD}Arrancar la app:${NC}"
echo -e "    ${CYAN}cd $ROOT && ./restart.sh${NC}"
echo ""
echo -e "  ${BOLD}Abrir Claude Code:${NC}"
echo -e "    ${CYAN}cd $ROOT && claude${NC}"
echo -e "    El historial de conversaciones ya está cargado."
echo ""
