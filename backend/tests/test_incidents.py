import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_incident_ingestion_and_pipeline():
    payload = {
        "title": "ZeroDivisionError in calculate_rate()",
        "service_name": "billing-service",
        "error_type": "ZeroDivisionError",
        "error_message": "division by zero in calculate_rate at line 42",
        "stack_trace": "Traceback (most recent call last):\n  File 'billing/service.py', line 42, in calculate_rate\n    return value / divisor\nZeroDivisionError: division by zero",
        "repo_url": "https://github.com/incidentzero/billing-service",
        "target_branch": "main"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Ingest incident via webhook
        res = await ac.post("/api/v1/incidents", json=payload)
        assert res.status_code == 202
        data = res.json()
        incident_id = data["id"]
        assert incident_id.startswith("inc_")
        assert data["error_type"] == "ZeroDivisionError"

        # 2. Query incident details and verify agent steps are tracked
        res_get = await ac.get(f"/api/v1/incidents/{incident_id}")
        assert res_get.status_code == 200
        inc_data = res_get.json()
        assert inc_data["id"] == incident_id
        assert len(inc_data["steps"]) >= 1
