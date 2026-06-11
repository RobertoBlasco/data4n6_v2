#!/usr/bin/env bash
# setup-dev.sh — Configura el entorno de desarrollo data4n6 en una máquina nueva
# Ejecutar desde una unidad externa. Instala Docker, Java, Maven y Node si faltan.
#
# Uso:
#   ./setup-dev.sh                          # clona en ~/dev/data4n6
#   ./setup-dev.sh /ruta/destino            # clona en la ruta indicada
#   REPO_URL=https://... ./setup-dev.sh     # usa otro repositorio
#
# Para incluir historial de conversaciones, ejecuta primero en el ordenador origen:
#   ./export-conversations.sh

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/RobertoBlasco/data4n6_v2.git}"
DEST_DIR="${1:-$HOME/dev/data4n6}"

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

# Detectar OS
OS="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if command -v apt-get &>/dev/null; then OS="debian"
  elif command -v dnf &>/dev/null;    then OS="fedora"
  elif command -v yum &>/dev/null;    then OS="rhel"
  fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
  OS="macos"
fi
info "Sistema operativo detectado: $OS"

# ─────────────────────────────────────────────────────────────────────────────
# 1. GIT (único prerequisito mínimo)
# ─────────────────────────────────────────────────────────────────────────────
header "1. Git"

if ! command -v git &>/dev/null; then
  info "Instalando git..."
  case "$OS" in
    debian) sudo apt-get install -y git ;;
    fedora) sudo dnf install -y git ;;
    rhel)   sudo yum install -y git ;;
    macos)  xcode-select --install 2>/dev/null || true ;;
    *)      die "No sé cómo instalar git en este sistema. Instálalo manualmente." ;;
  esac
fi
ok "git $(git --version | awk '{print $3}')"

# ─────────────────────────────────────────────────────────────────────────────
# 2. DOCKER ENGINE
# ─────────────────────────────────────────────────────────────────────────────
header "2. Docker"

install_docker_debian() {
  info "Instalando Docker Engine (método oficial Docker Inc.)..."
  sudo apt-get update -q
  sudo apt-get install -y ca-certificates curl gnupg lsb-release
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -q
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  # Añadir usuario al grupo docker para no necesitar sudo
  sudo usermod -aG docker "$USER"
  warn "Añadido $USER al grupo 'docker'. Puede que necesites cerrar sesión y volver a entrar."
  # Intentar activar sin relogin usando newgrp en subshell
  sudo systemctl enable --now docker
}

install_docker_fedora() {
  info "Instalando Docker Engine en Fedora/RHEL..."
  sudo dnf install -y dnf-plugins-core
  sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
  sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
  warn "Añadido $USER al grupo 'docker'. Puede que necesites cerrar sesión y volver a entrar."
}

install_docker_macos() {
  if command -v brew &>/dev/null; then
    info "Instalando Docker Desktop via Homebrew..."
    brew install --cask docker
    info "Abre Docker Desktop manualmente para completar la instalación."
    read -r -p "Pulsa ENTER cuando Docker Desktop esté corriendo..."
  else
    die "Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/"
  fi
}

if ! command -v docker &>/dev/null; then
  case "$OS" in
    debian) install_docker_debian ;;
    fedora|rhel) install_docker_fedora ;;
    macos)  install_docker_macos ;;
    *)      die "No sé cómo instalar Docker en este sistema. Instálalo desde: https://docs.docker.com/get-docker/" ;;
  esac
fi

# Arrancar daemon si no está corriendo
if ! docker info &>/dev/null; then
  info "Arrancando daemon Docker..."
  if [[ "$OS" == "macos" ]]; then
    open -a Docker
    info "Esperando a que Docker Desktop arranque (hasta 60s)..."
    for i in $(seq 1 60); do
      docker info &>/dev/null && break
      sleep 1
      [[ $i -eq 60 ]] && die "Docker no arrancó. Ábrelo manualmente."
    done
  else
    sudo systemctl start docker
    sleep 2
    # Reintentar como el usuario actual (puede necesitar newgrp)
    docker info &>/dev/null || sudo docker info &>/dev/null || \
      die "Docker no responde. Prueba a cerrar sesión y volver a entrar (cambio de grupo)."
  fi
fi

DOCKER_CMD="docker"
docker info &>/dev/null || DOCKER_CMD="sudo docker"

ok "Docker $($DOCKER_CMD --version | awk '{print $3}' | tr -d ',')"

# ─────────────────────────────────────────────────────────────────────────────
# 3. JAVA 21
# ─────────────────────────────────────────────────────────────────────────────
header "3. Java 21"

install_java_debian() {
  sudo apt-get install -y openjdk-21-jdk
}

install_java_fedora() {
  sudo dnf install -y java-21-openjdk-devel
}

install_java_macos() {
  if command -v brew &>/dev/null; then
    brew install openjdk@21
    sudo ln -sfn "$(brew --prefix openjdk@21)/libexec/openjdk.jdk" /Library/Java/JavaVirtualMachines/openjdk-21.jdk 2>/dev/null || true
  else
    die "Instala Java 21 desde: https://adoptium.net"
  fi
}

JAVA_VER=0
if command -v java &>/dev/null; then
  JAVA_VER=$(java -version 2>&1 | grep -oP '(?<=version ")[0-9]+' | head -1 || echo 0)
fi

if [[ "${JAVA_VER:-0}" -lt 21 ]]; then
  info "Java 21 no encontrado (versión actual: ${JAVA_VER:-ninguna}). Instalando..."
  case "$OS" in
    debian)      install_java_debian ;;
    fedora|rhel) install_java_fedora ;;
    macos)       install_java_macos ;;
    *)           die "Instala Java 21 manualmente desde: https://adoptium.net" ;;
  esac
  JAVA_VER=$(java -version 2>&1 | grep -oP '(?<=version ")[0-9]+' | head -1)
fi

[[ "${JAVA_VER:-0}" -ge 21 ]] || die "Java 21+ requerido pero la versión activa es ${JAVA_VER}. Puede haber varias versiones instaladas — configura JAVA_HOME."
ok "Java $JAVA_VER"

# ─────────────────────────────────────────────────────────────────────────────
# 4. MAVEN
# ─────────────────────────────────────────────────────────────────────────────
header "4. Maven"

if ! command -v mvn &>/dev/null; then
  info "Instalando Maven..."
  case "$OS" in
    debian)      sudo apt-get install -y maven ;;
    fedora|rhel) sudo dnf install -y maven ;;
    macos)       command -v brew &>/dev/null && brew install maven || die "Instala Maven desde: https://maven.apache.org" ;;
    *)           die "Instala Maven manualmente desde: https://maven.apache.org" ;;
  esac
fi
ok "Maven $(mvn --version 2>&1 | head -1 | awk '{print $3}')"

# ─────────────────────────────────────────────────────────────────────────────
# 5. NODE.JS
# ─────────────────────────────────────────────────────────────────────────────
header "5. Node.js"

install_node_nvm() {
  info "Instalando nvm + Node.js 22..."
  export NVM_DIR="$HOME/.nvm"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
  # Cargar nvm en esta sesión
  # shellcheck source=/dev/null
  [[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm use 22
  nvm alias default 22
}

# Buscar node en ubicaciones comunes
NODE_CMD=""
# Cargar nvm si está disponible pero node no está en PATH
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
fi

for candidate in \
    "$(command -v node 2>/dev/null || true)" \
    "/opt/plesk/node/24/bin/node" \
    "/opt/plesk/node/22/bin/node" \
    "/usr/local/bin/node" \
    "$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node/" 2>/dev/null | sort -V | tail -1 || true)/bin/node"; do
  [[ -n "$candidate" && -x "$candidate" ]] && { NODE_CMD="$candidate"; break; }
done

if [[ -z "$NODE_CMD" ]]; then
  info "Node.js no encontrado. Instalando via nvm..."
  install_node_nvm
  NODE_CMD="$(command -v node)"
fi

NODE_VER=$("$NODE_CMD" --version 2>&1 | tr -d 'v' | cut -d. -f1)
if [[ "${NODE_VER:-0}" -lt 18 ]]; then
  info "Node.js v$NODE_VER es demasiado antiguo. Instalando v22 via nvm..."
  install_node_nvm
  NODE_CMD="$(command -v node)"
  NODE_VER=$("$NODE_CMD" --version 2>&1 | tr -d 'v' | cut -d. -f1)
fi

NODE_BIN_DIR="$(dirname "$NODE_CMD")"
ok "Node.js v$NODE_VER  ($NODE_BIN_DIR)"

# ─────────────────────────────────────────────────────────────────────────────
# 6. CLONAR REPOSITORIO
# ─────────────────────────────────────────────────────────────────────────────
header "6. Repositorio"

if [[ -d "$DEST_DIR/.git" ]]; then
  info "Repo ya existe en $DEST_DIR — actualizando..."
  # Si hay cambios locales, guardarlos antes del pull
  if ! git -C "$DEST_DIR" diff --quiet || ! git -C "$DEST_DIR" diff --cached --quiet; then
    info "Cambios locales detectados — guardando con stash..."
    git -C "$DEST_DIR" stash push -m "setup-dev stash antes de pull"
    git -C "$DEST_DIR" pull --ff-only
    git -C "$DEST_DIR" stash pop || warn "Revisa posibles conflictos tras el stash pop"
  else
    git -C "$DEST_DIR" pull --ff-only || ok "Ya estaba actualizado"
  fi
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
# 7. CONTENEDORES DOCKER — descargar imágenes y arrancar
# ─────────────────────────────────────────────────────────────────────────────
header "7. Contenedores Docker (PostgreSQL + MinIO)"

cd "$BACKEND"

info "Descargando imágenes Docker (puede tardar según la conexión)..."
$DOCKER_CMD compose pull postgres minio

info "Arrancando contenedores..."
$DOCKER_CMD compose up -d postgres minio

info "Esperando a que PostgreSQL esté disponible..."
for i in $(seq 1 60); do
  $DOCKER_CMD compose exec -T postgres pg_isready -U data4n6 &>/dev/null && { ok "PostgreSQL listo (${i}s)"; break; }
  sleep 1
  [[ $i -eq 60 ]] && die "PostgreSQL no arrancó en 60s. Revisa: $DOCKER_CMD compose logs postgres"
done

info "Esperando a que MinIO esté disponible..."
for i in $(seq 1 30); do
  $DOCKER_CMD compose exec -T minio mc ready local &>/dev/null 2>&1 && { ok "MinIO listo (${i}s)"; break; }
  sleep 1
  [[ $i -eq 30 ]] && warn "MinIO tardó más de lo esperado — continuando de todas formas"
done

# Crear bucket data4n6
info "Configurando bucket MinIO 'data4n6'..."
$DOCKER_CMD compose exec -T minio mc alias set local http://localhost:9000 data4n6 data4n6secret &>/dev/null 2>&1 && \
  $DOCKER_CMD compose exec -T minio mc mb --ignore-existing local/data4n6 &>/dev/null 2>&1 && \
  ok "Bucket 'data4n6' creado" || \
  warn "No se pudo configurar el bucket. Créalo en http://localhost:9001 (data4n6 / data4n6secret)"

# ─────────────────────────────────────────────────────────────────────────────
# 8. CONFIGURACIÓN LOCAL DEL BACKEND
# ─────────────────────────────────────────────────────────────────────────────
header "8. Configuración local del backend"

LOCAL_PROPS="$BACKEND/src/main/resources/application-local.properties"
if [[ ! -f "$LOCAL_PROPS" ]]; then
  cat > "$LOCAL_PROPS" << 'PROPS'
# Overrides para entorno de desarrollo local con Docker
# NO commitear este archivo
spring.datasource.url=jdbc:postgresql://localhost:5432/data4n6
minio.endpoint=http://localhost:9000
PROPS
  ok "Creado application-local.properties (Docker local)"
fi

echo "local"         > "$ROOT/.spring-profile"
echo "$NODE_BIN_DIR" > "$ROOT/.node-bin-dir"
ok "restart.sh configurado (spring profile: local, node: $NODE_BIN_DIR)"

# Proteger ficheros locales con .gitignore
GITIGNORE="$ROOT/.gitignore"
[[ ! -f "$GITIGNORE" ]] && touch "$GITIGNORE"
for entry in ".node-bin-dir" ".spring-profile"; do
  grep -qxF "$entry" "$GITIGNORE" 2>/dev/null || echo "$entry" >> "$GITIGNORE"
done
BACKEND_GITIGNORE="$BACKEND/.gitignore"
[[ -f "$BACKEND_GITIGNORE" ]] && ! grep -q "application-local.properties" "$BACKEND_GITIGNORE" 2>/dev/null && \
  echo "application-local.properties" >> "$BACKEND_GITIGNORE" || true

# ─────────────────────────────────────────────────────────────────────────────
# 9. DEPENDENCIAS FRONTEND
# ─────────────────────────────────────────────────────────────────────────────
header "9. Dependencias frontend (npm install)"

cd "$FRONTEND"
if [[ ! -d "node_modules" ]]; then
  info "npm install — puede tardar 1-2 minutos..."
  PATH="$NODE_BIN_DIR:$PATH" npm install
  ok "npm install completado"
else
  ok "node_modules ya existe (saltando)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 10. COMPILAR JAR DEL BACKEND
# ─────────────────────────────────────────────────────────────────────────────
header "10. Compilando backend"

cd "$BACKEND"
JAR="$BACKEND/target/data4n6-backend-0.0.1-SNAPSHOT.jar"
if [[ ! -f "$JAR" ]]; then
  info "Compilando JAR (primera vez: 5-15 minutos)..."
  mvn package -DskipTests -q
  ok "JAR generado: $(ls -lh "$JAR" | awk '{print $5}')"
else
  ok "JAR ya existe ($(ls -lh "$JAR" | awk '{print $5}'))"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 11. CONTEXTO CLAUDE CODE (memoria + historial de conversaciones)
# ─────────────────────────────────────────────────────────────────────────────
header "11. Contexto Claude Code"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Claude puede transformar el path (p.ej. _ → -), intentamos ambas variantes
_key1="$(echo "$ROOT" | sed 's|/|-|g')"
_key2="$(echo "$_key1" | tr '_' '-')"
if   [[ -d "$HOME/.claude/projects/$_key1" ]]; then CLAUDE_PROJ_DIR="$HOME/.claude/projects/$_key1"
elif [[ -d "$HOME/.claude/projects/$_key2" ]]; then CLAUDE_PROJ_DIR="$HOME/.claude/projects/$_key2"
else CLAUDE_PROJ_DIR="$HOME/.claude/projects/$_key1"; fi   # usamos key1 para crearlo nuevo

# 11a. Memoria del proyecto (patrones, preferencias, estado)
MEMORY_SOURCE="$ROOT/setup/claude-memory"
if [[ -d "$MEMORY_SOURCE" ]]; then
  mkdir -p "$CLAUDE_PROJ_DIR/memory"
  cp -r "$MEMORY_SOURCE/." "$CLAUDE_PROJ_DIR/memory/"
  ok "Memoria del proyecto instalada ($(ls "$CLAUDE_PROJ_DIR/memory" | wc -l) archivos)"
else
  warn "No se encontraron archivos de memoria en setup/claude-memory"
fi

# 11b. Historial de conversaciones (ficheros .jsonl exportados con export-conversations.sh)
# Busca en el directorio del script en la unidad externa
CONVERSATIONS_SOURCE="$SCRIPT_DIR/conversations"
if [[ -d "$CONVERSATIONS_SOURCE" ]] && compgen -G "$CONVERSATIONS_SOURCE/*.jsonl" > /dev/null 2>&1; then
  mkdir -p "$CLAUDE_PROJ_DIR"
  CONV_COUNT=0
  for f in "$CONVERSATIONS_SOURCE"/*.jsonl; do
    cp "$f" "$CLAUDE_PROJ_DIR/"
    CONV_COUNT=$((CONV_COUNT + 1))
  done
  CONV_SIZE=$(du -sh "$CONVERSATIONS_SOURCE" 2>/dev/null | cut -f1)
  ok "Historial de conversaciones instalado ($CONV_COUNT conversaciones, $CONV_SIZE)"
  info "Usa /resume en Claude Code para reanudar conversaciones anteriores"
else
  warn "No se encontró historial de conversaciones en $CONVERSATIONS_SOURCE"
  info "Para exportarlo desde el ordenador origen: ./export-conversations.sh"
fi

# ─────────────────────────────────────────────────────────────────────────────
# RESUMEN
# ─────────────────────────────────────────────────────────────────────────────
cd "$ROOT"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓  Entorno listo                           ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Proyecto:${NC}   $ROOT"
echo ""
echo -e "  ${BOLD}Contenedores Docker:${NC}"
echo -e "    PostgreSQL  → localhost:5432   (data4n6 / data4n6)"
echo -e "    MinIO API   → localhost:9000   (data4n6 / data4n6secret)"
echo -e "    MinIO UI    → ${CYAN}http://localhost:9001${NC}"
echo ""
echo -e "  ${BOLD}Arrancar la aplicación:${NC}"
echo -e "    ${CYAN}cd $ROOT && ./restart.sh${NC}"
echo ""
echo -e "  ${BOLD}Recompilar tras cambios en Java:${NC}"
echo -e "    ${CYAN}cd data4n6-backend && mvn package -DskipTests -q${NC}"
echo ""
echo -e "  ${BOLD}Abrir Claude Code:${NC}"
echo -e "    ${CYAN}cd $ROOT && claude${NC}"
echo ""
echo -e "  ${BOLD}Nota sobre el contexto:${NC}"
echo -e "    Se han instalado los archivos de ${BOLD}memoria${NC} del proyecto (patrones,"
echo -e "    preferencias, estado). Claude los cargará automáticamente."
echo -e "    El historial de conversaciones (${CYAN}/resume${NC}) es local a cada máquina"
echo -e "    y no se puede transferir — simplemente abre una conversación nueva."
echo ""
echo -e "  ${BOLD}Gestionar contenedores:${NC}"
echo -e "    Parar:    ${CYAN}cd data4n6-backend && $DOCKER_CMD compose down${NC}"
echo -e "    Arrancar: ${CYAN}cd data4n6-backend && $DOCKER_CMD compose up -d postgres minio${NC}"
echo -e "    Logs:     ${CYAN}$DOCKER_CMD compose logs -f postgres${NC}"
echo ""
