# C02 Group App Launcher

Ce dépôt contient une petite interface web permettant de lancer différentes applications du groupe C02.

## Installer Python

Assurez-vous de disposer d'une version récente de **Python** pour pouvoir lancer le serveur local.

- **Linux (Debian/Ubuntu)** :
  ```bash
  sudo apt update
  sudo apt install python3
  ```
- **Windows** : [Téléchargez l'installeur](https://www.python.org/downloads/windows/) et suivez les étapes.
- **macOS** : [Téléchargez l'installeur](https://www.python.org/downloads/macos/) ou utilisez Homebrew :
  ```bash
  brew install python
  ```

## Tester en local

1. Ouvrez un terminal dans ce dossier et lancez un serveur web local :
   ```bash
   python3 -m http.server
   ```
2. Dans votre navigateur, rendez‑vous sur [http://localhost:8000/index.html](http://localhost:8000/index.html).
3. Les tuiles disponibles s'affichent automatiquement à partir du fichier `apps.json`.

Lors du premier lancement, un utilisateur **admin/admin** est créé automatiquement. Une petite fenêtre de connexion s'affiche : saisissez ces identifiants pour accéder à la plateforme.
Il est désormais possible de créer d'autres comptes directement depuis l'écran de connexion grâce au bouton **"Créer un compte"**. Une fois connecté, un bouton **"Déconnexion"** apparaît en haut à droite pour revenir à l'écran de connexion.

## Fonctionnement

- **Mise à jour** : la page lit le fichier `apps.json` pour afficher les applications. Le bouton "Paramètres" permet d'activer la mise à jour automatique ou d'exécuter une mise à jour manuelle.
- **Jeux** : la tuile "C02 Games" mène à un sous‑menu listé dans `games/games.json`. On y trouve actuellement un Pong fonctionnel et un futur Puissance 4.
- **Discord** : la tuile "C02 Discord" ouvrira le lien vers le serveur (l'URL reste à renseigner).
- **Gestion Users** : disponible uniquement pour les administrateurs, permet d'ajouter, modifier ou supprimer des comptes enregistrés dans `localStorage`.
- **Déconnexion** : un bouton en haut à droite permet de quitter la session courante.

Vérifiez la présence de Node si besoin pour d'autres outils :
```bash
node -v
```

