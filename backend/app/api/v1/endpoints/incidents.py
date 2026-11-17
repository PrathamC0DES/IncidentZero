import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.incident import Incident, IncidentStatus, AgentStepLog
from app.schemas.incident import IncidentCreate, IncidentResponse
from app.agents.orchestrator import run_incident_healing_pipeline

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_incident(
    payload: IncidentCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests an unhandled exception or crash report via webhook.
    Immediately returns an incident ID and dispatches the multi-agent healing engine asynchronously.
    """
    incident_id = f"inc_{uuid.uuid4().hex[:10]}"
    
    incident = Incident(
        id=incident_id,
        title=payload.title,
        service_name=payload.service_name,
        error_type=payload.error_type,
        error_message=payload.error_message,
        stack_trace=payload.stack_trace,
        repo_url=payload.repo_url,
        target_branch=payload.target_branch,
        status=IncidentStatus.RECEIVED
    )
    
    # Record initial ingestion step
    initial_log = AgentStepLog(
        incident_id=incident_id,
        agent_name="System",
        step_type="INGESTION",
        content=f"Captured {payload.error_type} from {payload.service_name}. Dispatching agent healing pipeline."
    )
    
    db.add(incident)
    db.add(initial_log)
    await db.commit()
    await db.refresh(incident)
    
    # Dispatch autonomous multi-agent healing in background
    background_tasks.add_task(run_incident_healing_pipeline, incident_id)
    
    # Reload with steps for response
    result = await db.execute(
        select(Incident).where(Incident.id == incident_id).options(selectinload(Incident.steps))
    )
    return result.scalar_one()


@router.get("", response_model=List[IncidentResponse])
async def list_incidents(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Lists all captured production incidents, their status, and resolution details."""
    query = (
        select(Incident)
        .options(selectinload(Incident.steps))
        .order_by(Incident.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Fetches details, root-cause analysis, diff patch, and full agent execution trace."""
    query = (
        select(Incident)
        .where(Incident.id == incident_id)
        .options(selectinload(Incident.steps))
    )
    result = await db.execute(query)
    incident = result.scalar_one_or_none()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    return incident
