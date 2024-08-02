import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function(client: Client): Promise<void> {
  // rws-viewer:
  // await client.fieldsets.destroy("En1oNd5IQ3-b9Y1qQhuS2Q");
  // await client.fields.destroy("ONdAuSZHSL2lnCanvP1Qow");
  // await client.fields.destroy("Omki1ydUSZSIg35I0RmtWg");
  // await client.fields.destroy("c1CbH0YhR1avFBq0oY7Y3Q");
  // await client.fields.destroy("LfUiZwnBRrCFL8FvgJBiog");

  // data-viewer:
  await client.fieldsets.destroy("He_bunu-RIeIccXXciTVWw");
  await client.fields.destroy("ONdAuSZHSL2lnCanvP1Qow");
  await client.fields.destroy("OEdUAzIUQTW858Ca2B-3uA");
  await client.fields.destroy("JlW7SHg7THKeG9a16PaWeA");
  await client.fields.destroy("GeJ-0iuNQlWPut-RC0hFvQ");
}
