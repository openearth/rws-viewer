import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function(client: Client): Promise<void> {
  console.log('DIT IS DE GOEDE VERSIE')

  await client.fieldsets.destroy('En1oNd5IQ3-b9Y1qQhuS2Q')
  await client.fields.destroy('ONdAuSZHSL2lnCanvP1Qow')
  await client.fields.destroy('Omki1ydUSZSIg35I0RmtWg')
  await client.fields.destroy('c1CbH0YhR1avFBq0oY7Y3Q')
  await client.fields.destroy('LfUiZwnBRrCFL8FvgJBiog') 
}
