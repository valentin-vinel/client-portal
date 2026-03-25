# Client Portal
 
API REST permettant le suivi de projet en temps réel pour les freelances. Les clients se connectent et accèdent aux étapes du projet, aux documents, aux comptes rendus et aux livrables.
 
Projet personnel, stack orientée backend/ops : NestJS, PostgreSQL, Prisma 7, Docker, CI/CD GitHub Actions, déploiement AWS.
 
## Stack technique
 
| Catégorie | Technologie |
|---|---|
| Framework | [NestJS](https://nestjs.com/) |
| Langage | TypeScript |
| Base de données | PostgreSQL 17 |
| ORM | Prisma 7 |
| Authentification | JWT + Passport |
| Validation | class-validator |
| Conteneurisation | Docker / Docker Compose |
| CI/CD | GitHub Actions *(à venir)* |
| Cloud | AWS ECS, RDS, S3 *(à venir)* |
 
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
JWT_SECRET="ton_secret_jwt_long_et_complexe"
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
| `npm run test:e2e` | Lance les tests d'intégration |
| `npm run test:cov` | Lance les tests avec couverture de code |
| `npx prisma studio` | Ouvre l'interface visuelle de la base de données |
| `npx prisma migrate dev` | Crée et applique une nouvelle migration |
 
## Structure du projet
 
```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt-auth.guard.ts
│   ├── jwt.strategy.ts
│   ├── roles.decorator.ts
│   └── roles.guard.ts
├── common/
│   └── filters/
│       └── http-exception.filter.ts
├── documents/
│   ├── dto/
│   │   ├── create-document.dto.ts
│   │   └── update-document.dto.ts
│   ├── documents.controller.ts
│   ├── documents.module.ts
│   └── documents.service.ts
├── projects/
│   ├── dto/
│   │   ├── create-project.dto.ts
│   │   └── update-project.dto.ts
│   ├── projects.controller.ts
│   ├── projects.module.ts
│   └── projects.service.ts
├── reports/
│   ├── dto/
│   │   ├── create-report.dto.ts
│   │   └── update-report.dto.ts
│   ├── reports.controller.ts
│   ├── reports.module.ts
│   └── reports.service.ts
├── steps/
│   ├── dto/
│   │   ├── create-step.dto.ts
│   │   └── update-step.dto.ts
│   ├── steps.controller.ts
│   ├── steps.module.ts
│   └── steps.service.ts
├── app.module.ts
├── main.ts
└── prisma.service.ts
prisma/
├── schema.prisma
└── migrations/
docker-compose.yml
prisma.config.ts
```
 
## Modèle de données
 
```
User
├── id, email, password, role (admin | client)
└── projects[]
 
Project
├── id, name, client, status, userId
├── steps[]
├── reports[]
└── documents[]
 
Step
└── id, title, description, status, order, projectId
 
Report
└── id, title, content, projectId
 
Document
└── id, name, url, type, projectId
```
 
## API
 
### Authentification
 
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `POST` | `/auth/register` | Créer un compte | Public |
| `POST` | `/auth/login` | Se connecter | Public |
 
### Projets
 
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/projects` | Liste des projets | Authentifié |
| `GET` | `/projects/:id` | Détail d'un projet avec étapes, documents et comptes rendus | Authentifié |
| `POST` | `/projects` | Créer un projet | Admin |
| `PATCH` | `/projects/:id` | Modifier un projet | Admin |
| `DELETE` | `/projects/:id` | Supprimer un projet | Admin |
 
### Étapes
 
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/projects/:projectId/steps` | Liste des étapes d'un projet | Authentifié |
| `POST` | `/projects/:projectId/steps` | Créer une étape | Admin |
| `PATCH` | `/projects/:projectId/steps/:id` | Modifier une étape | Admin |
| `DELETE` | `/projects/:projectId/steps/:id` | Supprimer une étape | Admin |
 
### Comptes rendus
 
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/projects/:projectId/reports` | Liste des comptes rendus | Authentifié |
| `GET` | `/projects/:projectId/reports/:id` | Détail d'un compte rendu | Authentifié |
| `POST` | `/projects/:projectId/reports` | Créer un compte rendu | Admin |
| `PATCH` | `/projects/:projectId/reports/:id` | Modifier un compte rendu | Admin |
| `DELETE` | `/projects/:projectId/reports/:id` | Supprimer un compte rendu | Admin |
 
### Documents
 
| Méthode | Route | Description | Accès |
|---|---|---|---|
| `GET` | `/projects/:projectId/documents` | Liste des documents | Authentifié |
| `GET` | `/projects/:projectId/documents/:id` | Détail d'un document | Authentifié |
| `POST` | `/projects/:projectId/documents` | Ajouter un document | Admin |
| `PATCH` | `/projects/:projectId/documents/:id` | Modifier un document | Admin |
| `DELETE` | `/projects/:projectId/documents/:id` | Supprimer un document | Admin |
 
## Sécurité
 
- Authentification par JWT (expiration 7 jours)
- Hashage des mots de passe avec bcrypt
- Système de rôles `admin` / `client`
- Filtrage des projets par utilisateur connecté — un client ne voit que ses propres projets
- Validation et sanitisation des données entrantes avec `class-validator` et `whitelist: true`
- Gestion centralisée des erreurs avec codes HTTP appropriés (400, 401, 403, 404, 500)
 
## Roadmap
 
- [x] CRUD complet sur les projets
- [x] Authentification JWT (register / login)
- [x] Système de rôles admin / client
- [x] Étapes de projet avec statuts et ordre
- [x] Comptes rendus mensuels
- [x] Documents liés aux projets
- [x] Gestion des erreurs HTTP propres
- [ ] Pagination sur les listes
- [ ] Upload de fichiers réels (AWS S3)
- [ ] Documentation Swagger
- [ ] Tests unitaires
- [ ] Tests d'intégration (e2e)
- [ ] CI/CD GitHub Actions
- [ ] Déploiement AWS (ECS, RDS, S3)
- [ ] Front-end Next.js
 
## Licence
 
MIT