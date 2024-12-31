import { xmlToCsv } from "../src/xmlToCsv.js";

describe("xmlToCsv 変換", () => {
  // シンプルなXMLテスト
  const simpleXml = `
    <root>
      <item>
        <name>山田太郎</name>
        <age>30</age>
        <city>東京</city>
      </item>
      <item>
        <name>佐藤花子</name>
        <age>25</age>
        <city>大阪</city>
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

  it("シンプルなXMLをCSVに変換", async () => {
    const result = await xmlToCsv(simpleXml);

    // CSVの内容を検証
    expect(result).toContain("name,age,city");
    expect(result).toContain("山田太郎,30,東京");
    expect(result).toContain("佐藤花子,25,大阪");
  });

  it("ネストされたXMLをフラット化してCSVに変換", async () => {
    const result = await xmlToCsv(nestedXml, {
      rootElement: "root.user.profile",
      flattenNestedObjects: true,
    });

    // CSVの内容を検証
    expect(result).toContain(
      "name,details.age,details.address.city,details.address.street"
    );
    expect(result).toContain("山田太郎,30,東京,渋谷区");
  });

  it("属性を含むXMLをCSVに変換", async () => {
    const result = await xmlToCsv(xmlWithAttributes);

    // CSVの内容を検証
    expect(result).toContain("@id,name,age");
    expect(result).toContain("1,山田太郎,30");
  });

  it("カスタムデリミタを使用", async () => {
    const result = await xmlToCsv(simpleXml, {
      csvOptions: {
        delimiter: ";",
      },
    });

    // デリミタを検証
    expect(result).toContain("name;age;city");
    expect(result).toContain("山田太郎;30;東京");
  });

  it("ネストされた構造を保持してCSVに変換", async () => {
    const nestedXml = `
      <root>
        <user>
          <profile>
            <name>山田太郎</name>
            <details>
              <age>30</age>
              <hobby>プログラミング</hobby>
            </details>
          </profile>
        </user>
      </root>
    `;

    const result = await xmlToCsv(nestedXml, {
      rootElement: "root.user.profile",
      flattenNestedObjects: true,
    });

    // フラット化されたCSVを検証
    expect(result).toContain("name,details.age,details.hobby");
    expect(result).toContain("山田太郎,30,プログラミング");
  });

  it("不正なXMLの場合にエラーをスロー", async () => {
    await expect(xmlToCsv("<invalid>xml")).rejects.toThrow();
  });

  it("空のデータを処理", async () => {
    const emptyXml = "<root></root>";
    const result = await xmlToCsv(emptyXml);

    // 空のデータに対する適切な処理を検証
    expect(result.trim()).toBe("");
  });
});
