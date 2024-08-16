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

interface DataPoint {
  district: string;
  year: number;
  week: number;
  averagePricePerPin: number;
  count: number;
}

interface RegionData {
  _id: string;
  startDate: string;
  endDate: string;
  data: DataPoint[];
}

interface PriceData {
  [key: string]: RegionData;
}

const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
type Region = (typeof REGIONS)[number];

async function getPresaleHouses(
  page: number,
  limit: number,
  region: Region
): Promise<PaginatedResponse> {
  const res = await fetch(
    `/api/realEstateTrends?page=${page}&limit=${limit}&region=${region}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

async function getAveragePriceByDistrict(region: Region): Promise<RegionData> {
  const res = await fetch(
    `/api/averagePriceByDistrict?region=${region}&startDate=1130101&endDate=1131231`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch average price data");
  }
  const data = await res.json();
  return data;
}

export default function Home() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>("taoyuan");
  const [priceData, setPriceData] = useState<PriceData | null>(null);

  const itemsPerPage = 15;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        console.log("Fetching data...");
        const [housesData, regionPriceData] = await Promise.all([
          getPresaleHouses(currentPage, itemsPerPage, selectedRegion as Region),
          getAveragePriceByDistrict(selectedRegion as Region),
        ]);
        setHouses(housesData.houses);
        setTotalPages(housesData.totalPages);
        setPriceData((prevData) => ({
          ...prevData,
          [selectedRegion]: regionPriceData,
        }));
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentPage, selectedRegion]);

  useEffect(() => {
    console.log("Price data updated:", priceData);
  }, [priceData]);

  console.log("Rendering with price data:", priceData);

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error}</div>;

  console.log(
    "Price data before rendering chart:",
    JSON.stringify(priceData, null, 2)
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">預售屋資料</h1>

      <div className="mb-4">
        <Select
          value={selectedRegion}
          onValueChange={(value) => {
            setSelectedRegion(value as Region);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="選擇地區" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="taipei">台北</SelectItem>
            <SelectItem value="newTaipei">新北</SelectItem>
            <SelectItem value="taoyuan">桃園</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        {priceData && priceData[selectedRegion] ? (
          <HousePriceTrendChart
            data={priceData[selectedRegion] as any}
            selectedRegion={selectedRegion}
          />
        ) : (
          <p>載入中...</p>
        )}
      </div>
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
          {houses.slice(1).map((house, index) => (
            <TableRow key={index + 1}>
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
