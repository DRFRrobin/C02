# C02 Group App Launcher

Ce dépôt contient une petite interface web permettant de lancer différentes applications du groupe C02.

## Prérequis

Installez **Node.js** pour lancer le serveur Express qui stocke désormais les utilisateurs côté serveur.

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
   Puis lancez le serveur :
   ```bash
   npm start
   ```
2. Dans votre navigateur, rendez‑vous sur [http://localhost:3000/index.html](http://localhost:3000/index.html).
3. Les tuiles disponibles s'affichent automatiquement à partir du fichier `apps.json`.

Lors du premier lancement, un utilisateur **admin/admin** est créé automatiquement. Une petite fenêtre de connexion s'affiche : saisissez ces identifiants pour accéder à la plateforme.
Il est désormais possible de créer d'autres comptes directement depuis l'écran de connexion grâce au bouton **"Créer un compte"**. Une fois connecté, un bouton **"Déconnexion"** apparaît en haut à droite pour revenir à l'écran de connexion.

## Fonctionnement

- **Mise à jour** : la page lit le fichier `apps.json` pour afficher les applications. Le bouton "Paramètres" permet d'activer la mise à jour automatique ou d'exécuter une mise à jour manuelle.
- **Jeux** : la tuile "C02 Games" mène à un sous‑menu mis à jour automatiquement à chaque chargement. La liste est construite en scannant les fichiers HTML du dossier `games`. On y trouve un Pong jouable en solo ou à deux sur le même clavier, un Puissance 4 jouable en 1v1 ou contre l'ordinateur, ainsi que le jeu "Emoji Catcher".
- **Discord** : la tuile "C02 Discord" ouvrira le lien vers le serveur [Discord](https://discord.gg/AD6DvdaRyR).
- **Gestion Users** : disponible uniquement pour les administrateurs, permet d'ajouter, modifier ou supprimer les comptes enregistrés côté serveur.
- **Déconnexion** : un bouton en haut à droite permet de quitter la session courante.

Vérifiez la présence de Node si besoin pour d'autres outils :
```bash
node -v
```

