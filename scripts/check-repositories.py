#!/usr/bin/env python3
"""Check Mono registration from one Git index or committed snapshot, offline.

The ownership table is the inventory; .gitmodules owns canonical clone URLs;
160000 entries own pins. This does not verify remote visibility, commit
reachability, product compatibility, or initialized submodule working trees.
"""

import argparse
from pathlib import Path
import re
import subprocess
import sys


INVENTORY = ".agents/docs/organization-context.md"
SELF = "cordisx/cordisxmono"
HEADERS = ["Repository", "Visibility", "Accountable owner", "Authority"]
SLUG = re.compile(r"[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9_.-]+\Z")


class Invalid(ValueError):
    """An invalid or incomplete registration snapshot."""


def git(repo, *args):
    result = subprocess.run(
        ["git", "-C", str(repo), *args], capture_output=True, check=False
    )
    if result.returncode:
        raise Invalid(result.stderr.decode("utf-8", errors="replace").strip())
    return result.stdout


def snapshot(repo, revision):
    """Read all three inputs from the index, or one resolved commit."""
    if revision is not None:
        source = git(repo, "rev-parse", "--verify", "--end-of-options",
                     revision + "^{commit}").decode().strip()
        listing = git(repo, "ls-tree", "-r", "-z", source)
    else:
        source = "index"
        listing = git(repo, "ls-files", "--stage", "-z")
    entries = {}
    for record in listing.split(b"\0"):
        if not record:
            continue
        metadata, raw_path = record.split(b"\t", 1)
        path = raw_path.decode("utf-8")
        fields = metadata.decode("ascii").split()
        if revision is None:
            mode, oid, stage = fields
            if stage != "0":
                raise Invalid(f"unmerged index entry: {path}")
        else:
            mode, _kind, oid = fields
        if path in entries:
            raise Invalid(f"duplicate Git entry: {path}")
        if not re.fullmatch(r"(?:[0-9a-f]{40}|[0-9a-f]{64})", oid) or set(oid) == {"0"}:
            raise Invalid(f"invalid exact object ID: {path}")
        entries[path] = (mode, oid)

    def read(path):
        if path not in entries or entries[path][0] not in {"100644", "100755"}:
            raise Invalid(f"missing regular tracked file: {path}")
        # Read the listed blob directly, so even an index update cannot mix inputs.
        return git(repo, "cat-file", "blob", entries[path][1]).decode("utf-8")

    return source, entries, read(INVENTORY), read(".gitmodules")


def cells(line):
    if not line.startswith("|") or not line.endswith("|"):
        raise Invalid("ownership rows must start and end with '|'")
    return [cell.strip() for cell in line[1:-1].split("|")]


def inventory(text):
    lines = text.splitlines()
    starts = [i for i, line in enumerate(lines) if line.strip() == "## Repository ownership"]
    if len(starts) != 1:
        raise Invalid("expected exactly one '## Repository ownership' section")
    section = []
    for line in lines[starts[0] + 1:]:
        if re.match(r"^#{1,2}\s", line):
            break
        section.append(line.strip())
    groups = []
    for line in section:
        if line.startswith("|"):
            if not groups or groups[-1] is None:
                groups.append([])
            groups[-1].append(line)
        elif groups and groups[-1] is not None:
            groups.append(None)
    tables = [group for group in groups if group is not None]
    if len(tables) != 1:
        raise Invalid("ownership section must contain exactly one table")
    table = tables[0]
    if len(table) < 3 or cells(table[0]) != HEADERS:
        raise Invalid("ownership table columns must be: " + " | ".join(HEADERS))
    separators = cells(table[1])
    if len(separators) != 4 or any(not re.fullmatch(r":?-{3,}:?", c) for c in separators):
        raise Invalid("invalid ownership table separator")
    repositories = {}
    seen = set()
    for line in table[2:]:
        row = cells(line)
        if len(row) != 4:
            raise Invalid("ownership row must contain exactly four cells")
        name, visibility, owner, authority = row
        if name.startswith("`") and name.endswith("`"):
            name = name[1:-1]
        if not SLUG.fullmatch(name) or name.split("/")[1] in {".", ".."}:
            raise Invalid(f"invalid repository slug: {name!r}")
        if name.casefold() in seen:
            raise Invalid(f"duplicate repository: {name}")
        seen.add(name.casefold())
        if visibility not in {"public", "private"}:
            raise Invalid(f"invalid visibility for {name}: {visibility!r}")
        if not owner.strip("` ") or not authority.strip("` "):
            raise Invalid(f"accountable owner and authority are required: {name}")
        repositories[name] = visibility
    if repositories.get(SELF) != "public":
        raise Invalid(f"self repository must be registered as public: {SELF}")
    return repositories


def modules(text):
    """Parse the deliberately small, literal .gitmodules format used by Mono.

    No includes, commands, branch tracking, multiline values, aliases, or
    unknown fields: supported fields are path, url, and optional update.
    """
    result = {}
    current = None
    for number, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith(("#", ";")):
            continue
        section = re.fullmatch(r'\[submodule "([^"\\]+)"\]', line)
        if section:
            current = section.group(1)
            if current in result:
                raise Invalid(f"duplicate .gitmodules section: {current}")
            result[current] = {}
            continue
        field = re.fullmatch(r"([A-Za-z][A-Za-z0-9-]*)\s*=\s*(.*)", line)
        if current is None or field is None:
            raise Invalid(f"invalid .gitmodules syntax at line {number}")
        key, value = field.groups()
        key = key.lower()
        if key not in {"path", "url", "update"}:
            raise Invalid(f"unsupported .gitmodules field: {key}")
        if key in result[current]:
            raise Invalid(f"duplicate .gitmodules field: {current}.{key}")
        if not value:
            raise Invalid(f"empty .gitmodules field: {current}.{key}")
        result[current][key] = value
    return result


def validate(entries, repositories, declarations):
    expected = {f"vendors/{name}": name for name in repositories if name != SELF}
    actual_links = {path for path, (mode, _oid) in entries.items() if mode == "160000"}
    problems = []
    for path in sorted(set(declarations) - set(expected)):
        problems.append(f"unregistered or noncanonical submodule section: {path}")
    for path in sorted(set(expected) - set(declarations)):
        problems.append(f"missing .gitmodules declaration: {path}")
    for path in sorted(actual_links - set(expected)):
        problems.append(f"unregistered or misplaced gitlink: {path}")
    for path in sorted(set(expected) - actual_links):
        problems.append(f"missing 160000 gitlink: {path}")
    for path, (mode, _oid) in entries.items():
        if path.startswith("vendors/") and mode != "160000":
            problems.append(f"ordinary tracked file in mount namespace: {path}")
    for path, name in expected.items():
        if path not in declarations:
            continue
        fields = declarations[path]
        if fields.get("path") != path:
            problems.append(f"path must equal canonical section name: {path}")
        if fields.get("url") != f"https://github.com/{name}.git":
            problems.append(f"URL must be canonical HTTPS URL: {path}")
        if repositories[name] == "private":
            if fields.get("update") != "none":
                problems.append(f"private repository requires update = none: {path}")
        elif fields.get("update", "checkout") != "checkout":
            problems.append(f"public repository requires default checkout: {path}")
    if problems:
        raise Invalid("\n".join(problems))
    return len(expected)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path.cwd(), help="Mono checkout (default: cwd)")
    parser.add_argument("--revision", help="check a committed ref instead of the Git index")
    args = parser.parse_args()
    try:
        source, entries, ownership, gitmodules = snapshot(args.repo, args.revision)
        count = validate(entries, inventory(ownership), modules(gitmodules))
    except (Invalid, UnicodeError, OSError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1
    print(f"PASS: {count} mounted repositories plus {SELF}; snapshot={source}")
    print("Offline registration check only; remote state and product compatibility are not verified.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
