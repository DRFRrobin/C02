# Historique des modifications

Ce fichier retrace l'évolution du projet et doit être mis à jour au fil du temps.
**Il est obligatoire de reporter ici chaque modification effectuée dans le projet.**

Pour chaque modification, renseignez :

- **Demande** : ce qui est souhaité ou la problématique à résoudre.
- **Objectif** : le but de la modification.
- **Résultat** : l'issue ou le changement final obtenu.

Veillez à consigner chaque entrée chronologiquement pour garder une trace claire de l'historique.
Depuis la PR #70, le titre de chaque entrée indique le numéro de la pull request,
par exemple `## PR 70`.

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

- **Demande** : empêcher l'injection de code HTML via les noms des joueurs dans l'historique de Pong.
- **Objectif** : sécuriser l'affichage des entrées d'historique.
- **Résultat** : `pong.js` construit désormais chaque entrée avec `textContent` au lieu de `innerHTML`.

## 2025-06-18

- **Demande** : enrichir le Pong avec une nouvelle version plus modulable.
- **Objectif** : réécrire le jeu avec des classes pour faciliter les évolutions et ajouter des options de vitesse, une IA réglable et des power-ups.
- **Résultat** : nouveaux fichiers `engine.js`, `pong.js` et `pong.css` avec un menu animé et la prise en charge des nouvelles options.

## 2025-06-19
- **Demande** : centrer l'affichage du menu de Pong.
- **Objectif** : s'assurer que la fenetre de menu apparaisse toujours au milieu de l'ecran.
- **Resultat** : la classe `.overlay` utilise desormais Flexbox pour placer son contenu au centre.

## 2025-06-20
- **Demande** : pouvoir tester une branche ou une pull request avant son intégration.
- **Objectif** : choisir la référence Git à récupérer lors d'une mise à jour.
- **Résultat** : l'API `/api/update` accepte maintenant les paramètres `branch` ou `pr` pour pointer vers la branche ou la pull request désirée.

## 2025-06-21
- **Demande** : ajouter une tuile pour tester une pull request.
- **Objectif** : sélectionner le numéro de PR à utiliser lors de la mise à jour.
- **Résultat** : nouvelle page `update.html` accessible via la tuile "Tester une PR" et appel de `/api/update?pr=`.

## 2025-06-22
- **Demande** : intégrer une page YouTube dans l'application.
- **Objectif** : ajouter une tuile permettant d'accéder à un lecteur YouTube intégré.
- **Résultat** : nouvelle page `youtube.html` et entrée correspondante dans `apps.json`.

## 2025-06-23
- **Demande** : valider le numéro de pull request envoyé à `/api/update`.
- **Objectif** : empêcher l'appel avec une valeur non numérique.
- **Résultat** : les serveurs renvoient `400` si `pr` n'est pas un nombre et la documentation précise cette contrainte.

## 2025-06-24
- **Demande** : indiquer clairement quelle branche ou pull request est chargée.
- **Objectif** : savoir depuis le menu principal si l'application teste une PR.
- **Résultat** : ajout d'un fichier `current.json`, d'un endpoint `/api/status` et affichage de l'information dans le menu.

## 2025-06-25
- **Demande** : choisir une pull request parmi les cinq dernières et pouvoir la charger ou la décharger.
- **Objectif** : faciliter les tests des PRs directement depuis l'interface.
- **Résultat** : `update.html` liste les cinq dernières PRs grâce à l'endpoint `/api/prs` et propose les boutons **Charger la PR** et **Décharger**.

## 2025-06-26
- **Demande** : signaler une erreur lorsque la liste des PR ne peut pas être récupérée.
- **Objectif** : informer l'utilisateur en cas d'échec du chargement des PRs.
- **Résultat** : `update.js` affiche un message d'erreur si la requête `/api/prs` échoue.

## 2025-06-27
- **Demande** : ajouter un système de logs et corriger les erreurs lors de la récupération des PR.
- **Objectif** : tracer les actions du serveur et éviter l'affichage de "Erreur lors du chargement des pull requests.".
- **Résultat** : nouvelle librairie `logger.js`, rotation automatique des fichiers, journalisation des routes principales et meilleure gestion des réponses GitHub.

## PR 70
- **Demande** : afficher correctement les cinq dernières pull requests.
- **Objectif** : lister les PR récentes dans `update.html` pour faciliter les tests.
- **Résultat** : `getLatestPRs` interroge GitHub avec les options `state=all`, `sort=updated` et `direction=desc`.

