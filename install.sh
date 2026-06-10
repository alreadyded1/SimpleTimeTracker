#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/cabbytime"
REPO_URL="https://github.com/alreadyded1/SimpleTimeTracker.git"
SERVICE_USER="cabbytime"
PORT=8000

echo "==> Updating packages..."
apt-get update -qq
apt-get install -y -qq python3 python3-venv python3-pip nodejs npm git

echo "==> Creating service user..."
id -u "$SERVICE_USER" &>/dev/null || useradd --system --no-create-home --shell /usr/sbin/nologin "$SERVICE_USER"

echo "==> Cloning repository..."
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "    Directory exists, pulling latest..."
  git -C "$INSTALL_DIR" pull
else
  git clone "$REPO_URL" "$INSTALL_DIR"
fi

echo "==> Creating data directory..."
mkdir -p "$INSTALL_DIR/data"
chown "$SERVICE_USER":"$SERVICE_USER" "$INSTALL_DIR/data"

echo "==> Setting up Python virtual environment..."
python3 -m venv "$INSTALL_DIR/venv"
"$INSTALL_DIR/venv/bin/pip" install -q --upgrade pip
"$INSTALL_DIR/venv/bin/pip" install -q -r "$INSTALL_DIR/backend/requirements.txt"

echo "==> Building frontend..."
cd "$INSTALL_DIR/frontend"
npm install --silent
npm run build

echo "==> Installing systemd service..."
cp "$INSTALL_DIR/cabbytime.service" /etc/systemd/system/cabbytime.service
systemctl daemon-reload
systemctl enable cabbytime
systemctl restart cabbytime

echo ""
echo "==> Done! CabbyTime is running."
echo "    Open: http://$(hostname -I | awk '{print $1}'):${PORT}"
