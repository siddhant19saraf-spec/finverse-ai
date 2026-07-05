import sys
from pathlib import Path

ROOT = Path(__file__).parent.resolve()
APPPATH = ROOT / "app"
sys.path.insert(0, str(APPPATH))
