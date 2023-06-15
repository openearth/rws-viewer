# OpenEarth Viewer

The [OpenEarth Viewer](https://rws-viewer.netlify.app/) gives insight in a wide variety of marine data. It is configured to be loaded into a variety of different websites and cater specific layer data to each individual client.

[![Netlify Status](https://api.netlify.com/api/v1/badges/119b8ff3-5b22-4995-b43b-b31f21ba77c3/deploy-status)](https://app.netlify.com/sites/rws-viewer/deploys)

## Getting started

- Clone [this repository](https://github.com/openearth/rws-viewer):

```sh
git clone git@github.com:openearth/rws-viewer.git
cd rws-viewer
yarn install
```

- Copy `.env.example` to `.env`. And set all variables.

### Local development

```sh
yarn dev
```

## Scripted migrations

We use scripted migrations for CMS model changes. Use `npm run migrations -- new --name <migration-name>`, to add a migration script. Make sure you set the environment variables `DATO_FULL_ACCESS_API_TOKEN_RWS_VIEWER` and `DATO_FULL_ACCESS_API_TOKEN_DELTARES_VIEWER`.

### Apply your migration to the main environment

Once your PR is ready to merge, we have to apply the migrations to DatoCMS's main environment in all of the DatoCMS instances. Follow the following steps **on your branch, before merging**:

1. Turn on maintenance mode in all DatoCMS instances
2. Apply migrations to a fresh sandbox
   1. Run `npm run migrations -- run --destination=<env-name>-deploy` to create a fresh fork of the primary environment with the new migrations applied. We use the `-deploy` suffix so it's clear it's a deployment environment.
   2. Fill in the required content. Make sure to **not enter dummy content**, as this environment will go to production!
3. Commit the updated scripts/migrations/constants.mjs, containing your new environment
4. Merge the PR
5. Await the production deploys to succeed
6. Promote the new environment in all DatoCMS instances
7. Turn off maintenance mode
8. Once you've made sure everything is in order, you can remove the deploy sandbox environments. Be aware that you forfeit the option to rollback by performing this action.
