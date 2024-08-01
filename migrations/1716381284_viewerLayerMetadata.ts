/* eslint-disable */
import {
  Client,
  SimpleSchemaTypes,
  buildBlockRecord,
} from "@datocms/cli/lib/cma-client-node";
import { FetchWithThrottle } from "./util";

// Function to create fields
async function createField(client: Client, modelId: string, fieldConfig: any) {
  try {
    await client.fields.create(modelId, fieldConfig);
    console.log(`Field "${fieldConfig.label}" created successfully.`);
  } catch (error) {
    console.error(`Error creating field "${fieldConfig.label}":`, error);
  }
}

// Function to delete fields
async function deleteField(client: Client, fieldId: string) {
  try {
    await client.fields.find(fieldId);
  } catch (error) {
    console.log(`Ignoring deletion of field "${fieldId}" as it doesn't exist.`);
    return;
  }

  try {
    await client.fields.destroy(fieldId);
    console.log(`Field "${fieldId}" deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting field "${fieldId}":`, error);
  }
}

// Function to delete fieldsets
async function deleteFieldset(client: Client, fieldsetId: string) {
  try {
    await client.fieldsets.find(fieldsetId);
  } catch (error) {
    console.log(
      `Ignoring deletion of fieldset "${fieldsetId}" as it doesn't exist.`
    );
    return;
  }

  try {
    await client.fieldsets.destroy(fieldsetId);
    console.log(`Fieldset "${fieldsetId}" deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting fieldset "${fieldsetId}":`, error);
  }
}

// Function to fetch content for any array of IDs
async function fetchContentByIds(
  client: Client,
  ids: string[]
): Promise<any[]> {
  try {
    return await Promise.all(ids.map((id) => client.items.find(id)));
  } catch (error) {
    console.error("Error fetching content", error);
    return [];
  }
}

async function fetchContentByIdsTranslated(
  client: Client,
  ids: { en: string[]; nl: string[] }
): Promise<any> {
  try {
    return {
      en: await Promise.all(ids.en.map((id) => client.items.find(id))),
      nl: await Promise.all(ids.nl.map((id) => client.items.find(id))),
    };
  } catch (error) {
    console.error("Error fetching content", error);
    return [];
  }
}

// Function to fetch viewer records
async function fetchViewerRecords(client: Client, ids?: string[]): Promise<any[]> {
  const records: any[] = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "menu",
      ...(ids && { ids: ids.join(",") }),
    },
  })) {
    records.push(record);
  }

  return records;
}

// Function to create a viewer layer
async function createViewerLayer(
  client: Client,
  layer: any
): Promise<any | null> {
  try {
    return await client.items.create({
      item_type: {
        id: "AZBPikJtQD6zem3SEFbUOg",
        type: "item_type",
      },
      layer: layer,
      use_factsheet_as_metadata: null,
      factsheets: null,
      inspire_metadata: null,
      point_of_contact_organisations: [],
      links: {
        nl: [],
        en: [],
      },
      metadata: {
        nl: [],
        en: [],
      },
    });
  } catch (error) {
    console.error("Error creating viewer layer", layer, error);
    return null;
  }
}

// Function to update a viewer with new layers
async function updateViewerWithLayers(
  client: Client,
  viewerId: string,
  viewerLayers: any[]
) {
  try {
    await client.items.update(viewerId, {
      viewer_layers: viewerLayers.map((layer) => layer?.id),
    });
  } catch (error) {
    console.error("Error updating viewer", viewerId, error);
  }
}

// Function to fetch and update viewer layers
async function fetchAndUpdateViewerLayers(client: Client, viewer: any) {
  const layers = viewer.layers as any[];
  const viewerLayers = viewer.viewer_layers as string[];

  const layerContent = await Promise.all(
    layers.map(async (layer) => {
      const content = await client.items.find(layer);

      const [pocOrganisationsContent, linksContent, metadataContent] =
        await Promise.all([
          // @ts-expect-error - TS doesn't know that these are arrays
          fetchContentByIds(client, content.point_of_contact_organisations),
          // @ts-expect-error - TS doesn't know that these are arrays
          fetchContentByIdsTranslated(client, content.links),
          // @ts-expect-error - TS doesn't know that these are arrays
          fetchContentByIdsTranslated(client, content.metadata),
        ]);

      return {
        use_factsheet_as_metadata: content.use_factsheet_as_metadata,
        factsheets: content.factsheets,
        inspire_metadata: content.inspire_metadata,
        point_of_contact_organisations: await Promise.all(
          pocOrganisationsContent.map(({ id, ...org }) => buildBlockRecord(org))
        ),
        links: {
          nl: await Promise.all(
            linksContent.nl.map(({ id, ...link }: any) =>
              buildBlockRecord(link)
            )
          ),
          en: await Promise.all(
            linksContent.en.map(({ id, ...link }: any) =>
              buildBlockRecord(link)
            )
          ),
        },
        metadata: {
          nl: await Promise.all(
            metadataContent.nl.map(({ id, ...meta }: any) =>
              buildBlockRecord(meta)
            )
          ),
          en: await Promise.all(
            metadataContent.en.map(({ id, ...meta }: any) =>
              buildBlockRecord(meta)
            )
          ),
        },
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
async function migrateContent(client: Client) {
  let viewersArr = await fetchViewerRecords(client);
  console.log("Found viewers:", viewersArr.length);

  const chunkedViewers = chunkArray(viewersArr, 10);

  for (let viewers of chunkedViewers) {
    console.log("Processing chunk of viewers: ", viewers.length);
    const updatePromises = viewers.map(async (viewer: any) => {
      const viewerLayers = await Promise.all(
        viewer.layers.map(async (layer: any) => {
          return await createViewerLayer(client, layer);
        })
      );

      await updateViewerWithLayers(client, viewer.id, viewerLayers);
    });

    await Promise.all(updatePromises);

    viewers = await fetchViewerRecords(client, viewers.map((v: any) => v.id));
    console.log("Updated viewers:", viewers.map((v: any) => v.id).join(", "));

    const updateLayerPromises = viewers.map((viewer: any) =>
      fetchAndUpdateViewerLayers(client, viewer)
    );
    await Promise.all(updateLayerPromises);
    console.log("Updated viewer layers");
  }
}

export default async function (client: Client) {
  const fetcher = new FetchWithThrottle(15, 1000);
  client.config.fetchFn =
    fetcher.fetchWithThrottle as typeof client.config.fetchFn;

  /**
   * SCHEMA MIGRATIONS
   */
  console.log("Creating new fields/fieldsets");

  const metaDataFieldset = await client.fieldsets.create(
    "AZBPikJtQD6zem3SEFbUOg",
    {
      title: "Metadata",
    }
  );

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
    id: "SFMZ15rQT96BWMlk-oNTKw",
    label: "Use factsheet as metadata",
    field_type: "boolean",
    api_key: "use_factsheet_as_metadata",
    appearance: { addons: [], editor: "boolean", parameters: {} },
    fieldset: { id: metaDataFieldset.id, type: "fieldset" },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
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
    fieldset: { id: metaDataFieldset.id, type: "fieldset" },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
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
    fieldset: { id: metaDataFieldset.id, type: "fieldset" },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
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
    fieldset: { id: metaDataFieldset.id, type: "fieldset" },
    localized: true,
    default_value: { en: null, nl: null },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
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
    fieldset: { id: metaDataFieldset.id, type: "fieldset" },
  });

  const menuFieldSet = await client.fieldsets.create("AZBPikJtQD6zem3SEFbUOg", {
    title: "i MENU inhoud",
    hint: "Hierin worden de 'wijzigbare onderdelen' van het i-menu ondergebracht. Diverse onderdelen van het i-menu worden automatisch gekoppeld tijdens het opvragen van het i-menu in de viewer.",
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
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
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
    localized: true,
    default_value: { en: null, nl: null },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
    label: "Bron",
    field_type: "string",
    api_key: "bron",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: {
        heading: false,
      },
    },
    validators: {
      format: {
        predefined_pattern: "url",
      },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
    label: "Info",
    field_type: "string",
    api_key: "info",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: {
        heading: false,
      },
    },
    validators: {
      format: {
        predefined_pattern: "url",
      },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await createField(client, "AZBPikJtQD6zem3SEFbUOg", {
    label: "Bijsluiter",
    field_type: "string",
    api_key: "bijsluiter",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: {
        heading: false,
      },
    },
    validators: {
      format: {
        predefined_pattern: "url",
      },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await client.itemTypes.update("AZBPikJtQD6zem3SEFbUOg", {
    title_field: { id: "C49FZ0DJQuqOqgb4cfSEfw", type: "field" },
    image_preview_field: { id: "C49FZ0DJQuqOqgb4cfSEfw", type: "field" },
  });

  /**
   * CONTENT MIGRATIONS
   */
  await migrateContent(client);

  await deleteFieldset(client, "560793");
  await deleteField(client, "7583020");
  await deleteField(client, "10333354");
  await deleteField(client, "10143356");
  await deleteField(client, "10143358");
  await deleteField(client, "10343008");
  await deleteField(client, "7788918");
  await deleteField(client, "10343584");
  await deleteFieldset(client, "bUd1-swWQMqSqAJ9PIkIVw");
  await deleteField(client, "PmGnFVE8S5-Lkg9Hk2Z1Tg");
  await deleteField(client, "X7JuNRJMT7mz4MxNHJcEEA");
  await deleteField(client, "efOlEbSZTWO926t5AlRY6w");
}

function chunkArray(array: any, chunkSize: number) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}
