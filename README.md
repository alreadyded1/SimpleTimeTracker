# CabbyTime

Self-hosted work time tracker. Runs as a systemd service inside a Proxmox LXC container (Debian-based). No Docker required.

## Features

- Live timer — start/stop sessions with one click
- Manual entry — add blocks by specifying exact start and end times
- Edit any block (time or notes)
- Date range filtering
- CSV export
- SQLite database — no external database server

## Prerequisites

- Debian/Ubuntu-based LXC container or VM
- Root access (for install)
- Internet access (to pull from GitHub and install packages)

## Install

Run as root on the target machine:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/alreadyded1/SimpleTimeTracker/main/install.sh)
```

Or clone first:

```bash
git clone https://github.com/alreadyded1/SimpleTimeTracker.git /opt/cabbytime
bash /opt/cabbytime/install.sh
```

The installer will:
1. Install system dependencies (`python3`, `nodejs`, `npm`, `git`)
2. Clone the repo to `/opt/cabbytime`
3. Create a Python virtualenv and install requirements
4. Build the React frontend (output → `backend/static/`)
5. Create a `cabbytime` system user
6. Install and start the systemd service

Access the app at `http://<LXC-IP>:8000`.

## Update

```bash
bash /opt/cabbytime/update.sh
```

## Development

**Backend (FastAPI):**

```bash
cd backend
DB_DIR=./data python3 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
DB_DIR=./data uvicorn main:app --reload --port 8000
```

**Frontend (Vite dev server with proxy to backend):**

```bash
cd frontend
npm install
npm run dev   # runs on :5173, proxies /api to :8000
```

## Data

The SQLite database lives at `/opt/cabbytime/data/cabbytime.db` — outside the repo directory, so it is never overwritten by updates.

## Service management

```bash
systemctl status cabbytime
systemctl restart cabbytime
journalctl -u cabbytime -f
```

## API

Interactive docs available at `http://<host>:8000/api/docs`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/blocks` | List blocks (optional `?start=&end=` ISO filters) |
| POST | `/api/blocks` | Create block (manual entry) |
| GET | `/api/blocks/active` | Get active block |
| POST | `/api/blocks/start` | Start timer |
| POST | `/api/blocks/{id}/stop` | Stop timer |
| PUT | `/api/blocks/{id}` | Edit block |
| DELETE | `/api/blocks/{id}` | Delete block |
| GET | `/api/blocks/export` | Download CSV |
