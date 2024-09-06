import { run } from "@datocms/cli";

type RunResponse = ReturnType<typeof run>;

export class DatoClient {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  runCommand(args: string[]): Promise<RunResponse> {
    return run([
      ...args,
      ...(this.apiKey ? [`--api-token=${this.apiKey}`] : []),
    ]) as Promise<RunResponse>;
  }

  async listEnvironments(): Promise<{ id: string }[]> {
    const response = await this.runCommand(["environments:list"]);

    return response as { id: string }[];
  }

  destroyEnvironment(name: string): Promise<RunResponse> {
    return this.runCommand(["environments:destroy", name]);
  }

  forkEnvironment(source: string, target: string): Promise<RunResponse> {
    return this.runCommand(["environments:fork", source, target]);
  }

  runMigrations(source: string, migrationsDir: string): Promise<RunResponse> {
    return this.runCommand([
      "migrations:run",
      "--in-place",
      `--source=${source}`,
      `--migrations-dir=${migrationsDir}`,
    ]);
  }
}
