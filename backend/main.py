import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from database import engine, Base
from routers import blocks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CabbyTime", docs_url="/api/docs", redoc_url=None)
app.include_router(blocks.router, prefix="/api")

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    assets_dir = os.path.join(STATIC_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    index = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index):
        return FileResponse(index)
    return JSONResponse(
        {"message": "Frontend not built. Run: cd frontend && npm install && npm run build"},
        status_code=503,
    )
