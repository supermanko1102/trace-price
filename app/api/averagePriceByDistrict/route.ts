import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
type Region = (typeof REGIONS)[number];

let client: MongoClient;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
  }
  return client;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const region = url.searchParams.get("region") as Region;
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  if (!region || !REGIONS.includes(region) || !startDate || !endDate) {
    return NextResponse.json({ error: "無效的參數" }, { status: 400 });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection(`presale_houses_${region}`);
    const dailyStatsCollection = db.collection(`daily_stats_${region}`);

    // 獲取最後更新時間
    const lastUpdate = await dailyStatsCollection.findOne(
      {},
      { sort: { updatedAt: -1 }, projection: { updatedAt: 1 } }
    );

    const currentDate = new Date();
    const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    // 如果最後更新時間在一天之內，直接返回緩存的數據
    if (lastUpdate && lastUpdate.updatedAt > oneDayAgo) {
      const cachedResult = await dailyStatsCollection
        .find({
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        })
        .toArray();

      if (cachedResult.length > 0) {
        return NextResponse.json(cachedResult);
      }
    }

    // 如果沒有最近的緩存數據，重新計算
    const result = await collection
      .aggregate([
        {
          $match: {
            交易年月日: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $addFields: {
            西元年: {
              $add: [{ $toInt: { $substr: ["$交易年月日", 0, 3] } }, 1911],
            },
            月: { $toInt: { $substr: ["$交易年月日", 3, 2] } },
            日: { $toInt: { $substr: ["$交易年月日", 5, 2] } },
          },
        },
        {
          $addFields: {
            日期: {
              $dateFromParts: {
                year: "$西元年",
                month: "$月",
                day: "$日",
              },
            },
          },
        },
        {
          $group: {
            _id: {
              district: "$鄉鎮市區",
              date: "$日期",
            },
            averagePricePerPin: { $avg: "$主建物每坪價格" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            district: "$_id.district",
            date: "$_id.date",
            year: { $year: "$_id.date" },
            month: { $month: "$_id.date" },
            day: { $dayOfMonth: "$_id.date" },
            averagePricePerPin: { $round: ["$averagePricePerPin", 0] },
            count: 1,
          },
        },
        {
          $sort: { district: 1, date: 1 },
        },
      ])
      .toArray();

    // 更新緩存
    await dailyStatsCollection.deleteMany({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    await dailyStatsCollection.insertOne({
      startDate,
      endDate,
      data: result,
      updatedAt: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("資料庫操作錯誤:", error);
    return NextResponse.json({ error: "資料庫操作失敗" }, { status: 500 });
  }
}
