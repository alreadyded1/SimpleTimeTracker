#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/cabbytime"
PORT=80

echo "==> Pulling latest code..."
git -C "$INSTALL_DIR" pull

echo "==> Updating Python dependencies..."
source "$INSTALL_DIR/venv/bin/activate"
pip install -q --upgrade pip
pip install -q -r "$INSTALL_DIR/backend/requirements.txt"
deactivate

echo "==> Rebuilding frontend..."
cd "$INSTALL_DIR/frontend"
npm install --silent
npm run build

echo "==> Restarting service..."
systemctl restart cabbytime
systemctl --no-pager status cabbytime

echo ""
echo "==> Update complete."
echo "    Open: http://$(hostname -I | awk '{print $1}'):${PORT}"
