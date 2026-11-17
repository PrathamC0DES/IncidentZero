from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.incident import IncidentStatus

# Inbound webhook payload from microservice/Sentry/FastAPI exception handler
class IncidentCreate(BaseModel):
    title: str = Field(..., example="ZeroDivisionError in calculate_discount()")
    service_name: str = Field(default="billing-service", example="billing-service")
    error_type: str = Field(..., example="ZeroDivisionError")
    error_message: str = Field(..., example="division by zero at line 42")
    stack_trace: str = Field(..., example="Traceback (most recent call last):\n  File 'app/billing.py', line 42...")
    repo_url: Optional[str] = Field(default=None, example="https://github.com/myorg/billing-service")
    target_branch: Optional[str] = Field(default="main")

class AgentStepLogResponse(BaseModel):
    id: int
    agent_name: str
    step_type: str
    content: str
    meta_info: Optional[Dict[str, Any]] = None
    tokens_used: int
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: str
    title: str
    service_name: str
    error_type: str
    error_message: str
    stack_trace: str
    status: IncidentStatus
    repo_url: Optional[str]
    target_branch: str
    root_cause_analysis: Optional[str]
    reproduced_test_code: Optional[str]
    patch_diff: Optional[str]
    pull_request_url: Optional[str]
    iterations_used: int
    total_tokens_used: int
    created_at: datetime
    updated_at: datetime
    steps: List[AgentStepLogResponse] = []

    class Config:
        from_attributes = True
