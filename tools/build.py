"""Fabrique une version autonome du jeu dans dist/web/ et l'archive dist/renforts-web.zip.

index.html est écrit pour l'aperçu Claude (sans <html>/<head>, Three.js depuis cdnjs).
Ce script l'emballe dans une vraie page HTML et utilise la copie locale de Three.js
(vendor/three.min.js), pour itch.io et la future application mobile.

Utilisation : python3 tools/build.py
"""
import pathlib
import shutil
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = DIST / "web"
CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'

src = (ROOT / "index.html").read_text(encoding="utf-8")
if CDN not in src:
    raise SystemExit("Balise Three.js introuvable dans index.html")
body = src.replace(CDN, '<script src="three.min.js"></script>')

page = (
    "<!doctype html>\n<html lang=\"fr\">\n<head>\n"
    "<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover\">\n"
    "<meta name=\"theme-color\" content=\"#a9cbe0\">\n"
    "</head>\n<body>\n" + body + "\n</body>\n</html>\n"
)

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)
(OUT / "index.html").write_text(page, encoding="utf-8")
shutil.copy(ROOT / "vendor" / "three.min.js", OUT / "three.min.js")
shutil.copy(ROOT / "vendor" / "three-LICENSE.txt", OUT / "three-LICENSE.txt")

archive = DIST / "renforts-web.zip"
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(OUT.iterdir()):
        z.write(f, f.name)
print(f"OK : {archive.relative_to(ROOT)} ({archive.stat().st_size // 1024} Ko)")
