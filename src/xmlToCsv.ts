import { Parser } from "json2csv";
import { xmlToJson } from "./xmlToJson.js";
import type { XmlConversionOptions } from "./types.js";
import type { GenericObject } from "./types.js";

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
  const { csvOptions = {}, ...xmlOptions } = options;

  // XMLをJSONに変換
  const jsonData = await xmlToJson(xmlString, xmlOptions);

  if (!jsonData || jsonData.length === 0 || !jsonData[0]) {
    return "";
  }

  // オブジェクトをCSV用に変換
  const processedData = jsonData.map((item) => {
    const processed: GenericObject = {};
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === "object") {
        processed[key] = JSON.stringify(value);
      } else {
        processed[key] = value;
      }
    }
    return processed;
  });

  // CSVオプションを設定
  const defaultCsvOptions = {
    quote: "",
    escapedQuote: "",
    fields: Object.keys(jsonData[0]),
    ...csvOptions,
  };

  // CSVに変換
  const parser = new Parser(defaultCsvOptions);
  return parser.parse(processedData);
}
