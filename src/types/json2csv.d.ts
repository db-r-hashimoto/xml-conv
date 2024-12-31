declare module "json2csv" {
  /**
   * オプション型の定義
   */
  export interface ParserOptions<T = any> {
    /**
     * CSVのヘッダーを含めるかどうか
     * デフォルト: true
     */
    header?: boolean;

    /**
     * エスケープする必要のある文字を自動的にエスケープするかどうか
     * デフォルト: false
     */
    escapedQuote?: string;

    /**
     * エスケープする文字
     * デフォルト: "
     */
    quote?: string;

    /**
     * カラムの定義
     * カラム名とパスを指定できる
     */
    fields?: Array<
      | string
      | {
          label?: string;
          value: string | ((row: T) => any);
          default?: any;
        }
    >;

    /**
     * デリミタ
     * デフォルト: ,
     */
    delimiter?: string;

    /**
     * エンコーディング
     * デフォルト: utf8
     */
    encoding?: string;
  }

  /**
   * Parserクラス
   */
  export class Parser<T = any> {
    /**
     * コンストラクタ
     * @param options パースオプション
     */
    constructor(options?: ParserOptions<T>);

    /**
     * JSONデータをCSVに変換
     * @param data 変換するJSONデータ
     * @returns 変換されたCSV文字列
     */
    parse(data: T[]): string;
  }

  /**
   * JSON2CSVの変換関数
   * @param data 変換するJSONデータ
   * @param options パースオプション
   * @returns 変換されたCSV文字列
   */
  export function parse<T = any>(data: T[], options?: ParserOptions<T>): string;
}
