import { Parser } from "json2csv";
import { xmlToJson } from "./xmlToJson.js";
import type { XmlConversionOptions } from "./types.js";
import type { GenericObject } from "./types.js";

/**
 * オブジェクトをフラット化する補助関数
 */
function flattenObject(obj: GenericObject, prefix = ""): GenericObject {
  return Object.entries(obj).reduce((acc: GenericObject, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value as GenericObject, newKey));
    } else {
      acc[newKey] = value;
    }
    return acc;
  }, {});
}

/**
 * XMLをCSVに変換する関数
 * @param xmlString - XML文字列
 * @param options - 変換オプション
 * @returns CSV文字列
 */
export async function xmlToCsv(
  xmlString: string,
  options: XmlConversionOptions = {}
): Promise<string> {
  const {
    csvOptions = {},
    flattenNestedObjects = true,
    ...xmlOptions
  } = options;

  // XMLをJSONに変換
  const jsonData = await xmlToJson(xmlString, xmlOptions);

  if (!jsonData || jsonData.length === 0 || !jsonData[0]) {
    return "";
  }

  // オブジェクトをCSV用に変換
  const processedData = jsonData.map((item) => {
    if (flattenNestedObjects) {
      return flattenObject(item);
    }

    const processed: GenericObject = {};
    for (const [key, value] of Object.entries(item)) {
      processed[key] =
        typeof value === "object" ? JSON.stringify(value) : value;
    }
    return processed;
  });

  // フィールドの一覧を取得（全てのオブジェクトのキーを統合）
  const fields = [...new Set(processedData.flatMap((obj) => Object.keys(obj)))];

  // CSVオプションを設定
  const defaultCsvOptions = {
    quote: "",
    escapedQuote: "",
    fields,
    ...csvOptions,
  };

  // CSVに変換
  const parser = new Parser(defaultCsvOptions);
  return parser.parse(processedData);
}
