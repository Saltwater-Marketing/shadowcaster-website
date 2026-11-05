"""Safety check: every field used in src/pages/*.md must exist in the editor config,
otherwise the editor would silently drop it when the client saves that page."""
import yaml, glob, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
cfg = yaml.safe_load((root / "src/admin/config.yml").read_text())
pages = next(c for c in cfg["collections"] if c["name"] == "pages")
F = {f["name"]: f for f in pages["fields"]}
types = {t["name"]: t for t in F["sections"]["types"]}
problems = []
def check(val, fields, where):
    fmap = {f["name"]: f for f in fields}
    for k, v in (val or {}).items():
        if k == "type": continue
        if k not in fmap: problems.append(f"{where}: unknown field '{k}'"); continue
        f = fmap[k]
        if f["widget"] == "object" and isinstance(v, dict): check(v, f["fields"], f"{where}.{k}")
        if f["widget"] == "list" and isinstance(v, list) and "fields" in f:
            for i, it in enumerate(v):
                if isinstance(it, dict): check(it, f["fields"], f"{where}.{k}[{i}]")
for path in sorted(glob.glob(str(root / "src/pages/*.md"))):
    fm = yaml.safe_load(open(path).read().split("---")[1])
    name = pathlib.Path(path).name
    for k in fm:
        if k not in F and k not in ("layout", "noindex", "eleventyExcludeFromCollections"): problems.append(f"{name}: top-level '{k}'")
    if "hero" in fm: check(fm["hero"], F["hero"]["fields"], f"{name} hero")
    for i, s in enumerate(fm.get("sections") or []):
        t = types.get(s.get("type"))
        if not t: problems.append(f"{name} sections[{i}]: unknown type {s.get('type')}"); continue
        check(s, t["fields"], f"{name} sections[{i}]({s['type']})")
print("\n".join(problems) or "All page fields are editable.")
sys.exit(1 if problems else 0)
