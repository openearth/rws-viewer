/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@datocms/cli/lib/cma-client-node";
import { FetchWithThrottle } from "./util";

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

function getFieldFromMetadata(metadata: any, fieldNl: string, fieldEn: string) {
  const nlItem = metadata.nl.find(
    (meta: any) => meta.title.toLowerCase() === fieldNl.toLowerCase()
  );
  const enItem = metadata.en.find(
    (meta: any) => meta.title.toLowerCase() === fieldEn.toLowerCase()
  );

  return {
    nl: nlItem,
    en: enItem,
  };
}

export default async function (client: Client): Promise<void> {
  const fetcher = new FetchWithThrottle(15, 1000);
  client.config.fetchFn =
    fetcher.fetchWithThrottle as typeof client.config.fetchFn;

  console.log("Fetching layers...");
  const layers = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: "layer",
    },
  })) {
    layers.push(record);
  }

  for (const layer of layers) {
    const metadata = await fetchContentByIdsTranslated(
      client,
      layer.metadata as any
    );
    const bron = getFieldFromMetadata(metadata, "bron", "source");
    const info = getFieldFromMetadata(metadata, "info", "info");
    const bijsluiter = getFieldFromMetadata(
      metadata,
      "bijsluiter",
      "package insert"
    );
    const beschrijving = getFieldFromMetadata(
      metadata,
      "beschrijving",
      "description"
    );

    await client.items.update(layer.id, {
      metadata: {
        en: (layer.metadata as any).en.filter(
          (item: any) =>
            ![
              bron?.en?.id,
              info?.en?.id,
              bijsluiter?.en?.id,
              beschrijving?.en?.id,
            ].includes(item)
        ),
        nl: (layer.metadata as any).nl.filter(
          (item: any) =>
            ![
              bron?.nl?.id,
              info?.nl?.id,
              bijsluiter?.nl?.id,
              beschrijving?.nl?.id,
            ].includes(item)
        ),
      },
      description: {
        en: (layer.description as any)?.en || beschrijving?.en?.content || "",
        nl: (layer.description as any)?.nl || beschrijving?.nl?.content || "",
      },
      bron: {
        en: bron?.en?.content || "",
        nl: bron?.nl?.content || "",
      },
      info: {
        en: info?.en?.content || "",
        nl: info?.nl?.content || "",
      },
      bijsluiter: {
        en: bijsluiter?.en?.content || "",
        nl: bijsluiter?.nl?.content || "",
      },
    });
  }
}
