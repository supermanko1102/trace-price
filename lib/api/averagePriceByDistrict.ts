import { Collection } from "mongodb";
import {
  getCachedData as getCachedAveragePriceData,
  calculateAveragePriceByDistrict,
  updateCache as updateAveragePriceCache,
} from "./dataAccess";

export async function getAveragePriceByDistrict(
  collection: Collection,
  dailyStatsCollection: Collection,
  startDate: string,
  endDate: string
) {
  const cachedData = await getCachedAveragePriceData(
    dailyStatsCollection,
    startDate,
    endDate
  );
  if (cachedData) {
    return cachedData;
  }

  const result = await calculateAveragePriceByDistrict(
    collection,
    dailyStatsCollection,
    startDate,
    endDate
  );
  await updateAveragePriceCache(
    dailyStatsCollection,
    startDate,
    endDate,
    result
  );

  return result;
}
