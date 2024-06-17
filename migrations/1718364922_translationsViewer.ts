import { Client } from "@datocms/cli/lib/cma-client-node";
import {
  fetchWithBackoff,
  translateToEn,
  updateFieldLocalization,
} from "./util";

export const translateViewerFields = async (viewer: any, client: Client) => {
  try {
    const { updatedAt, createdAt, ...viewerFields } = viewer;

    return {
      ...viewerFields,
      user_agreement: {
        en: await translateToEn(viewer.user_agreement.en),
        nl: viewer.user_agreement.en,
      },
      acknowledgments: {
        en: await translateToEn(viewer.acknowledgments.en),
        nl: viewer.acknowledgments.en,
      },
    };
  } catch (error) {
    console.error("Error translating viewer fields:", error);
    throw error;
  }
};

const updateFields = async (client: Client) => {
  console.log("Update existing fields/fieldsets");
  try {
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
  } catch (error) {
    console.error("Error updating field localization:", error);
    throw error;
  }
};

const migrateContent = async (client: Client) => {
  console.log("Starting content migration");

  const failedIds: Array<string> = [];

  try {
    const viewers = [];
    for await (const record of client.items.listPagedIterator({
      filter: {
        type: "menu",
      },
    })) {
      viewers.push(record);
    }

    console.log(`Found ${viewers.length} viewers to migrate`);

    await Promise.all(
      viewers.map(async (viewer) => {
        try {
          const updatedViewer = await translateViewerFields(viewer, client);
          await client.items.update(viewer.id, updatedViewer);
        } catch (error: any) {
          failedIds.push(viewer.id);

          console.error(
            `Error updating viewer with ID ${viewer.id}:`,
            error.cause.code
          );
        }
      })
    );

    console.log("Content migration complete 🎉");
  } catch (error) {
    console.error("Error during content migration:", error);
    throw error;
  }

  if (failedIds.length > 0) {
    console.error(
      `Failed to update viewers with the following IDs: ${failedIds.join(", ")}`
    );
  }
};

export default async function (client: Client) {
  client.config.fetchFn = fetchWithBackoff as typeof client.config.fetchFn;

  try {
    await updateFields(client);
    await migrateContent(client);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}
