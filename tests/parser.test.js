import { describe, test, expect } from "@jest/globals";
import { parseXMLFeed } from "../src/parser.js";

describe("parseXMLFeed", () => {
  describe("Basic Parsing", () => {
    test("should parse valid XML feed with Google Shopping format", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0' xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>12345</g:id>
      <title>Test Product</title>
      <description>Test Description</description>
    </item>
  </channel>
</rss>`;

      const products = parseXMLFeed(xmlContent);

      expect(products).toHaveLength(1);
      expect(products[0]).toEqual({
        id: "12345",
        title: "Test Product",
        description: "Test Description",
      });
    });

    test("should parse multiple products", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0' xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>1</g:id>
      <title>Product 1</title>
      <description>Description 1</description>
    </item>
    <item>
      <g:id>2</g:id>
      <title>Product 2</title>
      <description>Description 2</description>
    </item>
    <item>
      <g:id>3</g:id>
      <title>Product 3</title>
      <description>Description 3</description>
    </item>
  </channel>
</rss>`;

      const products = parseXMLFeed(xmlContent);

      expect(products).toHaveLength(3);
      expect(products[0].id).toBe("1");
      expect(products[1].id).toBe("2");
      expect(products[2].id).toBe("3");
    });
  });

  describe("Field Extraction", () => {
    test("should handle missing optional fields", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0' xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>12345</g:id>
      <title>Test Product</title>
    </item>
  </channel>
</rss>`;

      const products = parseXMLFeed(xmlContent);

      expect(products).toHaveLength(1);
      expect(products[0]).toEqual({
        id: "12345",
        title: "Test Product",
        description: "",
      });
    });

    test("should filter out products without ID", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0' xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>12345</g:id>
      <title>Valid Product</title>
      <description>Has ID</description>
    </item>
    <item>
      <title>Invalid Product</title>
      <description>No ID</description>
    </item>
    <item>
      <g:id>67890</g:id>
      <title>Another Valid Product</title>
      <description>Has ID</description>
    </item>
  </channel>
</rss>`;

      const products = parseXMLFeed(xmlContent);

      expect(products).toHaveLength(2);
      expect(products[0].id).toBe("12345");
      expect(products[1].id).toBe("67890");
    });

    test("should trim whitespace from fields", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0' xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>  12345  </g:id>
      <title>  Test Product  </title>
      <description>  Test Description  </description>
    </item>
  </channel>
</rss>`;

      const products = parseXMLFeed(xmlContent);

      expect(products).toHaveLength(1);
      expect(products[0]).toEqual({
        id: "12345",
        title: "Test Product",
        description: "Test Description",
      });
    });
  });

  describe("Edge Cases", () => {
    test("should handle single item (not array)", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0' xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <item>
      <g:id>12345</g:id>
      <title>Single Product</title>
      <description>Only one item</description>
    </item>
  </channel>
</rss>`;

      const products = parseXMLFeed(xmlContent);

      expect(Array.isArray(products)).toBe(true);
      expect(products).toHaveLength(1);
    });
  });

  describe("Error Handling", () => {
    test("should throw error for invalid XML structure", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0'>
  <channel>
  </channel>
</rss>`;

      expect(() => parseXMLFeed(xmlContent)).toThrow(
        "Unable to locate products in XML feed"
      );
    });

    test("should throw error for missing channel", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<rss version='2.0'>
</rss>`;

      expect(() => parseXMLFeed(xmlContent)).toThrow(
        "Unable to locate products in XML feed"
      );
    });

    test("should throw error for missing rss tag", () => {
      const xmlContent = `<?xml version='1.0' encoding='utf-8'?>
<feed>
  <item>
    <id>12345</id>
  </item>
</feed>`;

      expect(() => parseXMLFeed(xmlContent)).toThrow(
        "Unable to locate products in XML feed"
      );
    });

    test("should handle malformed XML gracefully", () => {
      const xmlContent = "not valid xml at all";

      expect(() => parseXMLFeed(xmlContent)).toThrow();
    });
  });
});
