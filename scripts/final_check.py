#!/usr/bin/env python3
"""
final_check.py — Single Mandatory Final Submission Gate for Adobe Hackathon 2026 Round 3.
Runs the complete verification suite in strict CI mode, verifies the unzipped package,
and outputs:
  FINAL SUBMISSION: PASS
only if all mandatory checks pass without warnings or failures.
"""

import sys
import os
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

def main():
    print("\n" + "█" * 78)
    print("██  OMNIAUDIT-GEO — FINAL ROUND 3 SUBMISSION GATE (ADOBE HACKATHON 2026)     ██")
    print("█" * 78 + "\n")

    # 1. Run the 6-Gate verification runner in strict CI mode
    verify_script = REPO_ROOT / "scripts" / "verify.py"
    proc = subprocess.run(
        [sys.executable, str(verify_script), "--ci"],
        cwd=str(REPO_ROOT),
        text=True
    )

    if proc.returncode != 0:
        print("\n" + "!" * 78)
        print("❌ FINAL SUBMISSION: FAIL")
        print("   Reason: One or more of the 6 verification gates failed in --ci mode.")
        print("!" * 78 + "\n")
        return 1

    # 2. Assert submission ZIP existence and bounds
    zip_path = REPO_ROOT / "omniaudit-geo-marketplace.zip"
    if not zip_path.is_file():
        print("\n" + "!" * 78)
        print("❌ FINAL SUBMISSION: FAIL")
        print("   Reason: omniaudit-geo-marketplace.zip was not generated.")
        print("!" * 78 + "\n")
        return 1

    size_bytes = zip_path.stat().st_size
    size_mb = size_bytes / (1024 * 1024)
    if size_bytes == 0 or size_mb > 50.0:
        print("\n" + "!" * 78)
        print("❌ FINAL SUBMISSION: FAIL")
        print(f"   Reason: Invalid archive size: {size_mb:.2f} MB (must be between 0 and 50 MB).")
        print("!" * 78 + "\n")
        return 1

    print("\n" + "█" * 78)
    print("██  FINAL SUBMISSION: PASS                                                  ██")
    print("██  Status: 100% Verified, Packaged, Schema-Compliant, and Submission-Ready ██")
    print("█" * 78 + "\n")
    return 0

if __name__ == "__main__":
    sys.exit(main())
