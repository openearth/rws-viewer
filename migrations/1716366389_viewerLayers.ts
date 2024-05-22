/* eslint-disable */
import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
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

  /**
   * CONTENT MIGRATIONS
   */

  const viewers = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "menu",
      // TODO: remove filter when all migrations work
      ids: "93795018",
    },
  })) {
    viewers.push(record);
  }

  console.log("Found viewers:", viewers.length);
  console.log("Attempting to update viewers");

  const updatedViewers = await Promise.all(
    viewers.map(async (viewer) => {
      console.log("Updating viewer:", viewer.id);

      const viewerLayers = await Promise.all(
        (viewer.layers as any).map(async (layer: any) => {
          return await client.items
            .create({
              item_type: {
                id: "AZBPikJtQD6zem3SEFbUOg",
                type: "item_type",
              },
              layer: layer,
            })
            .catch((e) => {
              console.error("Error creating viewer layer", layer.id, e);
              return null;
            });
        })
      );

      console.log("Created viewer layers:", viewerLayers.length);

      await client.items
        .update(viewer.id, {
          viewer_layers: viewerLayers.map((layer) => layer?.id),
        })
        .catch((e) => {
          console.error("Error updating viewer", viewer.id, e);
          return null;
        });

      console.log("Updated viewer:", viewer.id);
    })
  );

  console.log("Updated viewers:", updatedViewers.length);
}
