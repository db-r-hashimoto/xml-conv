import { parseXmlToJson } from "../src/utils";
import { jest } from "@jest/globals";

describe("utils", () => {
  // コンソールエラーをモック化
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  describe("parseXmlToJson", () => {
    it("基本的なXMLをJSONに変換", async () => {
      const xml = `
        <root>
          <item>
            <name>テスト</name>
            <value>123</value>
          </item>
        </root>
      `;

      const result = await parseXmlToJson(xml);
      expect(result).toEqual({
        root: {
          item: {
            name: "テスト",
            value: "123",
          },
        },
      });
    });

    it("属性を含むXMLを変換", async () => {
      const xml = `
        <root>
          <item id="1" type="test">
            <name>テスト</name>
          </item>
        </root>
      `;

      const result = await parseXmlToJson(xml);
      expect(result).toEqual({
        root: {
          item: {
            "@": {
              id: "1",
              type: "test",
            },
            name: "テスト",
          },
        },
      });
    });

    it("空の要素を変換", async () => {
      const xml = `
        <root>
          <empty></empty>
          <self-closing/>
        </root>
      `;
      const result = await parseXmlToJson(xml);
      expect(result).toEqual({
        root: {
          empty: "",
          "self-closing": "",
        },
      });
    });

    it("不正なXMLでエラーをスロー", async () => {
      const xml = "<root><invalid></root>";
      await expect(parseXmlToJson(xml)).rejects.toThrow();
    });

    it("空白文字を適切に処理", async () => {
      const xml = `
        <root>
          <item>
            <name>  テスト  </name>
            <value>  123  </value>
          </item>
        </root>
      `;

      const result = await parseXmlToJson(xml);
      expect(result).toEqual({
        root: {
          item: {
            name: "テスト",
            value: "123",
          },
        },
      });
    });

    it("ネストされた要素を変換", async () => {
      const xml = `
        <root>
          <user>
            <profile>
              <name>テスト</name>
              <details>
                <age>30</age>
              </details>
            </profile>
          </user>
        </root>
      `;

      const result = await parseXmlToJson(xml);
      expect(result).toEqual({
        root: {
          user: {
            profile: {
              name: "テスト",
              details: {
                age: "30",
              },
            },
          },
        },
      });
    });
  });
});
