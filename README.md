# Renforts

Jeu mobile 3D (navigateur) : ton armée avance seule, tu glisses à gauche ou à droite pour choisir tes portes (+, ×, −, ÷), tu écrases les escouades ennemies et tu prends le fort.

## Jouer
Ouvre `index.html` dans un navigateur (ordinateur ou téléphone).

- Glisser le doigt / la souris, ou flèches / Q-D : diriger l'armée
- Médailles gagnées à chaque victoire : recruter des soldats au départ

## Technique
- Un seul fichier `index.html`, [Three.js r128](https://threejs.org/) chargé depuis cdnjs
- Niveaux générés automatiquement (difficulté croissante)
- Sauvegarde de la progression dans le navigateur (localStorage)

## Feuille de route
- v0.2 : sensations (secousses, ralenti, effets), musique, bonus de fin
- v0.3 : améliorations au camp, types de soldats, pièges, boss, décors
- v1.0 : publication web (itch.io) puis Android / iPhone
