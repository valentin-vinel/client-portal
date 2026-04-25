# Contributing — Client Portal API

Guide de développement local pour le projet client-portal.

## Prérequis

- Node.js >= 20
- Docker Desktop
- npm

## Installation

```bash
git clone https://github.com/ton-user/client-portal.git
cd client-portal
npm install
npx prisma generate
```

Configure les variables d'environnement :

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/client_portal"
JWT_SECRET="ton_secret_jwt"
RESEND_API_KEY="ta_clé_resend"
FRONTEND_URL="http://localhost:3001"
```

## Démarrage

```bash
# Démarrer les bases de données
docker-compose up -d

# Appliquer les migrations
npx prisma migrate dev

# Lancer le serveur
npm run start:dev
```

Le serveur tourne sur `http://localhost:3000`.
La documentation Swagger est accessible sur `http://localhost:3000/api`.

## Base de données

Deux bases PostgreSQL tournent via Docker :

| Container | Port | Base | Usage |
|---|---|---|---|
| `db` | 5432 | `client_portal` | Développement |
| `db_test` | 5433 | `client_portal_test` | Tests e2e |

### Créer une migration

```bash
npx prisma migrate dev --name nom_de_la_migration
npx prisma generate
```

### Visualiser la base

```bash
npx prisma studio
```

## Tests

### Tests unitaires

```bash
npm run test
npm run test:cov  # avec couverture de code
```

### Tests e2e

**Workflow complet — à suivre dans cet ordre :**

```bash
# 1. Démarrer Docker (obligatoire)
docker-compose up -d

# 2. Appliquer les migrations sur la base de test (uniquement si nouvelle migration)
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/client_portal_test" npx prisma migrate deploy

# 3. Régénérer le client Prisma (uniquement si schema modifié)
npx prisma generate

# 4. Lancer les tests e2e
npm run test:e2e
```

> **Règle importante** — les étapes 2 et 3 sont uniquement nécessaires après une modification du schema Prisma. En temps normal, seules les étapes 1 et 4 sont nécessaires.

> **Sécurité** — les tests e2e tournent exclusivement sur la base `client_portal_test` (port 5433). Un guard vérifie au démarrage que l'URL contient `_test` et refuse de tourner sinon. La base de dev ne sera jamais touchée.

### Tous les tests

```bash
npm run test && npm run test:e2e
```

## Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://postgres:postgres@localhost:5432/client_portal` |
| `JWT_SECRET` | Secret pour signer les tokens JWT | `un_secret_long_et_complexe` |
| `RESEND_API_KEY` | Clé API Resend pour les emails | `re_xxxxx` |
| `FRONTEND_URL` | URL du frontend pour les liens d'invitation | `http://localhost:3001` |

## CI/CD

La pipeline GitHub Actions se déclenche automatiquement sur chaque push sur `master` ou `develop`. Elle exécute dans l'ordre :

1. Installation des dépendances
2. Génération du client Prisma
3. Tests unitaires
4. Migrations sur la base de test
5. Tests e2e

Les secrets `JWT_SECRET` et `RESEND_API_KEY` sont configurés dans **GitHub → Settings → Secrets and variables → Actions**.

## Structure du projet

```
src/
├── auth/         ← Authentification JWT, register, login, set-password
├── common/       ← Filtres, DTOs partagés (pagination)
├── documents/    ← CRUD documents liés aux projets
├── mail/         ← Service d'envoi d'emails (Resend)
├── projects/     ← CRUD projets avec filtrage par rôle
├── reports/      ← CRUD comptes rendus
├── steps/        ← CRUD étapes de projet
├── users/        ← Gestion des utilisateurs et création de clients
└── prisma.service.ts
test/
├── auth.e2e-spec.ts
├── project.e2e-spec.ts
├── steps.e2e-spec.ts
├── reports.e2e-spec.ts
└── documents.e2e-spec.ts
```