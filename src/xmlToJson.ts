import { parseString } from "xml2js";
import type { GenericObject, XmlToJsonOptions } from "./types.js";

/**
 * XMLをJSONに変換する関数
 */
export async function xmlToJson(
  xmlString: string,
  options: XmlToJsonOptions = {}
): Promise<any[]> {
  const { arrayHandling = "preserve", arraySeparator = ";" } = options;

  return new Promise((resolve, reject) => {
    const parserOptions = {
      explicitArray: false,
      mergeAttrs: false,
      valueKey: "_",
      attrkey: "@",
    };

    parseString(xmlString, parserOptions, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        let data = result;
        const rootElement = options.rootElement || "root";

        // 指定されたルート要素まで移動
        const path = rootElement.split(".");
        for (const key of path) {
          data = data?.[key] || {};
        }

        // アイテムを抽出して処理
        const items = extractItems(data);
        const processedItems = items
          .map((item) =>
            normalizeStructure(item, { arrayHandling, arraySeparator })
          )
          .filter(
            (item): item is GenericObject =>
              item !== null && Object.keys(item).length > 0
          );

        resolve(processedItems);
      } catch (e) {
        reject(e);
      }
    });
  });
}

function extractItems(data: any): any[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (data.item) {
    return Array.isArray(data.item) ? data.item : [data.item];
  }

  return [data];
}

function normalizeStructure(
  obj: any,
  options: { arrayHandling: "preserve" | "concatenate"; arraySeparator: string }
): GenericObject | null {
  if (!obj || typeof obj !== "object") return null;

  const result: GenericObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue;

    if (key === "@" && typeof value === "object") {
      // 属性を平坦化
      Object.entries(value as Record<string, unknown>).forEach(
        ([attrKey, attrValue]) => {
          if (attrValue !== null && attrValue !== undefined) {
            result[`${key}${attrKey}`] = attrValue;
          }
        }
      );
    } else if (Array.isArray(value)) {
      // 配列の処理
      const filteredArray = value.filter(
        (v) => v !== null && v !== undefined && v !== ""
      );
      if (filteredArray.length > 0) {
        if (options.arrayHandling === "concatenate") {
          result[key] = `[${filteredArray.join(options.arraySeparator)}]`;
        } else {
          result[key] = filteredArray
            .map((item) =>
              typeof item === "object"
                ? normalizeStructure(item, options)
                : item
            )
            .filter((item): item is GenericObject => item !== null);
        }
      }
    } else if (typeof value === "object") {
      const normalized = normalizeStructure(value, options);
      if (normalized && Object.keys(normalized).length > 0) {
        result[key] = normalized;
      }
    } else if (value !== "") {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}
