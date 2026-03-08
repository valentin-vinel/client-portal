# Client Portal

Portail client permettant le suivi de projet en temps réel. Les clients peuvent se connecter et accéder aux étapes du projet, aux livrables, aux comptes rendus et aux vidéos explicatives.

## Stack technique

- **Framework** : [NestJS](https://nestjs.com/)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL
- **ORM** : Prisma 7
- **Environnement DB** : Docker

## Prérequis

- Node.js >= 18
- Docker Desktop
- npm

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ton-user/client-portal.git
cd client-portal
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Copie le fichier `.env.example` en `.env` et renseigne les valeurs :

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/client_portal"
```

### 4. Lancer la base de données

```bash
docker-compose up -d
```

### 5. Lancer les migrations

```bash
npx prisma migrate dev
```

### 6. Générer le client Prisma

```bash
npx prisma generate
```

### 7. Lancer le serveur

```bash
npm run start:dev
```

Le serveur est accessible sur `http://localhost:3000`.

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run start:dev` | Lance le serveur en mode watch |
| `npm run start:prod` | Lance le serveur en production |
| `npm run build` | Compile le projet |
| `npm run test` | Lance les tests unitaires |
| `npx prisma studio` | Ouvre l'interface visuelle de la base de données |
| `npx prisma migrate dev` | Crée et applique une nouvelle migration |

## Structure du projet

```
src/
├── projects/
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   └── projects.module.ts
├── prisma.service.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
prisma/
├── schema.prisma
└── migrations/
docker-compose.yml
prisma.config.ts
```

## API

### Projects

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/projects` | Récupère tous les projets |

> D'autres endpoints seront ajoutés au fur et à mesure du développement.

## Roadmap

- [ ] CRUD complet sur les projets
- [ ] Authentification (JWT)
- [ ] Gestion des rôles (admin / client)
- [ ] Étapes de projet avec statuts
- [ ] Upload de vidéos explicatives
- [ ] Comptes rendus mensuels
- [ ] Notifications

## Licence

MIT