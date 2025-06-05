# Installer et utiliser Node.js

Ce projet s'appuie sur Node.js pour exécuter le serveur Express et gérer les dépendances via **npm**. Voici la procédure recommandée.

## Installation

### Sous Linux (Debian/Ubuntu)
```bash
sudo apt update
sudo apt install nodejs npm
```
La version des paquets officiels est généralement suffisante. Vous pouvez vérifier l'installation avec :
```bash
node -v
npm -v
```

### Sous Windows ou macOS
1. Rendez-vous sur [https://nodejs.org/](https://nodejs.org/) et téléchargez la version LTS recommandée.
2. Lancez l'installateur puis suivez les étapes.
3. Ouvrez ensuite un terminal (PowerShell, cmd ou Terminal.app) et vérifiez la présence de Node :
```bash
node -v
npm -v
```

## Utilisation dans ce projet

Une fois Node installé, placez-vous à la racine du dépôt et installez les dépendances du projet :
```bash
npm install
```
Puis lancez le serveur local :
```bash
npm start
```
Le site est alors accessible à l'adresse [http://localhost:3000/index.html](http://localhost:3000/index.html).

Si vous modifiez le code, redémarrez simplement `npm start` pour recharger le serveur.
