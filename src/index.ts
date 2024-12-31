import type { Parser, ParserOptions } from "json2csv";

export { xmlToCsv } from "./xmlToCsv.js";
export { xmlToJson } from "./xmlToJson.js";
export { parseXmlToJson, flattenJson, isValidXml } from "./utils.js";
export type { XmlConversionOptions, GenericObject } from "./types.js";
