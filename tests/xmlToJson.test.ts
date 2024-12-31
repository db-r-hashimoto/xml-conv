import { xmlToJson } from "../src/xmlToJson.js";
import type { GenericObject } from "../src/types.js";

describe("xmlToJson 変換", () => {
  // シンプルなXMLテスト
  const simpleXml = `
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

  // ネストされたXMLテスト
  const nestedXml = `
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

  // 属性を含むXMLテスト
  const xmlWithAttributes = `
    <root>
      <item id="1">
        <name>山田太郎</name>
        <age>30</age>
      </item>
    </root>
  `;

  it("シンプルなXMLをJSONに変換", async () => {
    const result: GenericObject[] = await xmlToJson(simpleXml);

    // 結果の検証
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);

    // 最初のアイテムの構造を確認
    expect(result[0]).toEqual({
      name: "山田太郎",
      age: "30",
    });

    // 2番目のアイテムの構造を確認
    expect(result[1]).toEqual({
      name: "佐藤花子",
      age: "25",
    });
  });

  it("ネストされたXMLをフラット化", async () => {
    const result: GenericObject[] = await xmlToJson(nestedXml, {
      flattenNestedObjects: true,
    });

    // 結果の構造を確認
    expect(result[0]).toEqual({
      "user.profile.name": "山田太郎",
      "user.profile.details.age": "30",
      "user.profile.details.address.city": "東京",
      "user.profile.details.address.street": "渋谷区",
    });
  });

  it("属性を含むXMLを変換", async () => {
    const result: GenericObject[] = await xmlToJson(xmlWithAttributes);

    // 結果の構造を確認
    expect(result[0]).toEqual({
      "@id": "1",
      name: "山田太郎",
      age: "30",
    });
  });

  it("不正なXMLの場合にエラーをスロー", async () => {
    await expect(xmlToJson("<invalid>xml")).rejects.toThrow();
  });

  it("ルート要素をカスタマイズ", async () => {
    const customRootXml = `
      <custom>
        <item>
          <name>山田太郎</name>
        </item>
      </custom>
    `;

    const result: GenericObject[] = await xmlToJson(customRootXml, {
      rootElement: "custom",
    });

    expect(result[0]).toEqual({
      name: "山田太郎",
    });
  });

  // 追加のエッジケースのテスト
  it("空のデータや特殊な構造を処理", async () => {
    const emptyXml = "<root></root>";
    const result = await xmlToJson(emptyXml);
    expect(result).toEqual([]);
  });

  it("深くネストされた構造を処理", async () => {
    const deepNestedXml = `
      <root>
        <very>
          <deeply>
            <nested>
              <item>
                <name>深いネスト</name>
              </item>
            </nested>
          </deeply>
        </very>
      </root>
    `;

    const result = await xmlToJson(deepNestedXml, {
      rootElement: "root.very.deeply.nested",
    });

    expect(result[0]).toEqual({
      name: "深いネスト",
    });
  });

  it("未定義の要素パスを処理", async () => {
    const result = await xmlToJson(simpleXml, {
      rootElement: "nonexistent.path",
    });
    expect(result).toEqual([]);
  });

  it("深くネストされた無効なパスを処理", async () => {
    const result = await xmlToJson(nestedXml, {
      rootElement: "root.invalid.path",
    });
    expect(result).toEqual([]);
  });

  it("フラット化で空のオブジェクトを処理", async () => {
    const emptyXml = "<root><item></item></root>";
    const result = await xmlToJson(emptyXml, {
      flattenNestedObjects: true,
    });
    expect(result).toEqual([{}]);
  });

  describe("フラット化処理のエッジケース", () => {
    it("nullやundefinedを含むオブジェクトを処理", async () => {
      const xml = `
        <root>
          <item>
            <valid>value</valid>
            <null></null>
            <empty/>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        valid: "value",
      });
    });

    it("無効な値を含むネストされたオブジェクトを処理", async () => {
      const xml = `
        <root>
          <nested>
            <invalid></invalid>
            <empty/>
            <valid>
              <name>test</name>
            </valid>
          </nested>
        </root>
      `;
      const result = await xmlToJson(xml, { flattenNestedObjects: true });
      expect(result[0]).toEqual({
        "nested.valid.name": "test",
      });
    });
  });

  describe("深い階層のXML処理", () => {
    it("複数階層のネストされた要素を処理", async () => {
      const xml = `
        <root>
          <item>
            <item>
              <item>
                <name>nested item</name>
              </item>
            </item>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      // ネストされた構造を維持
      expect(result[0]).toEqual({
        item: {
          item: {
            name: "nested item",
          },
        },
      });
    });

    it("複雑な属性とネストを含む要素を処理", async () => {
      const xml = `
        <root>
          <item id="1">
            <nested attr="test">
              <value>content</value>
            </nested>
          </item>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        "@id": "1",
        nested: {
          "@attr": "test",
          value: "content",
        },
      });
    });
  });

  describe("エッジケースの処理", () => {
    it("空の要素を含むXMLを処理", async () => {
      const xml = `
        <root>
          <element></element>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result).toEqual([]);
    });

    it("空のitem要素を含むネストされた構造を処理", async () => {
      const xml = `
        <root>
          <nested>
            <item></item>
            <another>
              <item></item>
            </another>
          </nested>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result).toEqual([]);
    });

    it("複数のネストされた属性を持つ要素を処理", async () => {
      const xml = `
        <root>
          <nested attr1="value1">
            <subnested attr2="value2">
              <item>content</item>
            </subnested>
          </nested>
        </root>
      `;
      const result = await xmlToJson(xml);
      expect(result[0]).toEqual({
        "@attr1": "value1",
        subnested: {
          "@attr2": "value2",
          item: "content",
        },
      });
    });

    it("無効な値を含むネストされたオブジェクトをフラット化", async () => {
      const xml = `
        <root>
          <parent>
            <child1>valid</child1>
            <child2></child2>
            <child3>
              <grandchild></grandchild>
            </child3>
          </parent>
        </root>
      `;
      const result = await xmlToJson(xml, {
        flattenNestedObjects: true,
        rootElement: "root.parent",
      });
      expect(result[0]).toEqual({
        child1: "valid",
      });
    });
  });
});
