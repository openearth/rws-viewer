/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatoClient } from "./utils";

async function main() {
  const { instances } = await import("../../config/dato/instances.js");

  console.log(instances);

  for (const instance of instances) {
    console.log(`Setting up staging environment for ${instance.name}`);

    const client = new DatoClient(instance.key);

    const existingEnvironments = await client.listEnvironments();

    const stagingExists = existingEnvironments?.some(
      (env: { id: string }) => env.id === "staging"
    );

    if (stagingExists) {
      await client.destroyEnvironment("staging");
    }

    // Create a fresh staging environment
    await client.forkEnvironment("main", "staging");

    // Apply modifications
    await client.runMigrations("staging", "migrations");
  }
}

main().catch(console.error);
