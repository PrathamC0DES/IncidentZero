import sys
import subprocess
import tempfile
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel

class SandboxResult(BaseModel):
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    execution_time_seconds: float
    error_summary: Optional[str] = None

class CodeSandboxRunner:
    """
    Executes Python source code and generated unit tests in an isolated,
    timeout-bounded subprocess environment to verify patches without side-effects.
    """
    def __init__(self, timeout_seconds: int = 15):
        self.timeout_seconds = timeout_seconds

    async def execute_code_snippet(self, source_code: str, test_code: str) -> SandboxResult:
        """
        Creates a temporary isolated test workspace, writes source code and test files,
        and executes pytest or direct python runner with strict execution timeouts.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._run_isolated_sync, source_code, test_code)

    def _run_isolated_sync(self, source_code: str, test_code: str) -> SandboxResult:
        import time

        with tempfile.TemporaryDirectory(prefix="incidentzero_sandbox_") as tmpdir:
            tmppath = Path(tmpdir)
            source_file = tmppath / "solution.py"
            test_file = tmppath / "test_reproduce.py"

            source_file.write_text(source_code, encoding="utf-8")
            
            # Ensure the test imports the solution module correctly
            full_test_content = (
                "import sys\n"
                "from pathlib import Path\n"
                f"sys.path.insert(0, r'{str(tmppath)}')\n"
                + test_code
            )
            test_file.write_text(full_test_content, encoding="utf-8")

            # Run with the active Python executable in isolated mode (-I)
            cmd = [
                sys.executable,
                "-I",  # Isolated mode: ignores PYTHONPATH and user site-packages
                "-m", "pytest",
                str(test_file),
                "-q"
            ]

            start_time = time.time()
            try:
                proc = subprocess.run(
                    cmd,
                    cwd=tmpdir,
                    capture_output=True,
                    text=True,
                    timeout=self.timeout_seconds
                )
                duration = time.time() - start_time
                success = proc.returncode == 0
                error_summary = None if success else (proc.stderr or proc.stdout)

                return SandboxResult(
                    success=success,
                    exit_code=proc.returncode,
                    stdout=proc.stdout,
                    stderr=proc.stderr,
                    execution_time_seconds=round(duration, 3),
                    error_summary=error_summary
                )

            except subprocess.TimeoutExpired:
                duration = time.time() - start_time
                return SandboxResult(
                    success=False,
                    exit_code=-1,
                    stdout="",
                    stderr=f"Execution timed out after {self.timeout_seconds} seconds.",
                    execution_time_seconds=round(duration, 3),
                    error_summary="Sandbox execution timed out."
                )
            except Exception as ex:
                duration = time.time() - start_time
                return SandboxResult(
                    success=False,
                    exit_code=-2,
                    stdout="",
                    stderr=str(ex),
                    execution_time_seconds=round(duration, 3),
                    error_summary=str(ex)
                )

sandbox_runner = CodeSandboxRunner(timeout_seconds=15)
