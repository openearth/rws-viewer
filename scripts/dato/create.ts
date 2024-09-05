/* eslint-disable @typescript-eslint/no-explicit-any */
import { promisify } from "util";
import prompt from "prompt";
import { DatoClient } from "./utils";
import { instances } from "../../config/dato/instances.js";

const currentInstance = instances.find(
  (instance) => instance.name === process.env.DATO_INSTANCE_CURRENT
);

if (!currentInstance) {
  throw new Error("No current instance found");
}

const apiKey = currentInstance.key;
const client = new DatoClient(apiKey);

const promptGet = promisify(prompt.get);

async function main() {
  prompt.start();

  const promptResult = await promptGet(["name"]);
  const name = promptResult.name as string;

  await client.runCommand(["migrations:new", ...(name ? [name] : [])]);
}

main().catch(console.error);
