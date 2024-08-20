export interface House {
  address: string;
  projectName: string;
  buildingNumber: string;
  district: string;
  mainUse: string;
  totalPriceNTD: number;
  totalBuildingAreaPin: number;
  mainBuildingPricePerPin: number;
  mainBuildingAreaPin: number;
  mainBuildingTotalPriceNTD: number;
  parkingPriceNTD: number;
  parkingAreaPin: number;
  transactionDate: string;
}

export interface PaginatedResponse {
  houses: House[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface RegionData {
  count: number;
  district: string;
  date: string;
  year: number;
  month: number;
  day: number;
  averagePricePerPin: number;
}

export const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
export type Region = (typeof REGIONS)[number];
