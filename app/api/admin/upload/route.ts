import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import csv from "csv-parser";

// 平方公尺轉換為坪的函數
function squareMetersToPin(squareMeters: number): number {
  return squareMeters / 3.305785;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "沒有檔案上傳" }, { status: 400 });
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("presale_houses");

    const fileContent = await file.arrayBuffer();
    const buffer = Buffer.from(fileContent);

    const results = await new Promise<any[]>((resolve, reject) => {
      const stream = require("stream");
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      const results: any[] = [];
      bufferStream
        .pipe(csv())
        .on("data", (data: any) => {
          const buildingArea = parseFloat(data["建物移轉總面積平方公尺"]);
          const formattedData = {
            鄉鎮市區: data["鄉鎮市區"],
            建案名稱: data["建案名稱"],
            棟及號: data["棟及號"],
            交易年月日: data["交易年月日"],
            土地位置建物門牌: data["土地位置建物門牌"],
            主要用途: data["主要用途"],
            建物移轉總面積平方公尺: buildingArea,
            建物移轉總面積坪: squareMetersToPin(buildingArea),
            建物現況格局房: parseInt(data["建物現況格局-房"]),
            建物現況格局廳: parseInt(data["建物現況格局-廳"]),
            建物現況格局衛: parseInt(data["建物現況格局-衛"]),
            總價元: parseInt(data["總價元"]),
            單價元平方公尺: parseFloat(data["單價元平方公尺"]),
            單價元坪: parseFloat(data["單價元平方公尺"]) * 3.305785,
            車位類別: data["車位類別"],
            車位移轉總面積平方公尺: parseFloat(data["車位移轉總面積平方公尺"]),
            車位移轉總面積坪: squareMetersToPin(
              parseFloat(data["車位移轉總面積平方公尺"])
            ),
            車位總價元: parseInt(data["車位總價元"]),
          };
          results.push(formattedData);
        })
        .on("end", () => resolve(results))
        .on("error", reject);
    });

    let updatedCount = 0;
    let insertedCount = 0;

    for (const data of results) {
      const filter = {
        鄉鎮市區: data.鄉鎮市區,
        建案名稱: data.建案名稱,
        棟及號: data.棟及號,
        交易年月日: data.交易年月日,
      };

      const updateResult = await collection.updateOne(
        filter,
        { $set: data },
        { upsert: true }
      );

      if (updateResult.upsertedCount > 0) {
        insertedCount++;
      } else if (updateResult.modifiedCount > 0) {
        updatedCount++;
      }
    }

    return NextResponse.json({
      message: "檔案處理成功",
      insertedCount,
      updatedCount,
      totalProcessed: results.length,
    });
  } catch (error) {
    console.error("資料庫操作錯誤:", error);
    return NextResponse.json({ error: "資料庫操作失敗" }, { status: 500 });
  } finally {
    await client.close();
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
