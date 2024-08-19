import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const region = url.searchParams.get("region");

    if (!region) {
      return NextResponse.json({ error: "缺少地區參數" }, { status: 400 });
    }

    const collection = db.collection(`presale_houses_${region}`);

    if (action === "getDistricts") {
      const districts = await collection.distinct("鄉鎮市區");
      return NextResponse.json({ districts: districts.sort() });
    }

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const district = url.searchParams.get("district");
    const skip = (page - 1) * limit;

    let query = {};
    if (district && district !== "all") {
      query = { 鄉鎮市區: district };
    }

    const totalCount = await collection.countDocuments(query);
    const houses = await collection
      .find(query)
      .sort({ 交易年月日: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      houses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
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
