import {
  type Client,
  buildBlockRecord,
} from "@datocms/cli/lib/cma-client-node";
import { backOff } from "exponential-backoff";
import * as deepl from "deepl-node";
import { type TextResult } from "deepl-node";

const authKey = "1009e706-f52b-458b-b767-caefd5c216b0";
export const translator = new deepl.Translator(authKey);

export const translateToEn = async (text: string): Promise<string> => {
  if (!text) return text;

  const translatedText = (await translator.translateText(
    text,
    "nl",
    "en-US"
  )) as TextResult;

  return translatedText.text;
};

export async function fetchWithBackoff(url: string, options = {}) {
  const fetchFunction = async () => {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  };

  try {
    const response = await backOff(fetchFunction, {
      retry: (error, attemptNumber) => {
        console.log(`Attempt ${attemptNumber}: ${error.message}`);
        return true; // Retry on any error
      },
      startingDelay: 500, // Initial delay in milliseconds
      maxDelay: 5000, // Maximum delay in milliseconds
      numOfAttempts: 5, // Total number of attempts
    });

    return response;
  } catch (error) {
    console.error("Fetch failed after multiple attempts:", error);
    throw error;
  }
}


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
