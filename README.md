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
- v0.2 ✅ : secousses de caméra, textes flottants aux portes, ralenti et confettis à la victoire, marche militaire, prime du fort (multiplicateur de médailles)
- v0.3 ✅ : améliorations au camp (Recrues, Entraînement, Butin), caisses de renfort, champs de mines, Général géant toutes les 5 opérations, décors Plaine / Désert / Neige
- v0.4 ✅ : tutoriel (indices la première fois que chaque élément apparaît), pause (bouton, Échap/P, pause automatique quand on quitte l'appli)
- v1.0 : publication web (itch.io) puis Android / iPhone
