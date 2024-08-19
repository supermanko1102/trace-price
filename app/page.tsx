"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HousePriceTrendChart from "@/components/chart/HousePriceTrendChart";
import { formatPrice } from "@/utils/formatters";

interface House {
  建案名稱: string;
  棟及號: string;
  鄉鎮市區: string;
  主要用途: string;
  總價元: number;
  建物移轉總面積坪: number;
  主建物每坪價格: number;
  主建物面積: number;
  主建物總價: number;
  車位總價元: number;
  車位移轉總面積坪: number;
  交易年月日: string;
}

interface PaginatedResponse {
  houses: House[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface RegionData {
  count: number;
  district: string;
  date: string;
  year: number;
  month: number;
  day: number;
  averagePricePerPin: number;
}

const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
type Region = (typeof REGIONS)[number];

async function getPresaleHouses(
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

async function getDistricts(region: Region): Promise<string[]> {
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

async function getAveragePriceByDistrict(
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

export default function Home() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>("taoyuan");
  const [priceData, setPriceData] = useState<RegionData[] | null>(null);
  console.log("priceData", priceData);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const itemsPerPage = 15;

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const districtsData = await getDistricts(selectedRegion);
        setDistricts(districtsData);
        setSelectedDistrict("");
      } catch (err) {
        console.error("Error fetching districts:", err);
        setError("Failed to load districts");
      }
    }
    fetchDistricts();
  }, [selectedRegion]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [housesData, regionPriceData] = await Promise.all([
          getPresaleHouses(
            currentPage,
            itemsPerPage,
            selectedRegion,
            selectedDistrict
          ),
          getAveragePriceByDistrict(selectedRegion),
        ]);
        setHouses(housesData.houses);
        setTotalPages(housesData.totalPages);
        setPriceData(regionPriceData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentPage, selectedRegion, selectedDistrict]);

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">預售屋資料</h1>

      <div className="mb-4 flex space-x-4">
        <Select
          value={selectedRegion}
          onValueChange={(value) => {
            setSelectedRegion(value as Region);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="選擇地區" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="taipei">台北</SelectItem>
            <SelectItem value="newTaipei">新北</SelectItem>
            <SelectItem value="taoyuan">桃園</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedDistrict}
          onValueChange={(value) => {
            setSelectedDistrict(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="選擇鄉鎮市區" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {priceData && (
        <HousePriceTrendChart
          data={priceData}
          selectedRegion={selectedRegion}
          selectedDistrict={selectedDistrict}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>交易年月日</TableHead>
            <TableHead>鄉鎮市區</TableHead>
            <TableHead>建案名稱</TableHead>
            <TableHead>主要用途</TableHead>
            <TableHead>棟及號</TableHead>
            <TableHead>主建物每坪價格</TableHead>
            <TableHead>主建物面積</TableHead>
            <TableHead>主建物總價</TableHead>
            <TableHead>車位總價</TableHead>
            <TableHead>車位面積</TableHead>
            <TableHead>總價元</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {houses.map((house, index) => (
            <TableRow key={index}>
              <TableCell>{house.交易年月日}</TableCell>
              <TableCell>{house.鄉鎮市區}</TableCell>
              <TableCell>{house.建案名稱}</TableCell>
              <TableCell>{house.主要用途}</TableCell>
              <TableCell>{house.棟及號}</TableCell>
              <TableCell>
                {formatPrice(Math.round(house.主建物每坪價格))}
              </TableCell>
              <TableCell>{house.主建物面積.toFixed(2)}</TableCell>
              <TableCell>{formatPrice(Math.round(house.主建物總價))}</TableCell>
              <TableCell>{formatPrice(Math.round(house.車位總價元))}</TableCell>
              <TableCell>{house.車位移轉總面積坪.toFixed(2)}</TableCell>
              <TableCell>{formatPrice(Math.round(house.總價元))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <Pagination>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            上一頁
          </Button>
          <span className="mx-2">
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            下一頁
          </Button>
        </Pagination>
      </div>
    </div>
  );
}
