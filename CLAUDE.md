# Renforts : guide du projet

Jeu mobile 3D (navigateur) en français : une armée avance seule, le joueur glisse à gauche ou à droite pour choisir des portes (+, ×, −, ÷), affronte des escouades, prend un fort. Publié sur itch.io (https://sayeng.itch.io/renforts) et en aperçu Claude (artifact).

## Architecture

- **Tout le jeu est dans `index.html`** : CSS, HTML des écrans, puis un seul `<script>` (une IIFE) avec Three.js r128.
- `index.html` est écrit pour l'aperçu Claude : **pas** de `<!doctype>`, `<html>`, `<head>` ni `<body>` (ajoutés à la publication). Garder `<title>` et la balise `claude:viewport-fit-sides` en haut.
- Three.js se charge **uniquement** depuis `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` (seul CDN autorisé). Aucune autre ressource externe sauf Google Fonts. Tout le reste (textures, sons, modèles) est **généré par le code** (canvas, géométries Three.js, WebAudio).
- `tools/build.py` fabrique `dist/web/` + `dist/renforts-web.zip` pour itch.io (remplace le CDN par `vendor/three.min.js`). Il cherche la balise CDN exacte : ne pas la modifier.
- Sauvegarde : `localStorage` clé `renforts.save` (objet `save`), toujours dans des try/catch. Ajouter des champs avec des valeurs par défaut, ne jamais casser une ancienne sauvegarde.
- Garder `window.__renforts` (state, count, d, finalD, steer, nextGate) : l'outil de test s'en sert.

## Code : repères dans le script

Réglages → Sauvegarde → Three.js (scène, ciel, montagnes) → soldats (InstancedMesh, jambes animées, ombres) → particules, corps tombés, balles traçantes → formation → textures → décors/biomes → génération d'opération (`genLevel`) → état → `buildLevel` → `syncUnits`/`formUpdate` → Son (sfx + musique générée) → Contrôles → Interface (HUD, améliorations `UPG`, menu) → Tutoriel → Pause → `step(dt)` (logique) → `win`/`lose` → `render()` → `frame()` → `start()`.

## Règles

- Interface et textes **en français**, ton direct (« Lancer l'opération », « Mission accomplie »). Pas d'emoji dans l'interface.
- Mobile d'abord : 390×844 en portrait, gros boutons, zones sûres (`env(safe-area-inset-*)`), aucun défilement horizontal.
- Performance : rester fluide sur un téléphone moyen. Utiliser `InstancedMesh` pour tout ce qui est répété, pas de shadow maps lourdes, `setPixelRatio` ≤ 2.
- Respecter `prefers-reduced-motion` (secousses, animations).
- Commentaires de code en français, courts.

## Tester

```bash
NODE_PATH=$(npm root -g) node tools/playtest.js --level 3 --seconds 90 --every 4000 --out /tmp/shots-x
```
Joue une partie dans Chromium sans écran (390×844), capture des images et termine par `ERRORS [...]`, qui doit être vide. Regarder les captures (outil Read sur les .png) pour vérifier le rendu. Options : `--save '{"recruit":20,"training":3}'`, `--menu-only`, `--size 844x390`.

Puis : `python3 tools/build.py` doit afficher `OK`.
