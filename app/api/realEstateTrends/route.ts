import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // 這裡應該是您的實際邏輯來獲取房地產趨勢數據
    const trends = await db.collection("realEstateTrends").find({}).toArray();

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const body = await request.json();

    // 驗證和處理接收到的數據
    // ...

    const result = await db.collection("realEstateTrends").insertOne(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// 您可以根據需要添加 PUT, DELETE 等其他方法
