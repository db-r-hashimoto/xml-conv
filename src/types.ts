import type { Parser, ParserOptions } from "json2csv";

/**
 * XMLの変換オプション
 */
export interface XmlConversionOptions {
  rootElement?: string;
  flattenNestedObjects?: boolean;
  csvOptions?: ParserOptions;
}

/**
 * 汎用オブジェクト型
 */
export type GenericObject = { [key: string]: any };

// ESモジュールとして認識されるように空のexportを追加
export {};
