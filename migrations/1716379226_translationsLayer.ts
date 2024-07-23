import { Client } from "@datocms/cli/lib/cma-client-node";
import {
  FetchWithThrottle,
  translateNestedModularContent,
  translateToEn,
  updateFieldLocalization,
} from "../migrations/util";

export const translateLayerFields = async (layer: any, client: Client) => {
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
      preview:
        layer.preview === null
          ? null
          : { en: layer.preview?.en, nl: layer.preview?.en },
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

    console.log(`Found ${layers.length} layers to migrate`);

    await Promise.all(
      layers.map(async (layer) => {
        console.log("Attempting update for layer", layer.id);

        try {
          const updatedLayer = await translateLayerFields(layer, client);

          await client.items.update(layer.id, updatedLayer);

          console.log(`Layer with ID ${layer.id} updated successfully`);
        } catch (error: any) {
          failedIds.push(layer.id);

          console.error(`Error updating layer with ID: ${layer.id}`, error);
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
  const fetcher = new FetchWithThrottle(30, 1000);
  client.config.fetchFn =
    fetcher.fetchWithThrottle as typeof client.config.fetchFn;

  try {
    await updateFields(client);
    await migrateContent(client);

    await client.itemTypes.update("layer", {
      all_locales_required: true,
    });
  } catch (error) {
    console.error("Layers migration failed", error);

    process.exit(1);
  }
}
