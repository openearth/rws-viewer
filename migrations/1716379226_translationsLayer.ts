import { Client } from "@datocms/cli/lib/cma-client-node";
import {
  translateNestedModularContent,
  translateToEn,
  updateFieldLocalization,
} from "./util";

export const translateLayerFields = async (layer: any, client: Client) => {
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
    ...layer,
    name: { en: await translateToEn(layer.name.en), nl: layer.name.en },
    description: {
      en: await translateToEn(layer.description.en),
      nl: layer.description.en,
    },
    preview: { en: layer.preview.en, nl: layer.preview.en },
    links: translatedLinks,
    metadata: translatedCustomMetadata,
  };
};

const updateFields = async (client: Client) => {
  console.log("Update existing fields/fieldsets");

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
};

const migrateContent = async (client: Client) => {
  console.log("Starting content migration");

  const layers = [];
  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "layer",
      // ids: "96741011",
    },
  })) {
    layers.push(record);
  }

  await Promise.all(
    layers.map(async (layer) => {
      const updatedLayer = await translateLayerFields(layer, client);
      await client.items.update(layer.id, updatedLayer);
    })
  );

  console.log("Content migration complete 🎉");
};

export default async function (client: Client) {
  try {
    await updateFields(client);
    await migrateContent(client);
  } catch (error) {
    console.error("Migration failed", error);
  }
}
