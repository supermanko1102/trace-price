import { PaginatedResponse, RegionData, Region } from "../../types/types";

export async function getPresaleHouses(
  page: number,
  limit: number,
  region: Region,
  district: string
): Promise<PaginatedResponse> {
  const districtParam =
    district && district !== "all" ? `&district=${district}` : "";
  const res = await fetch(
    `/api/realEstateData?action=getRealEstateTrends&page=${page}&limit=${limit}&region=${region}${districtParam}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export async function getDistricts(region: Region): Promise<string[]> {
  const res = await fetch(
    `/api/realEstateData?action=getDistricts&region=${region}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("獲取鄉鎮市區列表失敗");
  }
  const data = await res.json();
  return data.districts;
}

export async function getAveragePriceByDistrict(
  region: Region
): Promise<RegionData[]> {
  const res = await fetch(
    `/api/realEstateData?action=getAveragePriceByDistrict&region=${region}&startDate=1130101&endDate=1131231`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch average price data");
  }
  return res.json();
}
