import pytest
from app.sandbox.runner import sandbox_runner

@pytest.mark.asyncio
async def test_sandbox_runner_failing_code():
    # Buggy code that triggers ZeroDivisionError
    buggy_code = """
def calculate_rate(data):
    return 100 / data.get('discount', 0)
"""
    # Reproducer test
    test_code = """
import pytest
from solution import calculate_rate

def test_division():
    assert calculate_rate({'discount': 0}) == 100
"""
    result = await sandbox_runner.execute_code_snippet(buggy_code, test_code)
    # The buggy code should fail the test
    assert result.success is False
    assert result.exit_code != 0
    assert "ZeroDivisionError" in result.stdout or "ZeroDivisionError" in result.stderr

@pytest.mark.asyncio
async def test_sandbox_runner_passing_code():
    # Fixed code with defensive guardrail
    fixed_code = """
def calculate_rate(data):
    discount = data.get('discount', 0)
    if discount == 0:
        return 100
    return 100 / discount
"""
    test_code = """
import pytest
from solution import calculate_rate

def test_division():
    assert calculate_rate({'discount': 0}) == 100
    assert calculate_rate({'discount': 2}) == 50
"""
    result = await sandbox_runner.execute_code_snippet(fixed_code, test_code)
    # The fixed code should pass the test in the sandbox
    assert result.success is True
    assert result.exit_code == 0
    assert result.execution_time_seconds > 0
