import { Client } from "@datocms/cli/lib/cma-client-node";
import {
  FetchWithThrottle,
  translateToEn,
  updateFieldLocalization,
} from "./util";

export const translateViewerFields = async (viewer: any, client: Client) => {
  try {
    return {
      name: {
        en: await translateToEn(viewer.name.en),
        nl: viewer.name.en,
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
      "7582166",
      "Single-line string field 'Name'",
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
        console.log("Attempting update for viewer", viewer.id);

        const updatedViewer = await translateViewerFields(viewer, client);

        try {
          const currentViewerInstance = await client.items.find(viewer.id);

          await client.items.update(viewer.id, {
            ...currentViewerInstance,
            ...updatedViewer,
          });

          console.log(`Viewer with ID ${viewer.id} updated successfully`);
        } catch (error: any) {
          failedIds.push(viewer.id);

          console.error(
            `Error updating viewer with ID ${viewer.id}:`,
            error,
            `data: ${JSON.stringify(updatedViewer)}`
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
  const fetcher = new FetchWithThrottle(5, 1000);
  client.config.fetchFn =
    fetcher.fetchWithThrottle as typeof client.config.fetchFn;

  try {
    await updateFields(client);
    await migrateContent(client);

    await client.itemTypes.update("menu", {
      all_locales_required: true,
    });
  } catch (error) {
    console.error("Viewers migration failed:", error);

    process.exit(1);
  }
}
