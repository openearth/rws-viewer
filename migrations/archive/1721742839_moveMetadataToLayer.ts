/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, buildBlockRecord } from "@datocms/cli/lib/cma-client-node";

async function fetchContentByIdsTranslated(
  client: Client,
  ids: { en: string[]; nl: string[] }
): Promise<any> {
  try {
    return {
      en: await Promise.all(
        (ids?.en || [])?.map((id) => client.items.find(id))
      ),
      nl: await Promise.all(
        (ids?.nl || [])?.map((id) => client.items.find(id))
      ),
    };
  } catch (error) {
    console.error("Error fetching content", error);
    return [];
  }
}

// Function to create fields
async function createField(client: Client, modelId: string, fieldConfig: any) {
  try {
    await client.fields.create(modelId, fieldConfig);
    console.log(`Field "${fieldConfig.label}" created successfully.`);
  } catch (error) {
    console.error(`Error creating field "${fieldConfig.label}":`, error);
  }
}

async function migrateContent(client: Client) {
  console.log("Starting content migration");
  console.log("Fetching layers...");
  const layers = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "layer",
    },
  })) {
    layers.push(record);
  }

  console.log("fetching viewerLayers...");

  const viewerLayers = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "viewer_layer",
    },
  })) {
    viewerLayers.push(record);
  }

  const newData = [];

  for (const layer of layers) {
    const parentViewerLayer = viewerLayers.find(
      (viewerLayer) => viewerLayer.layer === layer.id
    );

    newData.push({
      layer,
      viewerLayer: parentViewerLayer,
    });
  }

  for (const newDataItem of newData) {
    console.log(
      "updating layer",
      newDataItem.layer.id,
      "with viewerLayer",
      newDataItem.viewerLayer?.id
    );

    if (newDataItem.viewerLayer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newMetadataContent = await fetchContentByIdsTranslated(
        client,
        newDataItem.viewerLayer?.metadata as any
      );

      await client.items.update(newDataItem.layer.id, {
        metadata: {
          en: newMetadataContent.en.map(
            ({ id, updated_at, created_at, ...content }: any) =>
              buildBlockRecord(content)
          ),
          nl: newMetadataContent.nl.map(
            ({ id, updated_at, created_at, ...content }: any) =>
              buildBlockRecord(content)
          ),
        },
        bron: {
          en: newDataItem.viewerLayer?.bron,
          nl: newDataItem.viewerLayer?.bron,
        },
        info: {
          en: newDataItem.viewerLayer?.info,
          nl: newDataItem.viewerLayer?.info,
        },
        bijsluiter: {
          en: newDataItem.viewerLayer?.bijsluiter,
          nl: newDataItem.viewerLayer?.bijsluiter,
        },
      });
    } else {
      console.log("No viewerLayer found for layer", newDataItem.layer.id);
    }
  }
}

export default async function (client: Client): Promise<void> {
  const menuFieldSet = await client.fieldsets.create("1518125", {
    title: "i MENU inhoud",
    hint: "Hierin worden de 'wijzigbare onderdelen' van het i-menu ondergebracht. Diverse onderdelen van het i-menu worden automatisch gekoppeld tijdens het opvragen van het i-menu in de viewer.",
  });

  await createField(client, "1518125", {
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

  await createField(client, "1518125", {
    label: "Bron",
    field_type: "text",
    api_key: "bron",
    appearance: {
      editor: "wysiwyg",
      addons: [],
      parameters: {
        toolbar: ["link"],
      },
      type: "wysiwyg",
    },
    localized: true,
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await createField(client, "1518125", {
    label: "Info",
    field_type: "text",
    api_key: "info",
    appearance: {
      editor: "wysiwyg",
      addons: [],
      parameters: {
        toolbar: ["link"],
      },
      type: "wysiwyg",
    },
    localized: true,
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await createField(client, "1518125", {
    label: "Bijsluiter",
    field_type: "text",
    api_key: "bijsluiter",
    appearance: {
      editor: "wysiwyg",
      addons: [],
      parameters: {
        toolbar: ["link"],
      },
      type: "wysiwyg",
    },
    localized: true,
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await migrateContent(client);
}
