import { Client } from '@datocms/cli/lib/cma-client-node';

export default async function(client: Client): Promise<void> {
  // DatoCMS migration script

  // For more examples, head to our Content Management API docs:
  // https://www.datocms.com/docs/content-management-api

  // Create an Article model:
  // https://www.datocms.com/docs/content-management-api/resources/item-type/create

  const articleModel = await client.itemTypes.create({
    name: 'Article',
    api_key: 'article',
  });

  // Create a Title field (required):
  // https://www.datocms.com/docs/content-management-api/resources/field/create

  const titleField = await client.fields.create(articleModel, {
    label: 'Title',
    api_key: 'title',
    field_type: 'string',
    validators: {
      required: {},
    },
  });

  // Create an Article record:
  // https://www.datocms.com/docs/content-management-api/resources/item/create

  const article = await client.items.create({
    item_type: articleModel,
    title: 'My first article!',
  });
}