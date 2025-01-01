import { parseString, ParserOptions } from "xml2js";

/**
 * Parses XML string to JSON
 * @param xmlString - XML content to parse
 * @returns Promise resolving to parsed JSON
 */
export async function parseXmlToJson(xml: string): Promise<any> {
  const options: ParserOptions = {
    explicitArray: false,
    mergeAttrs: false,
    attrkey: "@",
    explicitRoot: true,
    trim: true,
  };

  return new Promise((resolve, reject) => {
    parseString(xml, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
