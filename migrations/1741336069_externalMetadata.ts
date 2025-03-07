import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "External metadata" (`external_metadata`) in model "Viewer Layer" (`viewer_layer`)',
  );
  await client.fields.create("AZBPikJtQD6zem3SEFbUOg", {
    id: "J56AL7z3TrWGSAtzNDa6tw",
    label: "External metadata",
    field_type: "string",
    api_key: "external_metadata",
    hint: "This metadata will be imported from the source to the GeoNetwork that's configured for the current viewer",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false, placeholder: null },
    },
    default_value: null,
  });

  console.log("Update existing fields/fieldsets");

  console.log(
    'Reorder fields/fieldsets for model "Viewer Layer" (`viewer_layer`)',
  );
  await client.itemTypes.rawReorderFieldsAndFieldsets(
    "AZBPikJtQD6zem3SEFbUOg",
    {
      data: [
        {
          id: "J56AL7z3TrWGSAtzNDa6tw",
          type: "field",
          attributes: { position: 3 },
          relationships: {
            fieldset: {
              data: { id: "e6dRkTohRai5ei4LqcDp4A", type: "fieldset" },
            },
          },
        },
        {
          id: "L2-PJwMoQYG8GvmMPHLfnw",
          type: "field",
          attributes: { position: 4 },
          relationships: {
            fieldset: {
              data: { id: "e6dRkTohRai5ei4LqcDp4A", type: "fieldset" },
            },
          },
        },
        {
          id: "QMWqj9_vQTW9nDDsJNum3g",
          type: "field",
          attributes: { position: 5 },
          relationships: {
            fieldset: {
              data: { id: "e6dRkTohRai5ei4LqcDp4A", type: "fieldset" },
            },
          },
        },
        {
          id: "GBKyE8E-QG-TAoIl_3o2RQ",
          type: "field",
          attributes: { position: 6 },
          relationships: {
            fieldset: {
              data: { id: "e6dRkTohRai5ei4LqcDp4A", type: "fieldset" },
            },
          },
        },
      ],
    },
  );

  console.log("Finalize models/block models");

  console.log('Update model "Viewer Layer" (`viewer_layer`)');
  await client.itemTypes.update("AZBPikJtQD6zem3SEFbUOg", {
    title_field: { id: "J56AL7z3TrWGSAtzNDa6tw", type: "field" },
  });
}
