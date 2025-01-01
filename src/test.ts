import { xmlToCsv } from "./xmlToCsv.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NINTENDO_XML_URL =
  "https://www.nintendo.co.jp/data/software/xml/switch.xml";

/**
 * 任天堂のXMLデータを取得する
 */
const fetchNintendoXml = async (): Promise<string> => {
  const response = await fetch(NINTENDO_XML_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch XML: ${response.status} ${response.statusText}`
    );
  }
  return response.text();
};

/**
 * XMLデータをCSVに変換して保存する
 */
export const saveGamesToCSV = async () => {
  try {
    // XMLデータの取得
    const xmlData = await fetchNintendoXml();

    // XMLをCSVに変換
    const csvData = await xmlToCsv(xmlData, {
      rootElement: "TitleInfoList",
    });

    // 出力ディレクトリの作成
    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // CSVファイルの出力
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = path.join(outputDir, `nintendo_games_${timestamp}.csv`);
    fs.writeFileSync(outputPath, csvData, "utf8");

    console.log(`CSV file has been saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error("Error saving games to CSV:", error);
    throw error;
  }
};

// スクリプトとして実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}`) {
  saveGamesToCSV().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
