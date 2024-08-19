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
import { House, RegionData } from "../types/types";
import {
  getPresaleHouses,
  getDistricts,
  getAveragePriceByDistrict,
} from "./lib/realEstateClient";

const REGIONS = ["taipei", "newTaipei", "taoyuan"] as const;
type Region = (typeof REGIONS)[number];

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
              <TableCell>{house.transactionDate}</TableCell>
              <TableCell>{house.district}</TableCell>
              <TableCell>{house.projectName}</TableCell>
              <TableCell>{house.mainUse}</TableCell>
              <TableCell>{house.buildingNumber}</TableCell>
              <TableCell>
                {formatPrice(Math.round(house.mainBuildingPricePerPin))}
              </TableCell>
              <TableCell>{house.mainBuildingAreaPin.toFixed(2)}</TableCell>
              <TableCell>
                {formatPrice(Math.round(house.mainBuildingTotalPriceNTD))}
              </TableCell>
              <TableCell>
                {formatPrice(Math.round(house.parkingPriceNTD))}
              </TableCell>
              <TableCell>{house.parkingAreaPin.toFixed(2)}</TableCell>
              <TableCell>
                {formatPrice(Math.round(house.totalPriceNTD))}
              </TableCell>
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
