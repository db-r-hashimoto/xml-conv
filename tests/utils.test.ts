import { flattenJson, isValidXml } from "../src/utils.js";

describe("utils関数のテスト", () => {
  describe("flattenJson", () => {
    it("ネストされたオブジェクトをフラット化", () => {
      const input = {
        name: "test",
        details: {
          age: 30,
          address: {
            city: "Tokyo",
            code: "123",
          },
        },
      };

      expect(flattenJson(input)).toEqual({
        name: "test",
        "details.age": 30,
        "details.address.city": "Tokyo",
        "details.address.code": "123",
      });
    });

    it("配列を含むオブジェクトを処理", () => {
      const input = {
        items: ["a", "b"],
        data: {
          values: [1, 2, 3],
        },
      };

      expect(flattenJson(input)).toEqual({
        items: ["a", "b"],
        "data.values": [1, 2, 3],
      });
    });

    it("nullやundefinedを含むオブジェクトを処理", () => {
      const input = {
        a: null,
        b: undefined,
        c: {
          d: null,
        },
      };

      expect(flattenJson(input)).toEqual({
        a: null,
        b: undefined,
        "c.d": null,
      });
    });
  });

  describe("isValidXml", () => {
    it("有効なXMLを検証", async () => {
      const validXml = "<root><item>test</item></root>";
      expect(await isValidXml(validXml)).toBe(true);
    });

    it("無効なXMLを検証", async () => {
      const invalidXml = "<root><item>test</root>";
      expect(await isValidXml(invalidXml)).toBe(false);
    });

    it("空の文字列を検証", async () => {
      expect(await isValidXml("")).toBe(false);
    });

    it("XMLでない文字列を検証", async () => {
      expect(await isValidXml("not xml")).toBe(false);
    });
  });
});
