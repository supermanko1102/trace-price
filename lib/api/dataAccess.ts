import { Collection } from "mongodb";

export async function getCachedData(
  dailyStatsCollection: Collection,
  startDate: string,
  endDate: string
) {
  const currentDate = new Date();
  const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  const lastUpdate = await dailyStatsCollection.findOne(
    {},
    { sort: { updatedAt: -1 }, projection: { updatedAt: 1 } }
  );

  if (lastUpdate && lastUpdate.updatedAt > oneDayAgo) {
    const cachedResult = await dailyStatsCollection
      .find({
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      })
      .toArray();

    if (cachedResult.length > 0) {
      return cachedResult[0].data;
    }
  }

  return null;
}

export async function updateCache(
  dailyStatsCollection: Collection,
  startDate: string,
  endDate: string,
  data: any
) {
  await dailyStatsCollection.deleteMany({
    startDate: { $gte: startDate },
    endDate: { $lte: endDate },
  });

  await dailyStatsCollection.insertOne({
    startDate,
    endDate,
    data,
    updatedAt: new Date(),
  });
}

export async function calculateAveragePriceByDistrict(
  collection: Collection,
  dailyStatsCollection: unknown,
  startDate: string,
  endDate: string
) {
  return await collection
    .aggregate([
      {
        $match: {
          transactionDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $addFields: {
          year: {
            $add: [{ $toInt: { $substr: ["$transactionDate", 0, 3] } }, 1911],
          },
          month: { $toInt: { $substr: ["$transactionDate", 3, 2] } },
          day: { $toInt: { $substr: ["$transactionDate", 5, 2] } },
        },
      },
      {
        $addFields: {
          date: {
            $dateFromParts: {
              year: "$year",
              month: "$month",
              day: "$day",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            district: "$district",
            date: "$date",
          },
          averagePricePerPin: { $avg: "$mainBuildingPricePerPin" },
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
}

export async function getDistricts(collection: Collection) {
  const districts = await collection.distinct("district");
  return districts.sort();
}

export async function getRealEstateTrends(
  collection: Collection,
  page: number,
  limit: number,
  district: string | null,
  searchTerm: string | null
) {
  let query: any = {};

  if (district && district !== "all") {
    query.district = district;
  }

  if (searchTerm) {
    query.$or = [
      { projectName: { $regex: searchTerm, $options: "i" } },
      { address: { $regex: searchTerm, $options: "i" } },
      { buildingNumber: { $regex: searchTerm, $options: "i" } },
    ];
  }

  const totalCount = await collection.countDocuments(query);
  const houses = await collection
    .find(query)
    .sort({ transactionDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return {
    houses,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  };
}

export async function getMonthlyPresaleHouses(
  collection: Collection,
  district: string | null
) {
  try {
    let query: any = {};
    const currentDate = new Date();

    // 計算兩個月前的日期
    const twoMonthsAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 2,
      1
    );
    const queryYear = twoMonthsAgo.getFullYear() - 1911; // 轉換為民國年
    const queryMonth = String(twoMonthsAgo.getMonth() + 1).padStart(2, "0");

    const startDate = `${queryYear}${queryMonth}01`;
    const endDate = `${queryYear}${queryMonth}31`;

    query.transactionDate = {
      $gte: startDate,
      $lte: endDate,
    };

    if (district && district !== "all") {
      query.district = district;
    }

    // 執行帶條件的查詢
    const result = await collection
      .find(query)
      .sort({ transactionDate: -1 })
      .toArray();
    return result;
  } catch (error) {
    console.error("getMonthlyPresaleHouses 詳細錯誤:", error);
    throw error;
  }
}
