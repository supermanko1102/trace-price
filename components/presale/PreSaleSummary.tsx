import React from "react";
import { House } from "@/types/types";
import { formatDate, formatPrice } from "@/utils/formatters";

interface PreSaleSummaryProps {
  houses: House[];
  selectedRegion: string;
}

export function PreSaleSummary({ houses }: PreSaleSummaryProps) {
  if (houses.length === 0) {
    return <div>無可用數據</div>;
  }

  const totalHouses = houses.length;
  const averagePrice =
    houses.reduce((sum, house) => sum + house.mainBuildingPricePerPin, 0) /
    totalHouses;

  const sortedHouses = [...houses].sort(
    (a, b) => a.mainBuildingPricePerPin - b.mainBuildingPricePerPin
  );
  const cheapestHouse = sortedHouses[0];
  const mostExpensiveHouse = sortedHouses[sortedHouses.length - 1];

  const latestMonth = houses[0].transactionDate.slice(0, 7); // 假設數據已按日期排序

  // 計算近期月份範圍
  const currentDate = new Date();
  const twoMonthsAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 2,
    1
  );
  const lastMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const formatMonth = (date: Date) =>
    `${date.getFullYear() - 1911}年${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}月`;
  const recentMonthsRange = `${formatMonth(twoMonthsAgo)}-${formatMonth(
    lastMonth
  )}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">近期平均每坪價格</h3>
        <p className="text-2xl font-bold">
          {formatPrice(Math.round(averagePrice))}
        </p>
        <p className="text-sm text-gray-500">{latestMonth}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">近期最低價建案</h3>
        <p className="text-xl font-bold">{cheapestHouse.projectName}</p>
        <p className="text-lg">
          每坪
          {formatPrice(Math.round(cheapestHouse.mainBuildingPricePerPin))}
        </p>
        <p className="text-sm text-gray-500">
          {formatDate(cheapestHouse.transactionDate)}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">近期最高價建案</h3>
        <p className="text-xl font-bold">{mostExpensiveHouse.projectName}</p>
        <p className="text-lg">
          每坪
          {formatPrice(Math.round(mostExpensiveHouse.mainBuildingPricePerPin))}
        </p>
        <p className="text-sm text-gray-500">
          {formatDate(mostExpensiveHouse.transactionDate)}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">資料說明</h3>
        <p className="text-sm text-gray-600">資料來源：內政部實價登錄網</p>
        <p className="text-sm text-gray-600">近期指：{recentMonthsRange}</p>
        <p className="text-sm text-gray-600">總計：{totalHouses} 筆交易資料</p>
      </div>
    </div>
  );
}
