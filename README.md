# xml-easy-convert

A Node.js utility package for easily converting XML data to CSV or JSON.

## Features

- Flexible XML to JSON conversion
- Simple XML to CSV conversion
- Nested object flattening option
- Customizable conversion settings

## Installation

```bash
npm install xml2json-csv
```

## Usage

### XML to JSON Conversion

```typescript
import { xmlToJson } from "xml2json-csv";

const xmlString = `
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <items>
    <item>
      <name>John Smith</name>
      <age>30</age>
    </item>
    <item>
      <name>John Smith</name>
      <age>30</age>
    </item>
  </items>
`;

async function convertExample() {
  try {
    // Basic conversion
    const jsonData = await xmlToJson(xmlString, {
      rootElement: "items",
    });
    console.log(jsonData);

    // Specify custom root element
    const customRootData = await xmlToJson(xmlString, {
      rootElement: "<custom root element>",
    });
    console.log(customRootData);
  } catch (error) {
    console.error("Conversion error:", error);
  }
}
```

### XML to CSV Conversion

```typescript
import { xmlToCsv } from "xml2json-csv";

const xmlString = `
  <root>
    <item>
      <name>John Smith</name>
      <age>30</age>
    </item>
  </root>
`;

async function convertExample() {
  try {
    // Basic conversion
    const csvData = await xmlToCsv(xmlString);
    console.log(csvData);

    // Custom CSV options
    const customCsv = await xmlToCsv(xmlString, {
      csvOptions: {
        delimiter: ";",
      },
    });
    console.log(customCsv);
  } catch (error) {
    console.error("Conversion error:", error);
  }
}
```

## Options

### `xmlToJson` Options

- `rootElement`: Root element to extract (default: 'root')

### `xmlToCsv` Options

- `rootElement`: Root element to extract (default: 'root')
- `csvOptions`: json2csv options (delimiter, encoding, etc.)

## Error Handling

If an error occurs during conversion (e.g., invalid XML), the Promise will be rejected. Handle errors using appropriate `try-catch` blocks.

## Dependencies

- `xml2js`: XML parsing
- `json2csv`: JSON to CSV conversion

## License

MIT

## Contributing

For bug reports or feature requests, please use the Issue tracker in the GitHub repository.

## Author

[@db-r-hashimoto](https://github.com/db-r-hashimoto)
