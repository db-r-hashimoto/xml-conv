declare module "xml2js" {
  export interface ParserOptions {
    /**
     * 配列を明示的に使用するかどうか
     * デフォルトはtrue
     */
    explicitArray?: boolean;

    /**
     * 文字列の前後の空白を削除するかどうか
     * デフォルトはfalse
     */
    trim?: boolean;

    /**
     * 属性を親オブジェクトにマージするかどうか
     * デフォルトはfalse
     */
    mergeAttrs?: boolean;

    /**
     * ルート要素を明示的に含めるかどうか
     * デフォルトはtrue
     */
    explicitRoot?: boolean;

    /**
     * 属性のキー名
     * デフォルトは '$'
     */
    attrkey?: string;
  }

  export class Parser {
    /**
     * XML Parserのコンストラクタ
     * @param options パース時のオプション
     */
    constructor(options?: ParserOptions);

    /**
     * XMLをパースする
     * @param xml パースするXML文字列
     * @param callback パース完了後のコールバック関数
     */
    parseString(
      xml: string,
      callback: (err: Error | null, result: any) => void
    ): void;
  }

  /**
   * XMLを直接パースする関数
   * @param xml パースするXML文字列
   * @param callback パース完了後のコールバック関数
   */
  export function parseString(
    xml: string,
    callback: (err: Error | null, result: any) => void
  ): void;

  /**
   * オプション付きでXMLをパースする関数
   * @param xml パースするXML文字列
   * @param options パース時のオプション
   * @param callback パース完了後のコールバック関数
   */
  export function parseString(
    xml: string,
    options: ParserOptions,
    callback: (err: Error | null, result: any) => void
  ): void;
}
