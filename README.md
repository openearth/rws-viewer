# OpenEarth Viewer

The [OpenEarth Viewer](https://rws-viewer.netlify.app/) gives insight in a wide variety of marine data. It is configured to be loaded into a variety of different websites and cater specific layer data to each individual client.

[![Netlify Status](https://api.netlify.com/api/v1/badges/119b8ff3-5b22-4995-b43b-b31f21ba77c3/deploy-status)](https://app.netlify.com/sites/rws-viewer/deploys)

## Getting started

- Clone [this repository](https://github.com/openearth/rws-viewer):

```sh
git clone git@github.com:openearth/rws-viewer.git
cd rws-viewer
npm install --legacy-peer-deps
```

- Copy `.env.example` to `.env`. And set all variables.

### Local development

```sh
npm run dev
```

## Migrations

This project uses [DatoCMS migrations](https://www.datocms.com/docs/content-management-api/migrations) for managing the models and moving data around in the DatoCMS instances. It uses custom scripts to generate the migrations, and to apply them.

### Create Migration (`migrations:create`)

**File:** `scripts/dato/create.ts`

This script creates a new migration file for DatoCMS.

- Prompts the user for a migration name.
- Uses the current DatoCMS instance specified in the environment variable `DATO_INSTANCE_CURRENT`.
- Creates a new migration file using the DatoCMS CLI.

Usage:

```bash
npm run migrations:create
```

### Apply Migrations (`migrations:apply`)

**File:** `scripts/dato/run.ts`

This script applies migrations to the staging environment for all configured DatoCMS instances.

For each instance:

1. Sets up a staging environment.
2. Destroys the existing staging environment if it exists.
3. Creates a fresh staging environment by forking from the main environment.
4. Applies all migrations in the `migrations` directory to the staging environment.

Usage:

```bash
npm run migrations:apply
```
