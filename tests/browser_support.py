"""Shared browser configuration and local artifacts for optional UI checks."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / 'tests/artifacts'
ARTIFACTS.mkdir(parents=True, exist_ok=True)

def launch_options():
    executable = os.environ.get('FAG_TEST_CHROME')
    return {'executable_path': executable} if executable else {}
