import { Client } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  console.log("Creating new fields/fieldsets");

  const itemTypes = await client.itemTypes.list();
  const viewerLayerItemType = itemTypes.find(
    (itemType: { api_key: string }) => itemType.api_key === "viewer_layer"
  ) || { id: "" };

  const fieldsets = await client.fieldsets.list(viewerLayerItemType.id);

  const externalMetadataFieldset = fieldsets.find(
    (fieldset) => fieldset.title === "Metadata"
  ) || { id: "" };

  console.log(
    'Create Single-line string field "External metadata" (`external_metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.create(viewerLayerItemType.id, {
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
    fieldset: { id: externalMetadataFieldset.id, type: "fieldset" },
  });

  console.log("Update existing fields/fieldsets");

  console.log(
    'Update Single-line string field "External metadata" (`external_metadata`) in model "Viewer Layer" (`viewer_layer`)'
  );
  await client.fields.update("J56AL7z3TrWGSAtzNDa6tw", { position: 3 });
}
