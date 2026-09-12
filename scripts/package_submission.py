#!/usr/bin/env python3
"""
package_submission.py — Official Adobe University Hackathon Round 3 Submission Packager.
Assembles strictly the marketplace root according to the official Unstop guidelines:
- marketplace.json
- root README.md
- skills/ (all declared skills and their scripts, references, tests)
Excludes all node_modules, build outputs, web source, git archives, and temporary files.
Critically: Unzips into a temporary directory and verifies the unzipped archive.
"""

import os
import sys
import shutil
import zipfile
import tempfile
import json
import subprocess
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = WORKSPACE_ROOT / "dist"
OUTPUT_ZIP = WORKSPACE_ROOT / "omniaudit-geo-marketplace.zip"
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB Unstop limit

EXCLUDED_FILENAMES = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
}

EXCLUDED_DIR_NAMES = {
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    "node_modules",
    ".git",
    ".next",
    "dist",
    ".turbo",
    ".vercel",
}

EXCLUDED_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".pyd",
    ".tmp",
    ".swp",
}

def validate_yaml_frontmatter(skill_md_path: Path) -> bool:
    """Verifies that SKILL.md starts with valid YAML frontmatter containing 'name'."""
    text = skill_md_path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return False
    found_closing = False
    has_name = False
    for line in lines[1:]:
        if line.strip() == "---":
            found_closing = True
            break
        if line.startswith("name:"):
            has_name = True
    return found_closing and has_name

def build_package() -> Path:
    print("\n" + "═" * 70)
    print("📦 OmniAudit-GEO Marketplace Submission Packager")
    print("═" * 70)

    marketplace_json = WORKSPACE_ROOT / "marketplace.json"
    readme_md = WORKSPACE_ROOT / "README.md"
    skills_dir = WORKSPACE_ROOT / "skills"

    if not marketplace_json.is_file():
        sys.exit("❌ Error: marketplace.json missing at workspace root")
    if not readme_md.is_file():
        sys.exit("❌ Error: README.md missing at workspace root")
    if not skills_dir.is_dir():
        sys.exit("❌ Error: skills/ directory missing at workspace root")

    with open(marketplace_json, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    skills = manifest.get("skills", [])
    entrypoints = [s for s in skills if s.get("entrypoint") is True]
    if len(entrypoints) != 1:
        sys.exit(f"❌ Error: Expected exactly 1 entrypoint in marketplace.json, found {len(entrypoints)}")

    print(f"✓ Verified entrypoint: '{entrypoints[0]['id']}'")
    print(f"✓ Declared skills ({len(skills)}): {', '.join(s['id'] for s in skills)}")

    for skill in skills:
        s_id = skill["id"]
        s_path = skills_dir / s_id
        if not s_path.is_dir():
            sys.exit(f"❌ Error: Declared skill directory missing: {s_path}")
        skill_md = s_path / "SKILL.md"
        if not skill_md.is_file():
            sys.exit(f"❌ Error: SKILL.md missing in {s_path}")
        if not validate_yaml_frontmatter(skill_md):
            sys.exit(f"❌ Error: Invalid YAML frontmatter in {skill_md}")

    print("✓ All skill directories and YAML frontmatter validated.")

    # Create clean staging directory dist/submission
    staging_dir = OUTPUT_DIR / "submission"
    if staging_dir.exists():
        shutil.rmtree(staging_dir)
    staging_dir.mkdir(parents=True, exist_ok=True)

    # 1. Copy marketplace.json
    shutil.copy2(marketplace_json, staging_dir / "marketplace.json")

    # 2. Copy root README.md
    shutil.copy2(readme_md, staging_dir / "README.md")

    # 3. Copy clean skills/ hierarchy
    staging_skills = staging_dir / "skills"
    staging_skills.mkdir()

    file_count = 2  # marketplace.json and README.md

    for skill in skills:
        s_id = skill["id"]
        src_skill = skills_dir / s_id
        dest_skill = staging_skills / s_id

        for root, dirs, files in os.walk(src_skill):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIR_NAMES]
            rel_root = Path(root).relative_to(src_skill)
            dest_current = dest_skill / rel_root
            dest_current.mkdir(parents=True, exist_ok=True)

            for file in sorted(files):
                if file in EXCLUDED_FILENAMES or any(file.endswith(ext) for ext in EXCLUDED_EXTENSIONS):
                    continue
                shutil.copy2(Path(root) / file, dest_current / file)
                file_count += 1

    print(f"✓ Assembled {file_count} files in clean staging directory.")

    # Build the submission ZIP from staging directory
    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()

    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for root, _, files in os.walk(staging_dir):
            for file in sorted(files):
                full_path = Path(root) / file
                rel_path = full_path.relative_to(staging_dir)
                zf.write(full_path, str(rel_path))

    zip_size_bytes = OUTPUT_ZIP.stat().st_size
    zip_size_mb = zip_size_bytes / (1024 * 1024)

    if zip_size_bytes > MAX_SIZE_BYTES:
        sys.exit(f"❌ Error: Archive size ({zip_size_mb:.2f} MB) exceeds maximum allowed {MAX_SIZE_BYTES / (1024*1024)} MB")

    print(f"✓ Generated archive: {OUTPUT_ZIP.name} ({zip_size_mb:.2f} MB)")

    # 4. Critical Invariant: Unzip into temp directory and run verification on unzipped package
    print("\n🔍 Verifying unzipped submission package in isolated sandbox...")
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)
        with zipfile.ZipFile(OUTPUT_ZIP, "r") as zf:
            zf.extractall(tmp_path)

        # Verify essential root items
        unzipped_manifest = tmp_path / "marketplace.json"
        unzipped_readme = tmp_path / "README.md"
        assert unzipped_manifest.exists(), "marketplace.json missing from unzipped archive"
        assert unzipped_readme.exists(), "README.md missing from unzipped archive"

        # Verify every skill in unzipped archive
        for skill in skills:
            s_id = skill["id"]
            skill_folder = tmp_path / "skills" / s_id
            assert skill_folder.exists(), f"skills/{s_id} missing from unzipped archive"
            assert (skill_folder / "SKILL.md").exists(), f"SKILL.md missing in unzipped skills/{s_id}"

        # Ensure NO junk files leaked into the unzipped package
        for root, dirs, files in os.walk(tmp_path):
            for d in dirs:
                assert d not in EXCLUDED_DIR_NAMES, f"Junk directory '{d}' leaked into archive!"
            for f in files:
                assert f not in EXCLUDED_FILENAMES, f"Junk file '{f}' leaked into archive!"
                assert not any(f.endswith(ext) for ext in EXCLUDED_EXTENSIONS), f"Junk file '{f}' leaked into archive!"

        # Run unittests from inside the unzipped archive
        test_env = dict(os.environ)
        test_env["PYTHONPATH"] = str(tmp_path / "skills" / "audit-orchestrator" / "scripts")
        test_proc = subprocess.run(
            [sys.executable, "-m", "unittest", "discover", "-s", str(tmp_path / "skills" / "audit-orchestrator" / "tests")],
            capture_output=True,
            text=True,
            env=test_env
        )
        if test_proc.returncode != 0:
            print(test_proc.stderr)
            sys.exit("❌ Error: Unittests failed inside the unzipped package!")

        # Run CLI audit runner from inside unzipped archive
        cli_proc = subprocess.run(
            [sys.executable, str(tmp_path / "skills" / "audit-orchestrator" / "scripts" / "audit_runner.py"), "--url", "https://example.com"],
            capture_output=True,
            text=True,
            env=test_env
        )
        if cli_proc.returncode != 0:
            print(cli_proc.stderr)
            sys.exit("❌ Error: audit_runner.py failed to execute inside the unzipped package!")

        # Validate generated report against schema
        try:
            cli_report = json.loads(cli_proc.stdout)
            from schema_validator import validate_report
            is_valid, errs = validate_report(cli_report)
            assert is_valid, f"CLI output from unzipped package failed schema validation: {errs}"
        except Exception as e:
            sys.exit(f"❌ Error validating unzipped CLI report output: {e}")

    print(f"✓ All tests and CLI verification PASSED inside unzipped sandbox archive.")
    print("═" * 70)
    print(f"🎉 Package Submission Ready: {OUTPUT_ZIP.resolve()}")
    print(f"   Size: {zip_size_mb:.2f} MB | Packaged files: {file_count}")
    print("═" * 70 + "\n")
    return OUTPUT_ZIP

if __name__ == "__main__":
    build_package()
