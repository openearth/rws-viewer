/* eslint-disable */
import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";
import { FetchWithThrottle } from "./util";

export default async function (client: Client) {
  const fetcher = new FetchWithThrottle(30, 1000);
  client.config.fetchFn =
    fetcher.fetchWithThrottle as typeof client.config.fetchFn;

  /**
   * SCHEMA MIGRATIONS
   */
  console.log("Create new models/block models");

  console.log('Create model "Viewer Layer" (`viewer_layer`)');
  await client.itemTypes.create(
    {
      id: "AZBPikJtQD6zem3SEFbUOg",
      name: "Viewer Layer",
      api_key: "viewer_layer",
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    {
      skip_menu_item_creation: true,
      schema_menu_item_id: "Pkuy_z3yQEagNWgigODmAA",
    }
  );

  console.log(
    'Create Single link field "Layer" (`layer`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "C49FZ0DJQuqOqgb4cfSEfw",
    label: "Layer",
    field_type: "link",
    api_key: "layer",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["1518125"],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
  });

  console.log(
    'Create Multiple links field "Viewer Layers" (`viewer_layers`) in model "Menu" (`menu`)'
  );
  await client.fields.create("1518226", {
    id: "Vshp8axkTSiqet07_sOcAw",
    label: "Viewer Layers",
    field_type: "links",
    api_key: "viewer_layers",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["AZBPikJtQD6zem3SEFbUOg"],
      },
    },
    appearance: { addons: [], editor: "links_embed", parameters: {} },
    default_value: null,
  });

  console.log("Update existing fields/fieldsets");

  console.log(
    'Update Multiple links field "Viewer Layers" (`viewer_layers`) in model "Menu" (`menu`)'
  );
  await client.fields.update("Vshp8axkTSiqet07_sOcAw", { position: 3 });

  console.log("Finalize models/block models");

  console.log('Update model "Menu" (`menu`)');
  await client.itemTypes.update("1518226", {
    image_preview_field: { id: "10317618", type: "field" },
  });
}
