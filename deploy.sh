#!/bin/bash
# =============================================================================
# ZhiYin (知音) - One-Click Production Deployment Script
# Usage: ./deploy.sh [docker|local]
# =============================================================================

set -e

MODE=${1:-docker}
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "============================================"
echo "  ZhiYin (知音) - Deployment"
echo "  Mode: $MODE"
echo "============================================"
echo ""

# ── Check prerequisites ──
check_prerequisites() {
    if [ "$MODE" = "docker" ]; then
        if ! command -v docker &> /dev/null; then
            echo "[ERROR] Docker not found. Install: https://docs.docker.com/get-docker"
            exit 1
        fi
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            echo "[ERROR] Docker Compose not found."
            exit 1
        fi
        echo "[OK] Docker detected"
    else
        if ! command -v node &> /dev/null; then
            echo "[ERROR] Node.js not found."
            exit 1
        fi
        echo "[OK] Node.js $(node --version) detected"
    fi
}

# ── Docker deployment ──
deploy_docker() {
    echo "Building Docker image (multi-stage, source code excluded)..."
    
    # Build image
    if docker compose version &> /dev/null; then
        docker compose build
    else
        docker-compose build
    fi
    
    echo ""
    echo "Starting container..."
    if docker compose version &> /dev/null; then
        docker compose up -d
    else
        docker-compose up -d
    fi
    
    echo ""
    echo "Waiting for health check..."
    sleep 5
    
    # Check health
    for i in $(seq 1 10); do
        if curl -s http://localhost:3456 | grep -q "html"; then
            echo "[OK] Server is running at http://localhost:3456"
            break
        fi
        echo "Waiting... ($i/10)"
        sleep 3
    done
    
    echo ""
    echo "=== Docker deployment complete ==="
    echo "URL: http://localhost:3456"
    echo ""
    echo "Commands:"
    echo "  View logs:   docker compose logs -f"
    echo "  Stop:        docker compose down"
    echo "  Restart:     docker compose restart"
}

# ── Local deployment (standalone) ──
deploy_local() {
    echo "Building standalone production bundle..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        if command -v pnpm &> /dev/null; then
            pnpm install --registry https://registry.npmmirror.com
        else
            npm install --registry https://registry.npmmirror.com --legacy-peer-deps
        fi
    fi
    
    # Build with standalone output
    echo "Compiling (this may take 3-5 minutes)..."
    if command -v pnpm &> /dev/null; then
        pnpm build --webpack
    else
        npx next build --webpack
    fi
    
    # Initialize database
    echo "Initializing database..."
    node scripts/init-db.js
    
    echo ""
    echo "=== Local deployment complete ==="
    echo ""
    echo "To start the server:"
    echo "  cd $PROJECT_DIR"
    echo "  node .next/standalone/server.js"
    echo ""
    echo "URL: http://localhost:3456"
}

# ── Run ──
check_prerequisites

case "$MODE" in
    docker)
        deploy_docker
        ;;
    local)
        deploy_local
        ;;
    *)
        echo "Usage: $0 [docker|local]"
        exit 1
        ;;
esac
