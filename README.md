# C02 Group App Launcher

Ce dépôt contient une petite interface web permettant de lancer différentes applications du groupe C02.
L'architecture est désormais découpée en deux parties :
`loader/` héberge un serveur minimal chargé de mettre à jour l'application et
`app/` contient l'interface principale.
Toutes les ressources côté client se trouvent maintenant dans le dossier
`app/public/`.

## Prérequis

Installez **Node.js** pour lancer le serveur Express qui stocke désormais les utilisateurs côté serveur.
Les dépendances incluent maintenant le module **bcrypt** pour le hachage des mots de passe.

- **Linux (Debian/Ubuntu)** :
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```
- **Windows/macOS** : [Téléchargez Node.js](https://nodejs.org/) et suivez l'installeur.
Pour des informations détaillées, consultez [doc/node-installation.md](doc/node-installation.md).

## Tester en local

1. Ouvrez un terminal dans ce dossier et installez les dépendances :
   ```bash
   npm install
   ```
   Vous pouvez définir la variable d'environnement `SESSION_SECRET` pour
   personnaliser la clef utilisée par la session Express :
   ```bash
   export SESSION_SECRET="votre_cle"
   ```
   Depuis cette mise à jour, le serveur utilise le middleware **helmet** et
   l'en-tête `X-Powered-By` est désactivé pour renforcer la sécurité.
2. Lancez l'application (mise à jour puis démarrage automatique) :
   ```bash
   npm start
   ```
   Au bout de quelques secondes, la page de connexion est disponible sur
   [http://localhost:3000/index.html](http://localhost:3000/index.html).
3. Les tuiles disponibles s'affichent automatiquement à partir du fichier `app/public/apps.json`.

Lors du premier lancement, un utilisateur **admin/admin** est créé automatiquement. Les mots de passe sont maintenant chiffrés avec **bcrypt** et les mots de passe existants sont convertis au premier démarrage.
Une petite fenêtre de connexion s'affiche : saisissez ces identifiants pour accéder à la plateforme.
Il est désormais possible de créer d'autres comptes directement depuis l'écran de connexion grâce au bouton **"Créer un compte"**. Une fois connecté, un bouton **"Déconnexion"** apparaît en haut à droite pour revenir à l'écran de connexion.

## Fonctionnement

- **Mise à jour** : la page lit le fichier `app/public/apps.json` pour afficher les applications. Le bouton "Paramètres" permet d'activer la mise à jour automatique ou d'exécuter une mise à jour manuelle. Il est désormais possible de préciser la branche via `branch=` ou le numéro de pull request via `pr=` lors de l'appel à `/api/update`.
- **Jeux** : la tuile "C02 Games" mène à un sous‑menu mis à jour automatiquement à chaque chargement. La liste est construite en scannant les fichiers HTML du dossier `app/public/games`. On y trouve un Pong jouable en solo ou à deux sur le même clavier, un Puissance 4 jouable en 1v1 ou contre l'ordinateur, ainsi que le jeu "Emoji Catcher".
- **Discord** : la tuile "C02 Discord" ouvrira le lien vers le serveur [Discord](https://discord.gg/AD6DvdaRyR).
- **Cha\u00eene YouTube** : permet de consulter une vid\u00e9o depuis une page int\u00e9gr\u00e9e.
- **Tester une PR** : la tuile "Tester une PR" permet de saisir un num\u00e9ro de pull request et lance `/api/update?pr=` pour mettre l'application \u00e0 jour depuis cette PR.
- **Gestion Users** : disponible uniquement pour les administrateurs, permet d'ajouter, modifier ou supprimer les comptes enregistrés côté serveur.
- **Déconnexion** : un bouton en haut à droite permet de quitter la session courante.

Vérifiez la présence de Node si besoin pour d'autres outils :
```bash
node -v
```

## Contribuer

Avant de proposer une modification, mettez à jour le fichier
[doc/fichier.md](doc/fichier.md) afin de conserver une trace de l'historique du
projet.

