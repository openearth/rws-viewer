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

  const translatedText = (await translator.translateText(
    text,
    "nl",
    "en-US"
  )) as TextResult;

  return translatedText.text;
};

export class FetchWithThrottle {
  private maxRequestsPerInterval: number;
  private interval: number;
  private queue: Array<{
    url: string;
    options?: RequestInit;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    retries: number;
    retryDelay: number;
  }>;
  private currentRequests: number;

  constructor(maxRequestsPerInterval: number, interval: number) {
    this.maxRequestsPerInterval = maxRequestsPerInterval;
    this.interval = interval;
    this.queue = [];
    this.currentRequests = 0;

    setInterval(this.processQueue, this.interval);
  }

  public fetchWithThrottle = (
    url: string,
    options?: RequestInit,
    retries = 3,
    retryDelay = 1000
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject, retries, retryDelay });
      this.processQueue();
    });
  };

  private processQueue = (): void => {
    while (
      this.queue.length > 0 &&
      this.currentRequests < this.maxRequestsPerInterval
    ) {
      const { url, options, resolve, reject, retries, retryDelay } =
        this.queue.shift()!;
      this.currentRequests++;
      this.makeFetchRequest(url, options, resolve, reject, retries, retryDelay);
    }
  };

  private makeFetchRequest = (
    url: string,
    options: RequestInit | undefined,
    resolve: (value: any) => void,
    reject: (reason?: any) => void,
    retries: number,
    retryDelay: number
  ): void => {
    fetch(url, options)
      .then((response) => {
        this.currentRequests--;
        resolve(response);
        this.processQueue();
      })
      .catch((error) => {
        if (retries > 0) {
          setTimeout(() => {
            this.makeFetchRequest(
              url,
              options,
              resolve,
              reject,
              retries - 1,
              retryDelay
            );
          }, retryDelay);
        } else {
          this.currentRequests--;
          reject(error);
          this.processQueue();
        }
      });
  };
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
