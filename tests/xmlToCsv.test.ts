import { xmlToCsv } from "../src/xmlToCsv";

describe("xmlToCsv", () => {
  describe("基本的な変換", () => {
    it("単一要素の変換", async () => {
      const xml = `
        <root>
          <item>
            <name>山田太郎</name>
            <age>30</age>
          </item>
        </root>
      `;
      const csv = await xmlToCsv(xml);
      expect(csv).toBe("age,name\n30,山田太郎");
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
      const csv = await xmlToCsv(xml);
      expect(csv).toBe("age,name\n30,山田太郎\n25,佐藤花子");
    });
  });

  describe("配列の処理", () => {
    it("配列要素を複数行に展開", async () => {
      const xml = `
        <root>
          <item>
            <order>
              <id>1</id>
              <products>
                <product>商品A</product>
                <product>商品B</product>
              </products>
              <total>1000</total>
            </order>
          </item>
        </root>
      `;
      const csv = await xmlToCsv(xml);
      expect(csv).toBe(
        "order_id,order_products_product,order_total\n" +
          "1,商品A,1000\n" +
          "1,商品B,1000"
      );
    });
  });

  describe("属性の処理", () => {
    it("要素の属性を処理", async () => {
      const xml = `
        <root>
          <item>
            <product id="1" type="book">
              <name>プログラミング入門</name>
              <price currency="JPY">2000</price>
            </product>
          </item>
        </root>
      `;
      const csv = await xmlToCsv(xml);
      expect(csv).toBe(
        "product_@id,product_@type,product_name,product_price,product_price_@currency\n" +
          "1,book,プログラミング入門,2000,JPY"
      );
    });
  });

  describe("エッジケース", () => {
    it("空のXMLを処理", async () => {
      const xml = "<root></root>";
      const csv = await xmlToCsv(xml);
      expect(csv).toBe("");
    });

    it("空の要素を含むXMLを処理", async () => {
      const xml = `
        <root>
          <item>
            <name>test</name>
            <value></value>
            <empty/>
          </item>
        </root>
      `;
      const csv = await xmlToCsv(xml);
      expect(csv).toBe("name\ntest");
    });

    it("不正なXMLでエラーをスロー", async () => {
      const xml = "<root><invalid></root>";
      await expect(xmlToCsv(xml)).rejects.toThrow();
    });
  });

  describe("複合的なケース", () => {
    it("ネストした配列と属性を含むXMLを処理", async () => {
      const xml = `
        <root>
          <item>
            <order id="1">
              <products>
                <product code="A">
                  <name>商品A</name>
                  <categories>
                    <category>電化製品</category>
                    <category>家電</category>
                  </categories>
                </product>
                <product code="B">
                  <name>商品B</name>
                  <categories>
                    <category>食品</category>
                  </categories>
                </product>
              </products>
            </order>
          </item>
        </root>
      `;
      const csv = await xmlToCsv(xml);
      expect(csv).toBe(
        "order_@id,order_products_product_@code,order_products_product_categories_category,order_products_product_name\n" +
          "1,A,電化製品,商品A\n" +
          "1,A,家電,商品A\n" +
          "1,B,食品,商品B"
      );
    });
  });
});
