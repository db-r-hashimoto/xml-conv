import { parseString, ParserOptions } from "xml2js";

/**
 * Parses XML string to JSON
 * @param xmlString - XML content to parse
 * @returns Promise resolving to parsed JSON
 */
export async function parseXmlToJson(xml: string): Promise<any> {
  const options: ParserOptions = {
    explicitArray: false, // 配列を明示的に処理
    mergeAttrs: false, // 属性をマージしない
    attrkey: "@", // 属性のプレフィックス
    explicitRoot: true, // ルート要素を明示的に含める
    trim: true, // 空白文字をトリム
  };

  return new Promise((resolve, reject) => {
    parseString(xml, options, (err, result) => {
      // console.log(result.root.item);
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * Flattens nested JSON to a single-level object
 * @param obj - Nested JSON object
 * @param prefix - Prefix for nested keys
 * @returns Flattened object
 */
export function flattenJson(obj: any, prefix: string = ""): any {
  return Object.keys(obj).reduce((acc: { [key: string]: any }, k: string) => {
    const pre = prefix.length ? prefix + "." : "";

    if (
      typeof obj[k] === "object" &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenJson(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }

    return acc;
  }, {});
}

/**
 * Validates XML string
 * @param xmlString - XML content to validate
 * @returns Boolean indicating XML validity
 */
export function isValidXml(xmlString: string): Promise<boolean> {
  // 空文字列や無効な入力を事前チェック
  if (
    !xmlString ||
    typeof xmlString !== "string" ||
    xmlString.trim().length === 0
  ) {
    return Promise.resolve(false);
  }

  // 最小限のXML構造チェック
  if (!xmlString.match(/<[^>]+>/)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    parseString(xmlString, (err) => {
      resolve(!err);
    });
  });
}
