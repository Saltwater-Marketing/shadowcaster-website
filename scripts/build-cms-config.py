"""Turn scripts/cms-config.src.yml (readable, uses shared field groups) into src/admin/config.yml.
Run after editing the source:  python3 scripts/build-cms-config.py"""
import yaml, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
d = yaml.safe_load((root / "scripts/cms-config.src.yml").read_text())
d = {k: v for k, v in d.items() if not k.startswith("x-")}
class NoAlias(yaml.SafeDumper):
    def ignore_aliases(self, data): return True
head = "# GENERATED from scripts/cms-config.src.yml by scripts/build-cms-config.py - edit the source, not this file.\n"
(root / "src/admin/config.yml").write_text(head + yaml.dump(d, Dumper=NoAlias, sort_keys=False, allow_unicode=True, width=200))
print("wrote src/admin/config.yml")
