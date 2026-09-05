"""Behavior tests using real, disposable Git indexes and committed trees."""

import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


CHECKER = Path(__file__).with_name("check-repositories.py").resolve()
INVENTORY = ".agents/docs/organization-context.md"
PUBLIC = "vendors/cordisx/core"
PRIVATE = "vendors/cordisx/plan"
OWNERSHIP = """# Organization

## Repository ownership

This is the sole inventory.

| Repository | Visibility | Accountable owner | Authority |
| --- | --- | --- | --- |
| `cordisx/cordisxmono` | public | Mono maintainers | Organization governance |
| `cordisx/core` | public | Core maintainers | Host implementation |
| `cordisx/plan` | private | Planning maintainers | Provisional strategy |

## Other references

| Unrelated | Table |
| --- | --- |
| Not | Inventory |
"""
MODULES = """[submodule "vendors/cordisx/core"]
    path = vendors/cordisx/core
    url = https://github.com/cordisx/core.git
[submodule "vendors/cordisx/plan"]
    path = vendors/cordisx/plan
    url = https://github.com/cordisx/plan.git
    update = none
"""


class RegistrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mono-registration-test-")
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.env = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
        self.env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
        self.git("init", "--quiet")
        self.git("config", "user.name", "Registration tests")
        self.git("config", "user.email", "registration-test@example.invalid")
        self.git("commit", "--quiet", "--allow-empty", "-m", "Fixture commit")
        self.pin = self.git("rev-parse", "HEAD").strip()
        self.write(INVENTORY, OWNERSHIP)
        self.write(".gitmodules", MODULES)
        self.git("add", INVENTORY, ".gitmodules")
        self.link(PUBLIC)
        self.link(PRIVATE)
        self.git("commit", "--quiet", "-m", "Registered fixture")

    def git(self, *args):
        result = subprocess.run(
            ["git", "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false",
             "-C", str(self.repo), *args],
            env=self.env, capture_output=True, text=True, check=True,
        )
        return result.stdout

    def write(self, path, text):
        target = self.repo / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")

    def stage(self, path, text):
        self.write(path, text)
        self.git("add", path)

    def link(self, path):
        self.git("update-index", "--add", "--cacheinfo", f"160000,{self.pin},{path}")

    def check(self, *args, error=None, outside=False):
        command = [sys.executable, str(CHECKER), *args]
        if outside:
            command.extend(["--repo", str(self.repo)])
        result = subprocess.run(command, cwd=CHECKER.parent if outside else self.repo,
                                env=self.env, capture_output=True, text=True)
        if error is None:
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("PASS: 2 mounted repositories", result.stdout)
        else:
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn(error, result.stderr)
        return result

    def test_uninitialized_public_and_private_pass_index_and_revision(self):
        self.assertFalse((self.repo / "vendors").exists())
        self.check()
        self.check("--revision", "HEAD")
        self.check("--revision", "HEAD", outside=True)

    def test_worktree_changes_do_not_change_snapshot(self):
        self.write(INVENTORY, "invalid ownership")
        self.write(".gitmodules", "invalid config")
        self.check()
        self.check("--revision", "HEAD")

    def test_index_changes_do_not_change_committed_snapshot(self):
        self.stage(".gitmodules", MODULES.replace("update = none", "update = checkout"))
        self.check(error="private repository requires update = none")
        self.check("--revision", "HEAD")

    def test_revision_resolves_old_commit_consistently(self):
        self.stage(".gitmodules", MODULES.replace("update = none", "update = checkout"))
        self.git("commit", "--quiet", "-m", "Invalid fixture registration")
        self.check("--revision", "HEAD", error="private repository requires update = none")
        self.check("--revision", "HEAD~1")

    def test_missing_gitlink(self):
        self.git("update-index", "--force-remove", PUBLIC)
        self.check(error=f"missing 160000 gitlink: {PUBLIC}")
        self.check("--revision", "HEAD")

    def test_orphan_gitlink(self):
        self.link("vendors/cordisx/orphan")
        self.check(error="unregistered or misplaced gitlink: vendors/cordisx/orphan")

    def test_gitlink_outside_mount_namespace(self):
        self.link("elsewhere/core")
        self.check(error="unregistered or misplaced gitlink: elsewhere/core")

    def test_regular_blob_cannot_replace_gitlink(self):
        self.git("update-index", "--force-remove", PUBLIC)
        self.stage(PUBLIC, "This is not a submodule.")
        self.check(error=f"missing 160000 gitlink: {PUBLIC}")

    def test_ordinary_file_in_mount_namespace(self):
        self.stage("vendors/cordisx/unregistered/file.txt", "not a mount")
        self.check(error="ordinary tracked file in mount namespace")

    def test_missing_declaration(self):
        self.stage(".gitmodules", MODULES[:MODULES.index('[submodule "vendors/cordisx/plan"]')])
        self.check(error=f"missing .gitmodules declaration: {PRIVATE}")

    def test_missing_inventory_row(self):
        self.stage(INVENTORY, "\n".join(line for line in OWNERSHIP.splitlines()
                                        if "`cordisx/plan`" not in line))
        self.check(error=f"unregistered or noncanonical submodule section: {PRIVATE}")

    def test_inventory_only_row_fails(self):
        row = "| `cordisx/new-repo` | public | New repository maintainers | New product |"
        self.stage(INVENTORY, OWNERSHIP.replace("| `cordisx/plan`", row + "\n| `cordisx/plan`"))
        result = self.check(error="missing .gitmodules declaration: vendors/cordisx/new-repo")
        self.assertIn("missing 160000 gitlink: vendors/cordisx/new-repo", result.stderr)

    def test_duplicate_inventory_row(self):
        row = "| `cordisx/core` | public | Core maintainers | Host implementation |"
        self.stage(INVENTORY, OWNERSHIP.replace(row, row + "\n" + row))
        self.check(error="duplicate repository: cordisx/core")

    def test_case_variant_inventory_duplicate(self):
        row = "| `CORDISX/CORE` | public | Core maintainers | Host implementation |"
        self.stage(INVENTORY, OWNERSHIP.replace("\n## Other references", "\n" + row + "\n## Other references"))
        self.check(error="ownership section must contain exactly one table")
        self.stage(INVENTORY, OWNERSHIP.replace("| `cordisx/plan`", row + "\n| `cordisx/plan`"))
        self.check(error="duplicate repository: CORDISX/CORE")

    def test_duplicate_table(self):
        table = OWNERSHIP.split("## Repository ownership", 1)[1].split("## Other references", 1)[0]
        self.stage(INVENTORY, OWNERSHIP.replace("\n## Other references", table + "\n## Other references"))
        self.check(error="ownership section must contain exactly one table")

    def test_duplicate_ownership_section(self):
        self.stage(INVENTORY, OWNERSHIP + "\n## Repository ownership\n")
        self.check(error="expected exactly one '## Repository ownership' section")

    def test_table_shape_and_required_fields(self):
        cases = [
            ("| Visibility | Accountable owner |", "| Visibility | Owner |", "columns must be"),
            ("| public | Core maintainers |", "| internal | Core maintainers |", "invalid visibility"),
            ("| Core maintainers |", "| |", "accountable owner and authority are required"),
            ("| Host implementation |", "| |", "accountable owner and authority are required"),
            ("`cordisx/core`", "`core`", "invalid repository slug"),
            ("`cordisx/core`", "`cordisx/..`", "invalid repository slug"),
            ("| --- | --- | --- | --- |", "| --- | --- | --- |", "invalid ownership table separator"),
            ("| Host implementation |", "| Host | implementation |", "exactly four cells"),
        ]
        for before, after, error in cases:
            with self.subTest(error=error, replacement=after):
                self.stage(INVENTORY, OWNERSHIP.replace(before, after))
                self.check(error=error)

    def test_self_must_be_present_and_public(self):
        self.stage(INVENTORY, OWNERSHIP.replace("`cordisx/cordisxmono` | public", "`cordisx/cordisxmono` | private"))
        self.check(error="self repository must be registered as public")

    def test_self_cannot_be_mounted(self):
        self.link("vendors/cordisx/cordisxmono")
        self.stage(".gitmodules", MODULES + '[submodule "vendors/cordisx/cordisxmono"]\n'
                   'path = vendors/cordisx/cordisxmono\nurl = https://github.com/cordisx/cordisxmono.git\n')
        self.check(error="unregistered or noncanonical submodule section: vendors/cordisx/cordisxmono")

    def test_private_must_explicitly_skip_default_update(self):
        for setting in ("", "update = checkout", "update = merge"):
            with self.subTest(setting=setting):
                self.stage(".gitmodules", MODULES.replace("update = none", setting))
                self.check(error="private repository requires update = none")

    def test_public_default_or_explicit_checkout_only(self):
        for setting in ("none", "merge", "!execute-me"):
            with self.subTest(setting=setting):
                self.stage(".gitmodules", MODULES.replace("    path = " + PUBLIC,
                           f"    update = {setting}\n    path = {PUBLIC}"))
                self.check(error="public repository requires default checkout")
        self.stage(".gitmodules", MODULES.replace("    path = " + PUBLIC,
                   f"    update = checkout\n    path = {PUBLIC}"))
        self.check()

    def test_url_and_path_must_be_canonical(self):
        cases = [
            ("    path = " + PUBLIC + "\n", "", "path must equal"),
            ("    url = https://github.com/cordisx/core.git\n", "", "URL must be canonical"),
            ("path = " + PUBLIC, "path = vendors/cordisx/wrong", "path must equal"),
            ("https://github.com/cordisx/core.git", "git@github.com:cordisx/core.git", "URL must be canonical"),
            ("https://github.com/cordisx/core.git", "https://github.com/other/core.git", "URL must be canonical"),
            ('[submodule "' + PUBLIC + '"]', '[submodule "core"]', "noncanonical submodule section"),
            ("path = " + PRIVATE, "path = " + PUBLIC, "path must equal"),
        ]
        for before, after, error in cases:
            with self.subTest(replacement=after):
                self.stage(".gitmodules", MODULES.replace(before, after))
                self.check(error=error)

    def test_duplicate_config_section(self):
        self.stage(".gitmodules", MODULES + '\n[submodule "' + PUBLIC + '"]\n')
        self.check(error="duplicate .gitmodules section")

    def test_duplicate_config_key_is_case_insensitive(self):
        self.stage(".gitmodules", MODULES.replace("    path = " + PUBLIC,
                   "    PATH = " + PUBLIC + "\n    path = " + PUBLIC))
        self.check(error="duplicate .gitmodules field")

    def test_unsupported_or_malformed_config_fails_closed(self):
        cases = [
            (MODULES + "branch = main\n", "unsupported .gitmodules field: branch"),
            (MODULES + "ignore = all\n", "unsupported .gitmodules field: ignore"),
            (MODULES + "[include]\npath = external\n", "invalid .gitmodules syntax"),
            (MODULES + "invalid\n", "invalid .gitmodules syntax"),
            (MODULES.replace("url = https://github.com/cordisx/core.git", "url ="), "empty .gitmodules field"),
        ]
        for content, error in cases:
            with self.subTest(error=error):
                self.stage(".gitmodules", content)
                self.check(error=error)

    def test_missing_input_file_fails(self):
        self.git("update-index", "--force-remove", INVENTORY)
        self.check(error="missing regular tracked file: " + INVENTORY)

    def test_symlink_input_is_rejected(self):
        (self.repo / ".gitmodules").unlink()
        (self.repo / ".gitmodules").symlink_to(INVENTORY)
        self.git("add", ".gitmodules")
        self.check(error="missing regular tracked file: .gitmodules")

    def test_unmerged_index_fails(self):
        blob = self.git("rev-parse", ":" + INVENTORY).strip()
        self.git("update-index", "--force-remove", INVENTORY)
        subprocess.run(["git", "-C", str(self.repo), "update-index", "--index-info"],
                       input=f"100644 {blob} 1\t{INVENTORY}\n100644 {blob} 2\t{INVENTORY}\n",
                       env=self.env, text=True, check=True, capture_output=True)
        self.check(error="unmerged index entry")
        self.check("--revision", "HEAD")

    def test_unknown_revision_fails(self):
        self.check("--revision", "does-not-exist", error="FAIL:")


if __name__ == "__main__":
    unittest.main()
