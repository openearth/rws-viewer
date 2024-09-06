/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatoClient } from "./utils";

async function main() {
  const { instances } = await import("../../config/dato/instances.js");

  for (const instance of instances) {
    console.log(`Managing environments for ${instance.name}`);

    const client = new DatoClient(instance.key);

    const existingEnvironments = await client.listEnvironments();

    const stagingExists = existingEnvironments?.some(
      (env: { id: string }) => env.id === "staging"
    );

    if (stagingExists) {
      await client.destroyEnvironment("staging");
    }

    await client.forkEnvironment("main", "staging");

    await client.runMigrations("staging", "migrations");

    await client.runCommand(["environments:promote", "staging"]);

    await client.destroyEnvironment("main");

    await client.runCommand(["environments:rename", "staging", "main"]);
  }
}

main().catch(console.error);
