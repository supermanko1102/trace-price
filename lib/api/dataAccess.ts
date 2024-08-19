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
}

export async function getDistricts(collection: Collection) {
  const districts = await collection.distinct("鄉鎮市區");
  return districts.sort();
}

export async function getRealEstateTrends(
  collection: Collection,
  page: number,
  limit: number,
  district: string | null
) {
  let query = {};
  if (district && district !== "all") {
    query = { 鄉鎮市區: district };
  }

  const totalCount = await collection.countDocuments(query);
  const houses = await collection
    .find(query)
    .sort({ 交易年月日: -1 })
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
