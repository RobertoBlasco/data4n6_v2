#!/usr/bin/env bash
# Reinicia backend (Spring Boot) y frontend (Angular)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/data4n6-backend"
FRONTEND="$ROOT/data4n6-frontend"
BACKEND_LOG="/tmp/data4n6-backend.log"
FRONTEND_LOG="/tmp/data4n6-frontend.log"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

info()    { echo -e "${CYAN}[→]${NC} $*"; }
ok()      { echo -e "${GREEN}[✓]${NC} $*"; }
warn()    { echo -e "${YELLOW}[!]${NC} $*"; }
die()     { echo -e "${RED}[✗]${NC} $*"; exit 1; }

# ── Configuración local (generada por setup-dev.sh) ──────────────────────────
# Node.js: usa .node-bin-dir si existe, si no detecta automáticamente
if [[ -f "$ROOT/.node-bin-dir" ]]; then
  NODE_BIN_DIR="$(cat "$ROOT/.node-bin-dir")"
else
  NODE_BIN_DIR="$(dirname "$(command -v node 2>/dev/null || echo '/usr/bin/node')")"
  # Fallback conocido para esta máquina
  [[ -d "/opt/plesk/node/24/bin" ]] && NODE_BIN_DIR="/opt/plesk/node/24/bin"
fi

# Spring profile: usa .spring-profile si existe (para Docker local)
SPRING_OPTS=""
if [[ -f "$ROOT/.spring-profile" ]]; then
  SPRING_OPTS="--spring.profiles.active=$(cat "$ROOT/.spring-profile")"
fi

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  [[ -z "$pids" ]] && return

  local protected=()
  local p=$$
  while [[ "$p" -gt 1 ]]; do
    protected+=("$p")
    p=$(ps -p "$p" -o ppid= 2>/dev/null | tr -d ' ') || break
  done

  local killed=0
  while IFS= read -r pid; do
    [[ -z "$pid" ]] && continue
    for anc in "${protected[@]}"; do
      if [[ "$pid" == "$anc" ]]; then
        warn "Omitiendo PID $pid en puerto $port (proceso de la sesión actual)"
        continue 2
      fi
    done
    local comm
    comm=$(ps -p "$pid" -o comm= 2>/dev/null || true)
    if [[ "$comm" == *ssh* || "$comm" == *ttyd* || "$comm" == *wetty* ]]; then
      warn "Omitiendo $comm (PID $pid) en puerto $port"
      continue
    fi
    kill -9 "$pid" 2>/dev/null || true
    killed=1
  done <<< "$pids"

  [[ $killed -eq 1 ]] && warn "Proceso en puerto $port detenido"
}

wait_backend() {
  info "Esperando que el backend arranque..."
  for i in $(seq 1 90); do
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
      ok "Backend listo (${i}s)"
      return 0
    fi
    sleep 1
  done
  die "El backend no arrancó en 90 segundos. Revisa: tail -50 $BACKEND_LOG"
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════╗${NC}"
echo -e "${CYAN}║    data4n6 — Restart             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════╝${NC}"
echo ""

# ── Parar procesos existentes ─────────────────────────────────────────────────
info "Deteniendo procesos en puertos 8080 y 4200..."
kill_port 8080
kill_port 4200
sleep 1

# ── Backend ───────────────────────────────────────────────────────────────────
info "Arrancando backend → $BACKEND_LOG"
JAR="$BACKEND/target/data4n6-backend-0.0.1-SNAPSHOT.jar"
if [[ ! -f "$JAR" ]]; then
  info "JAR no encontrado — compilando (esto tardará ~15 min la primera vez)..."
  cd "$BACKEND" && mvn package -DskipTests -q
fi
# shellcheck disable=SC2086
nohup java -jar "$JAR" $SPRING_OPTS < /dev/null > "$BACKEND_LOG" 2>&1 &
wait_backend

# ── Frontend ──────────────────────────────────────────────────────────────────
info "Arrancando frontend → $FRONTEND_LOG"
cd "$FRONTEND"
nohup env PATH="$NODE_BIN_DIR:$PATH" \
  node_modules/.bin/ng serve --host 0.0.0.0 --port 4200 --configuration development \
  < /dev/null > "$FRONTEND_LOG" 2>&1 &

info "Esperando que el frontend compile..."
for i in $(seq 1 120); do
  if grep -q "Application bundle generation complete\|Compiled successfully" "$FRONTEND_LOG" 2>/dev/null; then
    ok "Frontend listo (${i}s)"
    break
  fi
  if grep -q "Error\|error TS" "$FRONTEND_LOG" 2>/dev/null; then
    die "Error en el frontend. Revisa: tail -50 $FRONTEND_LOG"
  fi
  sleep 1
done

echo ""
ok "Todo arrancado:"
echo -e "   Backend  → ${GREEN}http://localhost:8080/swagger-ui.html${NC}"
echo -e "   Frontend → ${GREEN}http://localhost:4200${NC}"
echo -e "   Logs     → tail -f $BACKEND_LOG"
echo -e "              tail -f $FRONTEND_LOG"
echo ""
