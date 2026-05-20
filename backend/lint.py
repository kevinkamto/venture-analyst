"""Run ruff check --fix, ruff format, and mypy on the backend."""

import subprocess
import sys


def run(cmd: list[str]) -> int:
    print(f"\n$ {' '.join(cmd)}")
    result = subprocess.run(cmd)
    return result.returncode


def main() -> None:
    failed: list[str] = []

    if run(["ruff", "check", "--fix", "."]) != 0:
        failed.append("ruff check")

    if run(["ruff", "format", "."]) != 0:
        failed.append("ruff format")

    if run(["mypy", "."]) != 0:
        failed.append("mypy")

    if failed:
        print(f"\nFailed: {', '.join(failed)}")
        sys.exit(1)
    else:
        print("\nAll checks passed.")


if __name__ == "__main__":
    main()
