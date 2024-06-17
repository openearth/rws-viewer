import { Client } from "@datocms/cli/lib/cma-client-node";
import {
  fetchWithBackoff,
  translateNestedModularContent,
  translateToEn,
  updateFieldLocalization,
} from "./util";

export const translateLayerFields = async (layer: any, client: Client) => {
  client.config;
  const { updatedAt, createdAt, ...layerFields } = layer;

  try {
    const translatedLinks = await translateNestedModularContent(
      layer.links,
      ["name", "description"],
      client
    );

    const translatedCustomMetadata = await translateNestedModularContent(
      layer.metadata,
      ["title", "content"],
      client
    );

    return {
      ...layerFields,
      name: { en: await translateToEn(layer.name.en), nl: layer.name.en },
      description: {
        en: await translateToEn(layer.description.en),
        nl: layer.description.en,
      },
      preview: { en: layer.preview.en, nl: layer.preview.en },
      links: translatedLinks,
      metadata: translatedCustomMetadata,
    };
  } catch (error) {
    console.error("Error translating layer fields for layer:", layer.id, error);
    throw error;
  }
};

const updateFields = async (client: Client) => {
  console.log("Update existing fields/fieldsets");

  try {
    await updateFieldLocalization(
      client,
      "7581676",
      "Single-line string field 'Name'",
      "Layer"
    );
    await updateFieldLocalization(
      client,
      "10270437",
      "Multi-line string field 'Description'",
      "Layer"
    );
    await updateFieldLocalization(
      client,
      "10343008",
      "Modular Content (Multiple blocks) field 'Links'",
      "Layer"
    );
    await updateFieldLocalization(
      client,
      "7788918",
      "Modular Content (Multiple blocks) field 'Custom metadata'",
      "Layer"
    );
  } catch (error) {
    console.error("Error updating fields/fieldsets", error);
    throw error;
  }
};

const migrateContent = async (client: Client) => {
  console.log("Starting content migration");

  const failedIds: Array<string> = [];

  try {
    const layers = [];

    for await (const record of client.items.listPagedIterator({
      filter: {
        type: "layer",
      },
    })) {
      layers.push(record);
    }

    await Promise.all(
      layers.map(async (layer) => {
        try {
          const updatedLayer = await translateLayerFields(layer, client);
          console.log("Attempting update for layer", layer.id);
          await client.items.update(layer.id, updatedLayer);
        } catch (error: any) {
          failedIds.push(layer.id);

          console.error(
            `Error updating layer with ID: ${layer.id}`,
            error?.cause?.code
          );
        }
      })
    );

    console.log("Content migration complete 🎉");
  } catch (error) {
    console.error("Error during content migration", error);
    throw error;
  }

  if (failedIds.length > 0) {
    console.error(
      `Failed to update layers with the following IDs: ${failedIds.join(", ")}`
    );
  }
};

export default async function (client: Client) {
  client.config.fetchFn = fetchWithBackoff as typeof client.config.fetchFn;

  try {
    await updateFields(client);
    await migrateContent(client);
  } catch (error) {
    console.error("Migration failed", error);
  }
}
