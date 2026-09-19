"""Re-export platform branding from the master logo. Does not modify gugu-logo.png."""

from pathlib import Path
import runpy

if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).with_name("export-branding.py")), run_name="__main__")
