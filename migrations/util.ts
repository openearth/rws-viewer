import {
  type Client,
  buildBlockRecord,
} from "@datocms/cli/lib/cma-client-node";
import * as deepl from "deepl-node";
import { type TextResult } from "deepl-node";

const authKey = "1009e706-f52b-458b-b767-caefd5c216b0";
export const translator = new deepl.Translator(authKey);

export const translateToEn = async (text: string): Promise<string> => {
  if (!text) return text;

  return `Translated: ${text}`;

  const translatedText = (await translator.translateText(
    text,
    "nl",
    "en-US"
  )) as TextResult;

  return translatedText.text;
};

export const updateFieldLocalization = async (
  client: Client,
  fieldId: string,
  fieldName: string,
  modelName: string
) => {
  console.log(`Updating ${fieldName} field in model ${modelName}`);

  await client.fields.update(fieldId, {
    localized: true,
    default_value: { en: null, nl: null },
  });
};

export const buildTranslatedBlockRecord = async (
  record: any,
  translateFields: string[]
) => {
  const translatedRecord: any = {};

  for (const field of translateFields) {
    translatedRecord[field] = await translateToEn(record[field]);
  }

  return buildBlockRecord({ ...record, ...translatedRecord });
};

export const translateNestedModularContent = async (
  nestedFields: any,
  translateFields: string[],
  client: Client
) => {
  return {
    en: await Promise.all(
      nestedFields.en.map(async (itemId: string) => {
        const { id, ...record } = await client.items.find(itemId);

        return buildTranslatedBlockRecord(record, translateFields);
      })
    ),
    nl: await Promise.all(
      nestedFields.en.map(async (itemId: string) => {
        const { id, ...record } = await client.items.find(itemId);

        return buildBlockRecord(record);
      })
    ),
  };
};
