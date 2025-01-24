/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  console.log("Creating new fields/fieldsets");

  const itemTypes = await client.itemTypes.list();
  const inspireDatasetItemType = itemTypes.find(
    (itemType: any) => itemType.api_key === "inspire_dataset"
  ) || { id: "" };

  const fields = await client.fields.list(inspireDatasetItemType.id);
  const findField = (label: string) =>
    fields.find((field: any) => field.label === label);

  let doNotReorderFields: boolean = false;

  if (findField("Thesaurusdatum")) {
    console.log('Field "Thesaurusdatum" already exists');
    doNotReorderFields = true;
  } else {
    console.log(
      'Create Single-line string field "thesauruslink" (`thesauruslink`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create(inspireDatasetItemType.id, {
      id: "NS_cGHM9SGGcfP0KyG4vgw",
      label: "thesauruslink",
      field_type: "string",
      api_key: "thesauruslink",
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value: "",
    });
  }

  if (findField("Thesaurusdatum")) {
    console.log('Field "Thesaurusdatum" already exists');
    doNotReorderFields = true;
  } else {
    console.log(
      'Create Date field "Thesaurusdatum" (`thesaurusdatum`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create(inspireDatasetItemType.id, {
      id: "FxL4Gm4WRNq9EA4d7tkmRA",
      label: "Thesaurusdatum",
      field_type: "date",
      api_key: "thesaurusdatum",
      appearance: { addons: [], editor: "date_picker", parameters: {} },
      default_value: null,
    });
  }

  if (findField("Thesaurusdatum type")) {
    console.log('Field "Thesaurusdatum type" already exists');
    doNotReorderFields = true;
  } else {
    console.log(
      'Create Single-line string field "Thesaurusdatum type" (`thesaurusdatum_type`) in model "Inspire Dataset" (`inspire_dataset`)'
    );
    await client.fields.create(inspireDatasetItemType.id, {
      id: "RMgqrZGfQyKy5tMXDj6Srw",
      label: "Thesaurusdatum type",
      field_type: "string",
      api_key: "thesaurusdatum_type",
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false, placeholder: null },
      },
      default_value: "",
    });
  }

  if (!doNotReorderFields) {
    console.log("Update existing fields/fieldsets");

    console.log(
      'Reorder fields/fieldsets for model "Inspire Dataset" (`inspire_dataset`)'
    );
    try {
      await client.itemTypes.rawReorderFieldsAndFieldsets(
        inspireDatasetItemType.id,
        {
          data: [
            {
              id: "NS_cGHM9SGGcfP0KyG4vgw",
              type: "field",
              attributes: { position: 3 },
              relationships: {
                fieldset: {
                  data: { id: "KbDtNCwNQAqEGh-9o5G-RA", type: "fieldset" },
                },
              },
            },
            {
              id: "FxL4Gm4WRNq9EA4d7tkmRA",
              type: "field",
              attributes: { position: 4 },
              relationships: {
                fieldset: {
                  data: { id: "KbDtNCwNQAqEGh-9o5G-RA", type: "fieldset" },
                },
              },
            },
            {
              id: "RMgqrZGfQyKy5tMXDj6Srw",
              type: "field",
              attributes: { position: 5 },
              relationships: {
                fieldset: {
                  data: { id: "KbDtNCwNQAqEGh-9o5G-RA", type: "fieldset" },
                },
              },
            },
            {
              id: "JdCdVG1LTHa5UmI8NHNGBw",
              type: "field",
              attributes: { position: 1 },
              relationships: {
                fieldset: {
                  data: { id: "TOSwC4esQFKcXNrW20gK1Q", type: "fieldset" },
                },
              },
            },
            {
              id: "MciOlCyATDqKAeWCVthfgg",
              type: "field",
              attributes: { position: 0 },
              relationships: {
                fieldset: {
                  data: { id: "TOSwC4esQFKcXNrW20gK1Q", type: "fieldset" },
                },
              },
            },
            {
              id: "fFAppifMRJeYDqnflH6d8w",
              type: "field",
              attributes: { position: 3 },
              relationships: {
                fieldset: {
                  data: { id: "IWFo-RIcRFGq75fjuAh35A", type: "fieldset" },
                },
              },
            },
            {
              id: "EToHPBiYTSOZ80SxmAWcpg",
              type: "field",
              attributes: { position: 0 },
              relationships: {
                fieldset: {
                  data: { id: "INy1cspgRTCwgrfVa2fTDw", type: "fieldset" },
                },
              },
            },
            {
              id: "bYdFNcOASiuFG5wVKfLYGw",
              type: "field",
              attributes: { position: 2 },
              relationships: {
                fieldset: {
                  data: { id: "VJVAflbjSxaaCl2OF4vaCA", type: "fieldset" },
                },
              },
            },
            {
              id: "BEF9VIoJRgiKa6SZSZQTDw",
              type: "field",
              attributes: { position: 1 },
              relationships: {
                fieldset: {
                  data: { id: "d5CCVL3pSxGMdchqXBBQJQ", type: "fieldset" },
                },
              },
            },
            {
              id: "LoXTVry5RTWfgDj2l9OAhw",
              type: "field",
              attributes: { position: 2 },
              relationships: {
                fieldset: {
                  data: { id: "KbDtNCwNQAqEGh-9o5G-RA", type: "fieldset" },
                },
              },
            },
            {
              id: "NzxaGK5sSoyuErg9Tabo1Q",
              type: "field",
              attributes: { position: 2 },
              relationships: {
                fieldset: {
                  data: { id: "INy1cspgRTCwgrfVa2fTDw", type: "fieldset" },
                },
              },
            },
            {
              id: "ELSrYu9EQO60TyeUB_bDzA",
              type: "field",
              attributes: { position: 1 },
              relationships: {
                fieldset: {
                  data: { id: "INy1cspgRTCwgrfVa2fTDw", type: "fieldset" },
                },
              },
            },
            {
              id: "Ei2sKTDgSZO6RsFquxiiaw",
              type: "field",
              attributes: { position: 0 },
              relationships: {
                fieldset: {
                  data: { id: "d5CCVL3pSxGMdchqXBBQJQ", type: "fieldset" },
                },
              },
            },
            {
              id: "GbevT-_8T1O68xw1ijxFXQ",
              type: "field",
              attributes: { position: 0 },
              relationships: {
                fieldset: {
                  data: { id: "c4ZNV0cQTamwB4mBwbSFpg", type: "fieldset" },
                },
              },
            },
            {
              id: "Bw5WSGe9TGu_3LhSFjJobw",
              type: "field",
              attributes: { position: 7 },
              relationships: {
                fieldset: {
                  data: { id: "J7A-JpKBROyVXigOyRdNyQ", type: "fieldset" },
                },
              },
            },
            {
              id: "KbDtNCwNQAqEGh-9o5G-RA",
              type: "fieldset",
              attributes: { position: 5 },
            },
            {
              id: "LkE2P0h0RlG3N3kKty2fEQ",
              type: "fieldset",
              attributes: { position: 6 },
            },
            {
              id: "IWFo-RIcRFGq75fjuAh35A",
              type: "fieldset",
              attributes: { position: 2 },
            },
            {
              id: "VJVAflbjSxaaCl2OF4vaCA",
              type: "fieldset",
              attributes: { position: 3 },
            },
            {
              id: "INy1cspgRTCwgrfVa2fTDw",
              type: "fieldset",
              attributes: { position: 4 },
            },
            {
              id: "TOSwC4esQFKcXNrW20gK1Q",
              type: "fieldset",
              attributes: { position: 7 },
            },
            {
              id: "c4ZNV0cQTamwB4mBwbSFpg",
              type: "fieldset",
              attributes: { position: 8 },
            },
            {
              id: "d5CCVL3pSxGMdchqXBBQJQ",
              type: "fieldset",
              attributes: { position: 9 },
            },
          ],
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}
