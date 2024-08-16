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

  // rws-viewer:
  // await convertToWysiwyg("ViewerLayer/Bron", "Omki1ydUSZSIg35I0RmtWg", client);
  // data-viewer:
  await convertToWysiwyg("ViewerLayer/Bron", "cwH6Kg6_TaSoLn1W_n2Wxw", client);

  // rws-viewer:
  // await convertToWysiwyg("ViewerLayer/Info", "c1CbH0YhR1avFBq0oY7Y3Q", client);
  // data-viewer:
  await convertToWysiwyg("ViewerLayer/Info", "JlW7SHg7THKeG9a16PaWeA", client);

  // rws-viewer:
  // await convertToWysiwyg(
  //   "ViewerLayer/Bijsluiter",
  //   "LfUiZwnBRrCFL8FvgJBiog",
  //   client
  // );
  // data-viewer:
  await convertToWysiwyg(
    "ViewerLayer/Bijsluiter",
    "GeJ-0iuNQlWPut-RC0hFvQ",
    client
  );

  // rws-viewer:
  // await convertToWysiwyg("Menu/Bron", "FiC9xyA4TCiYmbYF4xgxew", client);
  // data-viewer:
  await convertToWysiwyg("Menu/Bron", "OfiKgaT3SaWxmzi8moptGw", client);

  // rws-viewer:
  // await convertToWysiwyg("Menu/Info", "Ios1GGfvQ0-85isRxDEilw", client);
  // data-viewer:
  await convertToWysiwyg("Menu/Info", "J-R7QQ_rQuKk32MSmezsgw", client);

  // rws-viewer:
  // await convertToWysiwyg("Menu/Bijsluiter", "FLexmOHuRhCJ5ANcwgTWrg", client);
  // data-viewer:
  await convertToWysiwyg("Menu/Bijsluiter", "eioF30ylQJis-yFLvHwT1g", client);
}
