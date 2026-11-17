import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Enum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class IncidentStatus(str, enum.Enum):
    RECEIVED = "RECEIVED"
    INVESTIGATING = "INVESTIGATING"
    REPRODUCING = "REPRODUCING"
    FIXING = "FIXING"
    AUDITING = "AUDITING"
    HEALED = "HEALED"
    PR_CREATED = "PR_CREATED"
    FAILED = "FAILED"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)  # e.g., inc_20261114_01
    title = Column(String(255), nullable=False)
    service_name = Column(String(100), nullable=False, default="core-api")
    error_type = Column(String(100), nullable=False)
    error_message = Column(Text, nullable=False)
    stack_trace = Column(Text, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.RECEIVED, index=True)
    
    # Target repository context
    repo_url = Column(String(255), nullable=True)
    target_branch = Column(String(100), default="main")
    
    # Resolution outputs
    root_cause_analysis = Column(Text, nullable=True)
    reproduced_test_code = Column(Text, nullable=True)
    patch_diff = Column(Text, nullable=True)
    pull_request_url = Column(String(255), nullable=True)
    
    # Guardrail metrics
    iterations_used = Column(Integer, default=0)
    total_tokens_used = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to detailed agent execution logs
    steps = relationship("AgentStepLog", back_populates="incident", cascade="all, delete-orphan")


class AgentStepLog(Base):
    __tablename__ = "agent_step_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String, ForeignKey("incidents.id"), index=True)
    agent_name = Column(String(50), nullable=False)  # Investigator, Reproducer, Fixer, Auditor
    step_type = Column(String(50), nullable=False)  # THOUGHT, TOOL_CALL, SANDBOX_RUN, DIFF_GENERATED
    content = Column(Text, nullable=False)
    meta_info = Column(JSON, nullable=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="steps")
