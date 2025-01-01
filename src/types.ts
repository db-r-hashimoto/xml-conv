import type { Parser, ParserOptions } from "json2csv";

/**
 * XMLの変換オプション
 */
export interface XmlConversionOptions extends XmlToJsonOptions {
  csvOptions?: {
    delimiter?: string;
    quote?: string;
    escape?: string;
    header?: boolean;
    [key: string]: any;
  };
}

/**
 * XMLのJSON変換オプション
 */
export interface XmlToJsonOptions {
  rootElement?: string;
  arrayHandling?: "preserve" | "concatenate"; // 配列の処理方法
  arraySeparator?: string; // 結合時の区切り文字
}

/**
 * XML要素の値の型
 */
export interface XmlValue {
  _?: string;
  $?: { [key: string]: string };
  [key: string]: any;
}

/**
 * 汎用オブジェクト型
 */
export type GenericObject = { [key: string]: any };

// ESモジュールとして認識されるように空のexportを追加
export {};
