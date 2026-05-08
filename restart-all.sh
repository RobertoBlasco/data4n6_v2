#!/usr/bin/env bash
# Reinicia dockers (postgres, minio) + backend + frontend
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

kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
    warn "Proceso en puerto $port detenido"
  fi
}

wait_backend() {
  info "Esperando que el backend arranque..."
  for i in $(seq 1 60); do
    if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
      ok "Backend listo (${i}s)"
      return 0
    fi
    sleep 1
  done
  die "El backend no arrancó en 60 segundos. Revisa: tail -50 $BACKEND_LOG"
}

wait_docker_healthy() {
  local name=$1
  info "Esperando que $name esté healthy..."
  for i in $(seq 1 30); do
    local status
    status=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "missing")
    if [[ "$status" == "healthy" ]]; then
      ok "$name healthy (${i}s)"
      return 0
    fi
    sleep 1
  done
  die "$name no alcanzó estado healthy en 30 segundos"
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════╗${NC}"
echo -e "${CYAN}║   data4n6 — Restart ALL          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════╝${NC}"
echo ""

# ── Parar procesos ────────────────────────────────────────────────────────────
info "Deteniendo procesos en puertos 8080 y 4200..."
kill_port 8080
kill_port 4200
sleep 1

# ── Docker ────────────────────────────────────────────────────────────────────
info "Reiniciando contenedores Docker..."
cd "$BACKEND"
docker compose restart postgres minio

wait_docker_healthy data4n6-postgres
wait_docker_healthy data4n6-minio

# ── Backend ───────────────────────────────────────────────────────────────────
info "Arrancando backend → $BACKEND_LOG"
cd "$BACKEND"
nohup mvn spring-boot:run < /dev/null > "$BACKEND_LOG" 2>&1 &
wait_backend

# ── Frontend ──────────────────────────────────────────────────────────────────
info "Arrancando frontend → $FRONTEND_LOG"
cd "$FRONTEND"
nohup ng serve --host 0.0.0.0 --port 4200 --configuration development \
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
echo -e "   Postgres  → ${GREEN}localhost:5432${NC}"
echo -e "   MinIO     → ${GREEN}http://localhost:9001${NC}  (admin: data4n6 / data4n6secret)"
echo -e "   Backend   → ${GREEN}http://localhost:8080/swagger-ui.html${NC}"
echo -e "   Frontend  → ${GREEN}http://localhost:4200${NC}"
echo -e "   Logs      → tail -f $BACKEND_LOG"
echo -e "               tail -f $FRONTEND_LOG"
echo ""
