import { Client } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  console.log("Update existing fields/fieldsets");

  const currentField = await client.fields.find("H7cTIWERTG-z24IE8ILCUw");

  console.log(
    'Update Multiple-paragraph text field "Acknowledgments" (`acknowledgments`) in model "Menu" (`menu`)'
  );
  await client.fields.update("H7cTIWERTG-z24IE8ILCUw", {
    appearance: {
      addons: currentField.appearance.addons,
      editor: "markdown",
      parameters: {
        toolbar: [
          "heading",
          "bold",
          "italic",
          "strikethrough",
          "code",
          "unordered_list",
          "ordered_list",
          "quote",
          "link",
          "image",
          "fullscreen",
        ],
      },
      type: "markdown",
    },
  });
}
