import { Parser } from "json2csv";
import { xmlToJson } from "./xmlToJson.js";
import type { XmlConversionOptions, GenericObject } from "./types.js";

type PathMap = Record<string, any>;
type ArrayMap = Record<string, any[]>;

function expandArrayObject(
  obj: any,
  prefix: string = ""
): { paths: PathMap; arrays: ArrayMap } {
  const paths: PathMap = {};
  const arrays: ArrayMap = {};

  if (!obj || typeof obj !== "object") {
    return { paths: { [prefix]: String(obj) }, arrays: {} };
  }

  if (Array.isArray(obj)) {
    return { paths: {}, arrays: { [prefix]: obj } };
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === "_") {
      paths[prefix] = String(value);
      continue;
    }

    if (key === "@" && value && typeof value === "object") {
      for (const [attrKey, attrValue] of Object.entries(value)) {
        const attrPath = `${prefix}_${attrKey}`;
        paths[attrPath] = String(attrValue);
      }
      continue;
    }

    const newPrefix = prefix ? `${prefix}_${key}` : key;

    if (Array.isArray(value)) {
      arrays[newPrefix] = value;
    } else if (value && typeof value === "object") {
      const { paths: nestedPaths, arrays: nestedArrays } = expandArrayObject(
        value,
        newPrefix
      );
      Object.assign(paths, nestedPaths);
      Object.assign(arrays, nestedArrays);
    } else if (value != null) {
      paths[newPrefix] = String(value);
    }
  }
  return { paths, arrays };
}

function generateArrayCombinations(arrays: ArrayMap): PathMap[] {
  const keys = Object.keys(arrays);
  if (keys.length === 0) return [{}];

  const [firstKey, ...restKeys] = keys;
  const firstValues = arrays[firstKey];
  const restArrays: ArrayMap = {};
  restKeys.forEach((key) => {
    restArrays[key] = arrays[key];
  });

  const restCombinations =
    restKeys.length > 0 ? generateArrayCombinations(restArrays) : [{}];

  const allCombinations: PathMap[] = [];

  for (const value of firstValues) {
    let currentValue: PathMap = {};

    // オブジェクトの場合は展開
    if (typeof value === "object" && value !== null) {
      const { paths: objectPaths, arrays: nestedArrays } = expandArrayObject(
        value,
        firstKey
      );

      // ネストされた配列がある場合は再帰的に処理
      if (Object.keys(nestedArrays).length > 0) {
        const nestedCombinations = generateArrayCombinations(nestedArrays);
        for (const nestedComb of nestedCombinations) {
          currentValue = { ...objectPaths, ...nestedComb };
          for (const restComb of restCombinations) {
            allCombinations.push({ ...currentValue, ...restComb });
          }
        }
      } else {
        currentValue = objectPaths;
        for (const restComb of restCombinations) {
          allCombinations.push({ ...currentValue, ...restComb });
        }
      }
    } else {
      // プリミティブ値の場合は直接使用
      currentValue = { [firstKey]: String(value) };
      for (const restComb of restCombinations) {
        allCombinations.push({ ...currentValue, ...restComb });
      }
    }
  }

  return allCombinations;
}

function sortFields(fields: string[]): string[] {
  return fields.sort();
}

export async function xmlToCsv(
  xmlString: string,
  options: XmlConversionOptions = {}
): Promise<string> {
  try {
    const jsonData = await xmlToJson(xmlString, {
      ...options,
      arrayHandling: "preserve",
    });

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return "";
    }

    const rows: Record<string, string>[] = [];

    for (const item of jsonData) {
      const { paths, arrays } = expandArrayObject(item);
      const combinations = generateArrayCombinations(arrays);

      for (const combination of combinations) {
        const row = { ...paths, ...combination };
        rows.push(row);
      }
    }

    if (rows.length === 0) {
      return "";
    }

    const fields = sortFields(
      Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
    );

    const defaultCsvOptions = {
      fields,
      delimiter: ",",
      header: true,
      quote: "",
      escape: '"',
      ...options.csvOptions,
    };

    const parser = new Parser(defaultCsvOptions);
    return parser.parse(rows);
  } catch (error) {
    console.error("Error:", error);
    throw new Error(`Failed to convert XML to CSV: ${error}`);
  }
}
