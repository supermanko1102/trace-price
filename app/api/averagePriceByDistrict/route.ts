import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
type Region = (typeof REGIONS)[number];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region") as Region;

  if (!region || !REGIONS.includes(region)) {
    return NextResponse.json({ error: "無效的地區參數" }, { status: 400 });
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(`presale_houses_${region}`);

    const result = await collection
      .aggregate([
        {
          $group: {
            _id: "$鄉鎮市區",
            averagePricePerPin: { $avg: "$主建物每坪價格" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            district: "$_id",
            averagePricePerPin: { $round: ["$averagePricePerPin", 0] },
            count: 1,
          },
        },
        {
          $sort: { district: 1 },
        },
      ])
      .toArray();

    return NextResponse.json(result);
  } catch (error) {
    console.error("資料庫操作錯誤:", error);
    return NextResponse.json({ error: "資料庫操作失敗" }, { status: 500 });
  } finally {
    await client.close();
  }
}
