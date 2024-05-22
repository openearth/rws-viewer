/* eslint-disable */
import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  /**
   * SCHEMA MIGRATIONS
   */
  console.log("Creating new fields/fieldsets");

  console.log(
    'Create fieldset "Metadata" in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fieldsets.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "fn_svHXtTV-fHFVwauCMMA",
    title: "Metadata",
  });

  console.log(
    'Create Boolean field "Use factsheet as metadata" (`use_factsheet_as_metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "SFMZ15rQT96BWMlk-oNTKw",
    label: "Use factsheet as metadata",
    field_type: "boolean",
    api_key: "use_factsheet_as_metadata",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    default_value: null,
    fieldset: { id: "fn_svHXtTV-fHFVwauCMMA", type: "fieldset" },
  });

  console.log(
    'Create Multiple links field "Factsheets" (`factsheets`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "cdI3aQqZSm6KSDB7ZjYliA",
    label: "Factsheets",
    field_type: "links",
    api_key: "factsheets",
    validators: {
      items_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["1998549"],
      },
      size: { max: 1 },
    },
    appearance: { addons: [], editor: "links_select", parameters: {} },
    default_value: null,
    fieldset: { id: "fn_svHXtTV-fHFVwauCMMA", type: "fieldset" },
  });

  console.log(
    'Create Single link field "Inspire Metadata" (`inspire_metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "L2-PJwMoQYG8GvmMPHLfnw",
    label: "Inspire Metadata",
    field_type: "link",
    api_key: "inspire_metadata",
    validators: {
      item_item_type: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: ["1998730"],
      },
    },
    appearance: { addons: [], editor: "link_select", parameters: {} },
    default_value: null,
    fieldset: { id: "fn_svHXtTV-fHFVwauCMMA", type: "fieldset" },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Links" (`links`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "QMWqj9_vQTW9nDDsJNum3g",
    label: "Links",
    field_type: "rich_text",
    api_key: "links",
    validators: { rich_text_blocks: { item_types: ["2023063"] } },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
    fieldset: { id: "fn_svHXtTV-fHFVwauCMMA", type: "fieldset" },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Point of contact organisations" (`point_of_contact_organisations`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "GBKyE8E-QG-TAoIl_3o2RQ",
    label: "Point of contact organisations",
    field_type: "rich_text",
    api_key: "point_of_contact_organisations",
    validators: { rich_text_blocks: { item_types: ["2000801"] } },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
    fieldset: { id: "fn_svHXtTV-fHFVwauCMMA", type: "fieldset" },
  });

  console.log(
    'Create Modular Content (Multiple blocks) field "Custom metadata" (`metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "ONdAuSZHSL2lnCanvP1Qow",
    label: "Custom metadata",
    field_type: "rich_text",
    api_key: "metadata",
    validators: { rich_text_blocks: { item_types: ["1556543"] } },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    default_value: null,
    fieldset: { id: "fn_svHXtTV-fHFVwauCMMA", type: "fieldset" },
  });

  console.log("Finalize models/block models");

  console.log('Update model "Viewer Layer" (`viewer_layer`)');
  await client.itemTypes.update("AZBPikJtQD6zem3SEFbUOg", {
    title_field: { id: "C49FZ0DJQuqOqgb4cfSEfw", type: "field" },
  });

  /**
   * CONTENT MIGRATIONS
   */

  // Function to fetch viewer records
  async function fetchViewerRecords() {
    const records = [];
    for await (const record of client.items.listPagedIterator({
      filter: {
        type: "menu",
        // TODO: remove filter when all migrations work
        ids: "93795018",
      },
    })) {
      records.push(record);
    }
    return records;
  }

  // Function to create a viewer layer
  async function createViewerLayer(layer) {
    try {
      const createdLayer = await client.items.create({
        item_type: {
          id: "AZBPikJtQD6zem3SEFbUOg",
          type: "item_type",
        },
        layer: layer,
      });
      return createdLayer;
    } catch (error) {
      console.error("Error creating viewer layer", layer, error);
      return null;
    }
  }

  // Function to update a viewer with new layers
  async function updateViewerWithLayers(viewerId, viewerLayers) {
    try {
      await client.items.update(viewerId, {
        viewer_layers: viewerLayers.map((layer) => layer?.id),
      });
    } catch (error) {
      console.error("Error updating viewer", viewerId, error);
    }
  }

  // General function to fetch content for any array of IDs
  async function fetchContentByIds(ids) {
    try {
      const contentArray = await Promise.all(
        ids.map(async (id) => {
          const content = await client.items.find(id);
          return content;
        })
      );
      return contentArray;
    } catch (error) {
      console.error("Error fetching content", error);
      return [];
    }
  }

  // Function to fetch and update viewer layers
  async function fetchAndUpdateViewerLayers(viewer) {
    const layers = viewer.layers as any[];
    const viewerLayers = viewer.viewer_layers as string[];

    const layerContent = await Promise.all(
      layers.map(async (layer) => {
        const content = await client.items.find(layer);

        // Fetch content for links, point_of_contact_organisations, and metadata
        const linksContent = await fetchContentByIds(content.links);
        console.log("Links content", linksContent);
        // const pocOrganisationsContent = await fetchContentByIds(content.point_of_contact_organisations);
        // const metadataContent = await fetchContentByIds(content.metadata);

        return {
          use_factsheet_as_metadata: content.use_factsheet_as_metadata,
          factsheets: content.factsheets,
          inspire_metadata: content?.inspire_metadata,
          // links: linksContent,
          // point_of_contact_organisations: pocOrganisationsContent,
          // metadata: metadataContent,
        };
      })
    );

    await Promise.all(
      viewerLayers.map(async (viewerLayer, index) => {
        console.log("Updating viewer layer", viewerLayer);
        await client.items.update(viewerLayer, layerContent[index]);
      })
    );
  }

  // Main function to migrate content
  async function migrateContent() {
    let viewers = await fetchViewerRecords();
    console.log("Found viewers:", viewers.length);
    console.log("Attempting to update viewers");

    const updatePromises = viewers.map(async (viewer) => {
      const viewerLayers = await Promise.all(
        (viewer.layers as any).map((layer) => createViewerLayer(layer))
      );

      await updateViewerWithLayers(viewer.id, viewerLayers);
    });

    await Promise.all(updatePromises);

    // Fetch the updated viewers records
    viewers = await fetchViewerRecords();
    console.log("Updated viewers:", viewers.length);

    const updateLayerPromises = viewers.map(async (viewer) => {
      await fetchAndUpdateViewerLayers(viewer);
    });

    await Promise.all(updateLayerPromises);
    console.log("Updated viewer layers");
  }

  // Execute the migration
  migrateContent();
}
