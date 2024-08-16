import { Client } from '@datocms/cli/lib/cma-client-node';

// Function to create fields
async function createField(client: Client, modelId: string, fieldConfig: any) {
  try {
    await client.fields.create(modelId, fieldConfig);
    console.log(`Field "${fieldConfig.label}" created successfully.`);
  } catch (error) {
    console.error(`Error creating field "${fieldConfig.label}":`, error);
  }
}

export default async function(client: Client): Promise<void> {
  const menuFieldSet = await client.fieldsets.create("1518226", {
    title: "i MENU inhoud",
    hint: "Hierin worden de 'wijzigbare onderdelen' van het i-menu ondergebracht. Diverse onderdelen van het i-menu worden automatisch gekoppeld tijdens het opvragen van het i-menu in de viewer.",
  });

  await createField(client, "1518226", {
    label: "Custom metadata",
    field_type: "rich_text",
    api_key: "viewer_metadata",
    validators: { rich_text_blocks: { item_types: ["1556543"] } },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: false },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
    localized: true,
    default_value: { en: null, nl: null },
  });

  await createField(client, "1518226", {
    label: "Bron",
    field_type: "string",
    api_key: "bron",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: {
        heading: false,
      },
    },
    validators: {
      format: {
        predefined_pattern: "url",
      },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await createField(client, "1518226", {
    label: "Info",
    field_type: "string",
    api_key: "info",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: {
        heading: false,
      },
    },
    validators: {
      format: {
        predefined_pattern: "url",
      },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  });

  await createField(client, "1518226", {
    label: "Bijsluiter",
    field_type: "string",
    api_key: "bijsluiter",
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: {
        heading: false,
      },
    },
    validators: {
      format: {
        predefined_pattern: "url",
      },
    },
    fieldset: { id: menuFieldSet.id, type: "fieldset" },
  }); 
}
