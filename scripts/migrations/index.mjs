#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { config } from 'dotenv-safe'
config()

import { spawnSync } from 'child_process'

const {
  DATO_FULL_ACCESS_API_TOKEN_RWS_VIEWER,
  DATO_FULL_ACCESS_API_TOKEN_DELTARES_VIEWER,
} = process.env

const apiTokens = [
  DATO_FULL_ACCESS_API_TOKEN_DELTARES_VIEWER,
  DATO_FULL_ACCESS_API_TOKEN_RWS_VIEWER,
]

yargs(hideBin(process.argv))
  .command('new', 'Create a new migration', (yargs) => {
    yargs.option('name', {
      describe: 'Name of the migration',
      demandOption: true,
      requiresArg: true,
      type: 'string',
    })
  }, ({ name }) => {
    const { stdout, stderr } = spawnSync('npx', [
      'datocms',
      'migrations:new',
      `'${ name }'`,
      `--api-token=${ apiTokens[0] }`,
    ])

    console.log(stderr.toString())
    console.log(stdout.toString())
  })
  .command('run', 'Run migration(s)', (yargs) => {
    yargs.option('destination', {
      describe: 'Specify the name of the new forked environment',
      demandOption: true,
      requiresArg: true,
      type: 'string',
    })
  }, ({ destination }) => {
    for (const apiToken of apiTokens) {
      const { stdout, stderr } = spawnSync('npx', [
        'datocms',
        'migrations:run',
        `--destination=${ destination }`,
        `--api-token=${ apiToken }`,
      ])

      console.log(stderr.toString())
      console.log(stdout.toString())
    }
  })
  .demandCommand(1)
  .help()
  .parse()

