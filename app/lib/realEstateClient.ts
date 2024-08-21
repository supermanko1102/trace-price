import { PaginatedResponse, RegionData, Region, House } from "@/types/types";

export async function getPresaleHouses(
  page: number,
  limit: number,
  region: Region,
  district: string,
  searchTerm: string = ""
): Promise<PaginatedResponse> {
  const districtParam =
    district && district !== "all" ? `&district=${district}` : "";
  const searchParam = searchTerm
    ? `&search=${encodeURIComponent(searchTerm)}`
    : "";
  const res = await fetch(
    `/api/realEstateData?action=getRealEstateTrends&page=${page}&limit=${limit}&region=${region}${districtParam}${searchParam}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("獲取數據失敗");
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

export async function getMonthlyPresaleHouses(
  region: Region,
  district: string
): Promise<House[]> {
  const districtParam =
    district && district !== "all" ? `&district=${district}` : "";
  const res = await fetch(
    `/api/realEstateData?action=getMonthlyPresaleHouses&region=${region}${districtParam}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("獲取月度數據失敗");
  }
  return res.json();
}
