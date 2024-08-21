import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { AppError, handleError } from "@/lib/errorHandler";

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
    return handleError(error);
  } finally {
    await client.close();
  }
}
