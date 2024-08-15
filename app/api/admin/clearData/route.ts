import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST() {
  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("presale_houses");

    const result = await collection.deleteMany({});

    return NextResponse.json({
      message: "所有數據已成功刪除",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("資料庫操作錯誤:", error);
    return NextResponse.json({ error: "刪除數據失敗" }, { status: 500 });
  } finally {
    await client.close();
  }
}
