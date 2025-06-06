# Historique des modifications

Ce fichier retrace l'évolution du projet et doit être mis à jour au fil du temps.
**Il est obligatoire de reporter ici chaque modification effectuée dans le projet.**

Pour chaque modification, renseignez :

- **Demande** : ce qui est souhaité ou la problématique à résoudre.
- **Objectif** : le but de la modification.
- **Résultat** : l'issue ou le changement final obtenu.

Veillez à consigner chaque entrée chronologiquement pour garder une trace claire de l'historique.

## 2025-06-05

- **Demande** : corriger un problème de sécurité lié aux sessions Express.
- **Objectif** : générer une clef aléatoire si `SESSION_SECRET` n'est pas défini et ajouter des en-têtes HTTP sécurisés.
- **Résultat** : ajout de la configuration du module **helmet**, désactivation de `X-Powered-By` et documentation de la variable `SESSION_SECRET`.

## 2025-06-05

- **Demande** : rappeler de mettre à jour `doc/fichier.md` lors des contributions.
- **Objectif** : s'assurer que chaque changement soit tracé dans l'historique du projet.
- **Résultat** : ajout d'une section "Contribuer" dans le README précisant de mettre à jour `doc/fichier.md`.

## 2025-06-06

- **Demande** : ajouter une tuile de crédits avec C02-team DRFR0bin Ghoster CODEX et Loss.
- **Objectif** : afficher les crédits depuis le menu principal.
- **Résultat** : ajout de `public/credits.html` et mise à jour de `public/apps.json` pour inclure la tuile "Crédits".

## 2025-06-07

- **Demande** : télécharger le dépôt Git à chaque mise à jour et afficher une pop-up "Importation terminée".
- **Objectif** : forcer l'import complet du dépôt et notifier l'utilisateur à la fin.
- **Résultat** : `/api/update` récupère désormais tout le dépôt avec `fetch --all` suivi d'un `reset --hard` et l'interface affiche un message lorsque l'import est terminé.

## 2025-06-08

- **Demande** : les boutons "Retour" ne réagissent pas dans le navigateur.
- **Objectif** : autoriser les gestionnaires d'événements inline utilisés par les boutons.
- **Résultat** : configuration de **helmet** pour relâcher la Content Security Policy et permettre `onclick="navigate(...)`.

## 2025-06-09

- **Demande** : présenter mieux les crédits.
- **Objectif** : afficher les noms de l'équipe de manière plus lisible.
- **Résultat** : `public/credits.html` utilise une liste stylisée pour les noms et de nouvelles règles CSS ont été ajoutées.


## 2025-06-10

- **Demande** : mieux voir la partie de démonstration derrière le menu du Pong.
- **Objectif** : rendre la fenêtre du menu plus transparente.
- **Résultat** : l'opacité du fond de `.overlay` est passée de 0.8 à 0.5.

## 2025-06-11

- **Demande** : ajouter Artmos aux crédits.
- **Objectif** : mentionner Artmos dans la liste des contributeurs.
- **Résultat** : "public/credits.html" affiche maintenant le nom Artmos.

## 2025-06-12

- **Demande** : séparer le chargeur du coeur de l'application.
- **Objectif** : isoler le serveur existant dans `app/` et créer un dossier `loader/` capable de mettre à jour `app/` via Git.
- **Résultat** : nouvelle arborescence `loader/` et `app/`, le premier servant une page de progression et gérant les mises à jour.

## 2025-06-13

- **Demande** : rafraîchir la liste après une mise à jour manuelle.
- **Objectif** : exécuter `checkUpdate()` avant de recharger les applications.
- **Résultat** : le bouton de mise à jour lance `checkUpdate()` puis re-génère les tuiles.


## 2025-06-14

- **Demande** : retirer Artmos des crédits.
- **Objectif** : ne plus afficher son nom sur la page de crédits.
- **Résultat** : "public/credits.html" ne mentionne plus Artmos.

## 2025-06-15

- **Demande** : ajouter un menu animé et des options de personnalisation pour Puissance 4.
- **Objectif** : permettre de choisir le mode de jeu, la taille de la grille et la longueur d'alignement.
- **Résultat** : nouvelle interface multi-pages dans `connect4/index.html` et logique mise à jour dans `connect4.js`.

## 2025-06-16

- **Demande** : corriger le double enregistrement du bouton "Quitter" dans Pong.
- **Objectif** : s'assurer que la sortie du jeu ne soit déclenchée qu'une seule fois.
- **Résultat** : une ligne en double a été retirée dans `pong.js`.

## 2025-06-17

- **Demande** : moderniser le jeu Pong avec des classes et de nouvelles options.
- **Objectif** : améliorer la lisibilité du code et proposer des paramètres de vitesse, une difficulté réglable, des bonus et un menu animé.
- **Résultat** : nouveaux fichiers `game.js`, `pong.js` et `pong.css` implémentant ces fonctionnalités et mise à jour de `index.html`.

## 2025-06-18

- **Demande** : rendre le nouveau code Pong plus lisible.
- **Objectif** : reformater les fichiers JavaScript et CSS pour faciliter la maintenance.
- **Résultat** : `game.js`, `pong.js` et `pong.css` sont maintenant correctement indentés et commentés.
