import { parseXmlToJson } from "./utils.js";
import type { XmlConversionOptions, GenericObject } from "./types.js";

/**
 * Flattens a nested object
 * @param item - Object to flatten
 * @returns Flattened object
 */
export function flattenObject(item: GenericObject): GenericObject {
  const result: GenericObject = {};

  const flatten = (obj: GenericObject, prefix: string = "") => {
    if (!obj || typeof obj !== "object" || Object.keys(obj).length === 0) {
      // 空オブジェクトまたは無効な値の場合はスキップ
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        flatten(value, newKey);
      } else if (value !== undefined && value !== "") {
        // 空文字列や undefined 以外の値のみを追加
        result[newKey] = value;
      }
    }
  };

  flatten(item);
  return result;
}

/**
 * Extracts items from deeply nested XML structure
 * @param data - Parsed XML data
 * @returns Array of items
 */
function extractItems(data: GenericObject | GenericObject[]): GenericObject[] {
  // 空のデータまたは無効なデータの処理
  if (!data) return [];
  if (typeof data !== "object") return [];
  if (Object.keys(data).length === 0) return [];

  function processAttributes(item: GenericObject): GenericObject | null {
    if (!item || typeof item !== "object") return null;
    if (Object.keys(item).length === 0) return null;

    const result: GenericObject = {};
    let hasValidContent = false;

    for (const [key, value] of Object.entries(item)) {
      if (key === "@") {
        // 属性処理
        Object.entries(value).forEach(([attrKey, attrValue]) => {
          if (
            attrValue !== undefined &&
            attrValue !== null &&
            attrValue !== ""
          ) {
            result[`@${attrKey}`] = attrValue;
            hasValidContent = true;
          }
        });
      } else {
        // 要素の処理
        if (typeof value === "object" && value !== null) {
          // ネストされた要素を独立して処理
          const nestedResult: GenericObject = {};

          // ネストされた要素の属性を処理
          if (value["@"]) {
            Object.entries(value["@"]).forEach(([attrKey, attrValue]) => {
              if (
                attrValue !== undefined &&
                attrValue !== null &&
                attrValue !== ""
              ) {
                nestedResult[`@${attrKey}`] = attrValue;
              }
            });
          }

          // ネストされた要素の中身を処理
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            if (nestedKey !== "@") {
              if (typeof nestedValue === "object" && nestedValue !== null) {
                const processed = processAttributes(nestedValue);
                if (processed) {
                  nestedResult[nestedKey] = processed;
                }
              } else if (
                nestedValue !== undefined &&
                nestedValue !== null &&
                nestedValue !== ""
              ) {
                nestedResult[nestedKey] = nestedValue;
              }
            }
          }

          if (Object.keys(nestedResult).length > 0) {
            result[key] = nestedResult;
            hasValidContent = true;
          }
        } else if (value !== undefined && value !== null && value !== "") {
          result[key] = value;
          hasValidContent = true;
        }
      }
    }

    return hasValidContent ? result : null;
  }

  function deepExtract(obj: GenericObject): GenericObject[] {
    if (!obj || typeof obj !== "object") return [];
    if (Object.keys(obj).length === 0) return [];

    // 子要素の処理（itemキーへの依存を削除）
    for (const [key, value] of Object.entries(obj)) {
      if (key === "root") {
        return deepExtract(value);
      }
      if (typeof value === "object") {
        if (Array.isArray(value)) {
          const processed = value
            .map(processAttributes)
            .filter((item): item is GenericObject => item !== null);
          return processed.length > 0 ? processed : [];
        }
        const processed = processAttributes(value);
        if (processed) return [processed];

        const extracted = deepExtract(value);
        if (extracted.length > 0) return extracted;
      }
    }

    const processed = processAttributes(obj);
    return processed ? [processed] : [];
  }

  return deepExtract(data);
}

/**
 * Converts XML to JSON
 * @param xmlString - XML content to convert
 * @param options - Optional configuration for conversion
 * @returns Promise resolving to JSON object
 */
export async function xmlToJson(
  xmlString: string,
  options: XmlConversionOptions = {}
): Promise<GenericObject[]> {
  const { rootElement = "root", flattenNestedObjects = false } = options;

  const parsedJson = await parseXmlToJson(xmlString);

  // カスタムルート要素の処理
  let data = parsedJson;
  if (rootElement !== "root") {
    const rootPath = rootElement.split(".");
    let current = data;
    for (const key of rootPath) {
      if (!current || !current[key]) {
        return [];
      }
      current = current[key];
    }

    // フラット化が無効の場合は、オブジェクト構造をそのまま保持
    if (!flattenNestedObjects) {
      // item要素の特別処理
      if (current.item) {
        const itemData = current.item;
        const result: GenericObject = {};

        // オブジェクトのプロパティを直接コピー
        for (const [key, value] of Object.entries(itemData)) {
          if (key !== "@" && key !== "#") {
            result[key] = value;
          }
        }

        // 属性がある場合は処理
        if (itemData["@"]) {
          for (const [key, value] of Object.entries(itemData["@"])) {
            result[`@${key}`] = value;
          }
        }

        return [result];
      }

      // item要素がない場合は通常処理
      return [current];
    }

    data = { [rootPath[rootPath.length - 1]]: current };
  }

  // フラット化処理
  if (flattenNestedObjects) {
    const flattened = flattenObject(data);
    if (Object.keys(flattened).length === 0) {
      return [{}];
    }

    const result: GenericObject[] = [];
    const items = Object.entries(flattened).reduce(
      (acc: GenericObject, [key, value]) => {
        // rootElement以下のキーのみを処理
        const lastKey = rootElement.split(".").pop() || "root";
        if (!key.startsWith(`${lastKey}.`)) return acc;

        // プレフィックスを削除
        const newKey = key.replace(`${lastKey}.`, "");
        acc[newKey] = value;
        return acc;
      },
      {}
    );

    result.push(items);
    return result;
  }

  return extractItems(data);
}
