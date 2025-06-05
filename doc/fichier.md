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

