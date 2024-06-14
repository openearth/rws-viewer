import { Client } from "@datocms/cli/lib/cma-client-node";
import { translateToEn, updateFieldLocalization } from "./util";

export const translateViewerFields = async (layer: any, client: Client) => {
  return {
    ...layer,
    user_agreement: {
      en: await translateToEn(layer.user_agreement.en),
      nl: layer.user_agreement.en,
    },
    acknowledgments: {
      en: await translateToEn(layer.acknowledgments.en),
      nl: layer.acknowledgments.en,
    },
  };
};

const updateFields = async (client: Client) => {
  console.log("Update existing fields/fieldsets");

  await updateFieldLocalization(
    client,
    "10491841",
    "Multiple-paragraph text field 'User agreement'",
    "Menu"
  );

  await updateFieldLocalization(
    client,
    "H7cTIWERTG-z24IE8ILCUw",
    "Multiple-paragraph text field 'Acknowledgments'",
    "Menu"
  );
};

const migrateContent = async (client: Client) => {
  console.log("Starting content migration");

  const viewers = [];
  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "menu",
      // ids: "85223015",
    },
  })) {
    viewers.push(record);
  }

  await Promise.all(
    viewers.map(async (viewer) => {
      const updatedViewer = await translateViewerFields(viewer, client);

      await client.items.update(viewer.id, updatedViewer);
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
