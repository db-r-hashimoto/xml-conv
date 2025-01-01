import { xmlToJson } from "../src/xmlToJson";

describe("xmlToJson", () => {
  describe("基本的な変換機能", () => {
    it("単一要素の変換", async () => {
      const xml = `
        <root>
          <item>
            <name>山田太郎</name>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result).toEqual([{ name: "山田太郎" }]);
    });

    it("複数要素の変換", async () => {
      const xml = `
        <root>
          <item>
            <name>山田太郎</name>
            <age>30</age>
          </item>
          <item>
            <name>佐藤花子</name>
            <age>25</age>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result).toEqual([
        { name: "山田太郎", age: "30" },
        { name: "佐藤花子", age: "25" },
      ]);
    });
  });

  describe("階層構造の処理", () => {
    it("ネストされた要素の変換", async () => {
      const xml = `
        <root>
          <user>
            <profile>
              <name>山田太郎</name>
              <details>
                <age>30</age>
                <address>
                  <city>東京</city>
                  <street>渋谷区</street>
                </address>
              </details>
            </profile>
          </user>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        user: {
          profile: {
            name: "山田太郎",
            details: {
              age: "30",
              address: {
                city: "東京",
                street: "渋谷区",
              },
            },
          },
        },
      });
    });

    it("カスタムルート要素からの変換", async () => {
      const xml = `
        <root>
          <user>
            <items>
              <item>
                <name>テスト</name>
              </item>
            </items>
          </user>
        </root>
      `;
      const result = await xmlToJson(xml, { rootElement: "root.user.items" });
      expect(result).toEqual([{ name: "テスト" }]);
    });
  });

  describe("属性の処理", () => {
    it("要素の属性を変換", async () => {
      const xml = `
        <root>
          <item id="1" type="user">
            <name>山田太郎</name>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        "@id": "1",
        "@type": "user",
        name: "山田太郎",
      });
    });

    it("ネストされた要素の属性を変換", async () => {
      const xml = `
        <root>
          <item>
            <data type="personal" visibility="private">
              <name>山田太郎</name>
            </data>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        data: {
          "@type": "personal",
          "@visibility": "private",
          name: "山田太郎",
        },
      });
    });
  });

  describe("エラー処理", () => {
    it("不正なXMLでエラーをスロー", async () => {
      const invalidXml = "<root><invalid></root>";
      await expect(xmlToJson(invalidXml)).rejects.toThrow();
    });

    it("空のXMLで空配列を返す", async () => {
      const emptyXml = "<root></root>";
      const result = await xmlToJson(emptyXml);
      expect(result).toEqual([]);
    });

    it("存在しないルート要素を指定した場合に空配列を返す", async () => {
      const xml = `
        <root>
          <item>
            <name>テスト</name>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml, { rootElement: "nonexistent" });
      expect(result).toEqual([]);
    });
  });

  describe("エッジケース", () => {
    it("空の要素を含むXMLを処理", async () => {
      const xml = `
        <root>
          <item>
            <name>テスト</name>
            <empty></empty>
            <another/>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({ name: "テスト" });
    });

    it("テキストと属性が混在する要素を処理", async () => {
      const xml = `
        <root>
          <item id="1">テキスト内容</item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        "@id": "1",
        _: "テキスト内容",
      });
    });

    it("特殊文字を含むXMLを処理", async () => {
      const xml = `
        <root>
          <item>
            <name>&lt;山田&gt; &amp; 太郎</name>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        name: "<山田> & 太郎",
      });
    });
  });
});
