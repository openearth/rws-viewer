import { Client } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client): Promise<void> {
  const articleModel = await client.itemTypes.create({
    name: "Article",
    api_key: "article",
  });

  await client.fields.create(articleModel, {
    label: "Title",
    api_key: "title",
    field_type: "string",
    validators: {
      required: {},
    },
  });
}
