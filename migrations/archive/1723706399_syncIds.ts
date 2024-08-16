/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildBlockRecord, Client } from "@datocms/cli/lib/cma-client-node";

async function updateModelId(
  client: Client,
  fieldId: string,
  newFieldId: string,
  fieldSetId?: string
) {
  const existingField = await client.fields.find(fieldId);
  const parentModelId = existingField.item_type.id;
  const parentModel = await client.itemTypes.find(parentModelId);

  const records: any[] = [];

  for await (const record of client.items.listPagedIterator({
    filter: {
      type: parentModel.api_key,
    },
  })) {
    records.push(record);
  }

  const newField = await client.fields.create(parentModelId, {
    ...existingField,
    // use temporary api_key to avoid conflicts
    api_key: `${existingField.api_key}_temp`,
    label: `${existingField.label}_temp`,
    id: newFieldId,
    ...(fieldSetId
      ? {
          fieldset: {
            id: fieldSetId,
            type: "fieldset",
          },
        }
      : {}),
  });

  for (const record of records) {
    let newData = record[existingField.api_key];

    if (existingField.validators.rich_text_blocks) {
      newData = {
        en: await duplicate(client, record[existingField.api_key].en),
        nl: await duplicate(client, record[existingField.api_key].nl),
      };
    }

    await client.items.update(record.id, {
      [newField.api_key]: newData,
    });
  }

  await client.fields.destroy(fieldId);

  await client.fields.update(newFieldId, {
    api_key: existingField.api_key,
    label: existingField.label,
  });
}

async function updateFieldSetId(
  client: Client,
  fieldSetId: string,
  newFieldSetId: string
) {
  const currentFieldSet = await client.fieldsets.find(fieldSetId);
  const parentModelId = currentFieldSet.item_type.id;

  await client.fieldsets.destroy(fieldSetId);

  const newFieldSet = await client.fieldsets.create(parentModelId, {
    ...currentFieldSet,
    id: newFieldSetId,
  });

  return newFieldSet;
}

export default async function (client: Client): Promise<void> {
  // Menu/Acknowledgement
  await updateModelId(
    client,
    "cwH6Kg6_TaSoLn1W_n2Wxw",
    "H7cTIWERTG-z24IE8ILCUw"
  );

  // Layer/i-menu-inhoud
  const updatedFieldSet = await updateFieldSetId(
    client,
    "V86BklmIRC-M4iutvf6HCA",
    "fl8ztEqVSRGlgIkNPJ7Q6A"
  );

  // Layer/Custom metadata
  await updateModelId(
    client,
    "UwP31BSYTN6KO2CSFEj9RQ",
    "AnW00ZQ9SD24bxIA_Jsybw",
    updatedFieldSet.id
  );

  // Layer/Bron
  await updateModelId(
    client,
    "bazGmA0UQEOtH0fHQDmjhw",
    "MST_hSw-RoCAnLWs8zG0lQ",
    updatedFieldSet.id
  );

  // Layer/Info
  await updateModelId(
    client,
    "de-_bwOQTs-VFcbFALx_Jg",
    "AlZmC-hgTQit4j1Q2F5tiw",
    updatedFieldSet.id
  );

  // Layer / Bijsluiter
  await updateModelId(
    client,
    "ElAXDD8CT9aBrmvX0o60UA",
    "UScG4yk-TCa813E85W-apg",
    updatedFieldSet.id
  );
}

async function duplicate(client: Client, data: any) {
  return await Promise.all(
    data.map(async (itemId: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...record } = await client.items.find(itemId);

      return buildBlockRecord(record);
    })
  );
}
