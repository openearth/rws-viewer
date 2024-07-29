import { Client } from "@datocms/cli/lib/cma-client-node";

async function convertToWysiwyg(name: string, fieldId: string, client: Client) {
  console.log(
    `Update Multiple-paragraph text field "${ name }"`
  );

  console.log(`Updating field ${ fieldId } type to text`);
  await client.fields.update(fieldId, { field_type: "text" });

  console.log(`Updating field ${ fieldId } to wysiwyg`);
  return client.fields.update(fieldId, {
    validators: {},
    appearance: {
      editor: "wysiwyg",
      addons: [],
      parameters: {
        toolbar: [
          "link"
        ]
      },
      type: "wysiwyg",
    },
  });
}

export default async function (client: Client) {
  console.log("Update existing fields/fieldsets");

  await convertToWysiwyg("Layer/Description", "10270437", client);

  await convertToWysiwyg("ViewerLayer/Bron", "Omki1ydUSZSIg35I0RmtWg", client);
  await convertToWysiwyg("ViewerLayer/Info", "c1CbH0YhR1avFBq0oY7Y3Q", client);
  await convertToWysiwyg("ViewerLayer/Bijsluiter", "LfUiZwnBRrCFL8FvgJBiog", client);

  await convertToWysiwyg('Menu/Bron', "FiC9xyA4TCiYmbYF4xgxew", client);
  await convertToWysiwyg('Menu/Info', "Ios1GGfvQ0-85isRxDEilw", client);
  await convertToWysiwyg('Menu/Bijsluiter', "FLexmOHuRhCJ5ANcwgTWrg", client);
}
