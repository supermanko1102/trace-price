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
interface AveragePriceData {
  district: string;
  averagePricePerPin: number;
  count: number;
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
async function getAveragePriceByDistrict(
  region: Region
): Promise<AveragePriceData[]> {
  const res = await fetch(`/api/averagePriceByDistrict?region=${region}`);
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
  const [selectedRegion, setSelectedRegion] = useState<Region>("taipei");
  const [averagePrices, setAveragePrices] = useState<AveragePriceData[]>([]);

  const itemsPerPage = 20;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getPresaleHouses(
          currentPage,
          itemsPerPage,
          selectedRegion as Region
        );
        setHouses(data.houses);
        setTotalPages(data.totalPages);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentPage, selectedRegion]);
  useEffect(() => {
    async function fetchAveragePrices() {
      try {
        const data = await getAveragePriceByDistrict(selectedRegion);
        setAveragePrices(data);
      } catch (error) {
        console.error("Failed to fetch average prices:", error);
      }
    }
    fetchAveragePrices();
  }, [selectedRegion]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
      <h2 className="text-xl font-bold mt-8 mb-4">各區平均房價</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {averagePrices.map((item) => (
          <div key={item.district} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{item.district}</h3>
            <p>平均每坪價格: {item.averagePricePerPin.toLocaleString()} 元</p>
            <p>資料筆數: {item.count}</p>
          </div>
        ))}
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
          {houses.map((house, index) => (
            <TableRow key={index}>
              <TableCell>{house.交易年月日}</TableCell>
              <TableCell>{house.鄉鎮市區}</TableCell>
              <TableCell>{house.建案名稱}</TableCell>
              <TableCell>{house.主要用途}</TableCell>
              <TableCell>{house.棟及號}</TableCell>
              <TableCell>{house.主建物每坪價格.toFixed(0)}</TableCell>
              <TableCell>{house.主建物面積.toFixed(0)} </TableCell>
              <TableCell>{house.主建物總價.toFixed(0)}</TableCell>
              <TableCell>{house.車位總價元.toFixed(0)}</TableCell>
              <TableCell>{house.車位移轉總面積坪.toFixed(0)}</TableCell>
              <TableCell>{house.總價元.toFixed(0)}</TableCell>
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
            Previous
          </Button>
          <span className="mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Pagination>
      </div>
    </div>
  );
}
