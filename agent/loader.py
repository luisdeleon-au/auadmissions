"""Knowledge and prompt loader for the AU IT Admissions Agent.

Loads the base system prompt, skill files, and supplemental knowledge files
from the `agent/` directory and concatenates them into a single system prompt
string for the Anthropic API. Files are cached in-process so disk reads only
happen on the first load.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import List

AGENT_DIR = Path(__file__).resolve().parent
PROMPTS_DIR = AGENT_DIR / "prompts"
SKILLS_DIR = AGENT_DIR / "skills"
KNOWLEDGE_DIR = AGENT_DIR / "knowledge"

SYSTEM_PROMPT_FILE = PROMPTS_DIR / "system_prompt.md"


@lru_cache(maxsize=256)
def load_file(path: str) -> str:
    """Read a UTF-8 text file from disk and cache the result."""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _list_markdown(directory: Path) -> List[Path]:
    if not directory.exists():
        return []
    return sorted(p for p in directory.iterdir() if p.is_file() and p.suffix == ".md")


def _extract_prompt_block(raw: str) -> str:
    """The shipped system_prompt.md wraps the actual prompt in a fenced
    ```code block. If a fenced block is present, return its contents only;
    otherwise return the raw file."""
    fence = "```"
    first = raw.find(fence)
    if first == -1:
        return raw.strip()
    # Skip the language tag line if present
    newline = raw.find("\n", first)
    if newline == -1:
        return raw.strip()
    second = raw.find(fence, newline + 1)
    if second == -1:
        return raw.strip()
    return raw[newline + 1 : second].strip()


@lru_cache(maxsize=1)
def build_system_prompt() -> str:
    """Assemble the full system prompt: base prompt + skills + knowledge."""
    sections: List[str] = []

    base = _extract_prompt_block(load_file(str(SYSTEM_PROMPT_FILE)))
    sections.append(base)

    skill_files = _list_markdown(SKILLS_DIR)
    if skill_files:
        sections.append("# SKILL FILES")
        for path in skill_files:
            content = load_file(str(path))
            sections.append(f"## {path.name}\n\n{content}")

    knowledge_files = [p for p in _list_markdown(KNOWLEDGE_DIR) if p.name.lower() != "readme.md"]
    if knowledge_files:
        sections.append("# LOCAL KNOWLEDGE")
        for path in knowledge_files:
            content = load_file(str(path))
            sections.append(f"## {path.name}\n\n{content}")

    return "\n\n---\n\n".join(sections)


def clear_cache() -> None:
    """Drop cached file contents — useful when knowledge files change on disk."""
    load_file.cache_clear()
    build_system_prompt.cache_clear()
