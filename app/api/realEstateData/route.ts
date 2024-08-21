import { NextRequest, NextResponse } from "next/server";
import {
  connectToDatabase,
  getCollection,
  Region,
  REGIONS,
} from "@/lib/api/database";
import {
  calculateAveragePriceByDistrict,
  getDistricts,
  getRealEstateTrends,
  getMonthlyPresaleHouses,
} from "@/lib/api/dataAccess";
import { AppError, handleError } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const region = url.searchParams.get("region") as Region;

  if (!region || !REGIONS.includes(region)) {
    throw new AppError("無效的地區參數", 400);
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(process.env.MONGODB_DB);
    const collection = getCollection(db, region);

    switch (action) {
      case "getDistricts":
        const districts = await getDistricts(collection);
        return NextResponse.json({ districts });

      case "getAveragePriceByDistrict":
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        if (!startDate || !endDate) {
          throw new AppError("無效的日期參數", 400);
        }
        const dailyStatsCollection = db.collection(`daily_stats_${region}`);
        const averagePriceResult = await calculateAveragePriceByDistrict(
          collection,
          dailyStatsCollection,
          startDate,
          endDate
        );
        return NextResponse.json(averagePriceResult);

      case "getRealEstateTrends":
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const trendDistrict = url.searchParams.get("district") || null;
        const searchTerm = url.searchParams.get("search") || null;
        const trendsResult = await getRealEstateTrends(
          collection,
          page,
          limit,
          trendDistrict,
          searchTerm
        );
        return NextResponse.json(trendsResult);

      case "getMonthlyPresaleHouses":
        const monthlyDistrict = url.searchParams.get("district") || null;
        try {
          const monthlyHouses = await getMonthlyPresaleHouses(
            collection,
            monthlyDistrict
          );
          return NextResponse.json(monthlyHouses);
        } catch (error) {
          console.error("getMonthlyPresaleHouses 錯誤:", error);
          throw new AppError("處理月度預售屋數據時發生錯誤", 500);
        }

      default:
        throw new AppError("無效的操作", 400);
    }
  } catch (error) {
    return handleError(error);
  }
}
