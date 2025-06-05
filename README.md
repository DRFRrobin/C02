# C02 Group App Launcher

Ce dépôt contient une petite interface web permettant de lancer différentes applications du groupe C02. Toutes les ressources côté client se trouvent dans le dossier `public/`.

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
   Puis lancez le serveur :
   ```bash
   npm start
   ```
2. Dans votre navigateur, rendez‑vous sur [http://localhost:3000/index.html](http://localhost:3000/index.html).
3. Les tuiles disponibles s'affichent automatiquement à partir du fichier `public/apps.json`.

Lors du premier lancement, un utilisateur **admin/admin** est créé automatiquement. Les mots de passe sont maintenant chiffrés avec **bcrypt** et les mots de passe existants sont convertis au premier démarrage.
Une petite fenêtre de connexion s'affiche : saisissez ces identifiants pour accéder à la plateforme.
Il est désormais possible de créer d'autres comptes directement depuis l'écran de connexion grâce au bouton **"Créer un compte"**. Une fois connecté, un bouton **"Déconnexion"** apparaît en haut à droite pour revenir à l'écran de connexion.

## Fonctionnement

- **Mise à jour** : la page lit le fichier `apps.json` pour afficher les applications. Le bouton "Paramètres" permet d'activer la mise à jour automatique ou d'exécuter une mise à jour manuelle.
- **Jeux** : la tuile "C02 Games" mène à un sous‑menu mis à jour automatiquement à chaque chargement. La liste est construite en scannant les fichiers HTML du dossier `public/games`. On y trouve un Pong jouable en solo ou à deux sur le même clavier, un Puissance 4 jouable en 1v1 ou contre l'ordinateur, ainsi que le jeu "Emoji Catcher".
- **Discord** : la tuile "C02 Discord" ouvrira le lien vers le serveur [Discord](https://discord.gg/AD6DvdaRyR).
- **Gestion Users** : disponible uniquement pour les administrateurs, permet d'ajouter, modifier ou supprimer les comptes enregistrés côté serveur.
- **Déconnexion** : un bouton en haut à droite permet de quitter la session courante.

Vérifiez la présence de Node si besoin pour d'autres outils :
```bash
node -v
```

