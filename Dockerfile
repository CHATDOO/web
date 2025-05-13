# Utiliser une image Node.js officielle comme base
FROM node:18

# Créer et définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier les fichiers du projet
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["npm", "start"]