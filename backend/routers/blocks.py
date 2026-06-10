from __future__ import annotations
import csv
import io
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Block
from ..schemas import BlockCreate, BlockUpdate, BlockResponse

router = APIRouter(prefix="/blocks", tags=["blocks"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _calc_duration(start: datetime, end: datetime) -> float:
    return (end - start).total_seconds() / 60


@router.get("", response_model=list[BlockResponse])
def list_blocks(
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Block)
    if start:
        q = q.filter(Block.start_time >= start)
    if end:
        q = q.filter(Block.start_time <= end)
    return q.order_by(Block.start_time.desc()).all()


@router.get("/active", response_model=Optional[BlockResponse])
def get_active(db: Session = Depends(get_db)):
    return db.query(Block).filter(Block.end_time.is_(None)).first()


@router.get("/export")
def export_csv(
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Block)
    if start:
        q = q.filter(Block.start_time >= start)
    if end:
        q = q.filter(Block.start_time <= end)
    blocks = q.order_by(Block.start_time.desc()).all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "start_time", "end_time", "duration_minutes", "work_performed"])
    for b in blocks:
        writer.writerow([
            b.id,
            b.start_time.isoformat() if b.start_time else "",
            b.end_time.isoformat() if b.end_time else "",
            round(b.duration, 2) if b.duration is not None else "",
            b.work_performed or "",
        ])
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cabbytime_export.csv"},
    )


@router.post("/start", response_model=BlockResponse, status_code=201)
def start_timer(db: Session = Depends(get_db)):
    existing = db.query(Block).filter(Block.end_time.is_(None)).first()
    if existing:
        raise HTTPException(status_code=409, detail="A block is already active")
    block = Block(start_time=_utcnow())
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.post("/{block_id}/stop", response_model=BlockResponse)
def stop_timer(block_id: int, db: Session = Depends(get_db)):
    block = db.get(Block, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    if block.end_time is not None:
        raise HTTPException(status_code=409, detail="Block is already stopped")
    now = _utcnow()
    block.end_time = now
    block.duration = _calc_duration(block.start_time, now)
    block.updated_at = now
    db.commit()
    db.refresh(block)
    return block


@router.post("", response_model=BlockResponse, status_code=201)
def create_block(payload: BlockCreate, db: Session = Depends(get_db)):
    block = Block(
        start_time=payload.start_time,
        end_time=payload.end_time,
        duration=_calc_duration(payload.start_time, payload.end_time),
        work_performed=payload.work_performed or None,
    )
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.get("/{block_id}", response_model=BlockResponse)
def get_block(block_id: int, db: Session = Depends(get_db)):
    block = db.get(Block, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    return block


@router.put("/{block_id}", response_model=BlockResponse)
def update_block(block_id: int, payload: BlockUpdate, db: Session = Depends(get_db)):
    block = db.get(Block, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    if payload.start_time is not None:
        block.start_time = payload.start_time
    if payload.end_time is not None:
        block.end_time = payload.end_time
    if payload.work_performed is not None:
        block.work_performed = payload.work_performed or None

    if block.end_time is not None:
        if block.end_time <= block.start_time:
            raise HTTPException(status_code=422, detail="end_time must be after start_time")
        block.duration = _calc_duration(block.start_time, block.end_time)

    block.updated_at = _utcnow()
    db.commit()
    db.refresh(block)
    return block


@router.delete("/{block_id}", status_code=204)
def delete_block(block_id: int, db: Session = Depends(get_db)):
    block = db.get(Block, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    db.delete(block)
    db.commit()
