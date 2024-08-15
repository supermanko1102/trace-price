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

async function getPresaleHouses() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/realEstateTrends`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default function Home() {
  const [houses, setHouses] = useState<House[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(houses.length / itemsPerPage);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPresaleHouses();
        setHouses(data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const currentHouses = houses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">預售屋資料</h1>
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
          {currentHouses.map((house, index) => (
            <TableRow key={index}>
              <TableCell>{house.交易年月日}</TableCell>
              <TableCell>{house.鄉鎮市區}</TableCell>
              <TableCell>{house.建案名稱}</TableCell>
              <TableCell>{house.主要用途}</TableCell>
              <TableCell>{house.棟及號}</TableCell>
              <TableCell>{house.主建物每坪價格.toFixed(2)}</TableCell>
              <TableCell>{house.主建物面積.toFixed(2)} </TableCell>
              <TableCell>{house.主建物總價.toFixed(2)}</TableCell>
              <TableCell>{house.車位總價元.toFixed(2)}</TableCell>
              <TableCell>{house.車位移轉總面積坪.toFixed(2)}</TableCell>
              <TableCell>{house.總價元.toFixed(2)}</TableCell>
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
