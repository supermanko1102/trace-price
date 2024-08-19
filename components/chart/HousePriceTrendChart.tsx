import React, { useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";

interface DataPoint {
  count: number;
  district: string;
  date: string;
  year: number;
  month: number;
  day: number;
  averagePricePerPin: number;
}

interface HousePriceTrendChartProps {
  data: DataPoint[];
  selectedRegion: string;
  selectedDistrict: string;
}

const formatPrice = (price: number) => {
  const tenThousand = Math.floor(price / 10000);
  const remainder = Math.round((price % 10000) / 1000);
  return `${tenThousand}萬${remainder > 0 ? remainder : ""}`;
};

const processRegionData = (dataArray: DataPoint[]) => {
  if (dataArray.length === 0) {
    console.warn("輸入數據為空");
    return [];
  }

  const allData: { [key: string]: any } = {};
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  dataArray.forEach((point) => {
    if (
      !point.date ||
      !point.district ||
      point.averagePricePerPin === undefined
    ) {
      console.warn("跳過無效的數據點:", point);
      return;
    }

    const date = new Date(point.date);
    const dateString = format(date, "yyyy-MM-dd");
    if (!allData[dateString]) {
      allData[dateString] = { date: dateString };
    }
    allData[dateString][point.district] = point.averagePricePerPin;

    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;
  });

  if (!minDate || !maxDate) {
    console.warn("無法確定日期範圍");
    return [];
  }

  const allDates = eachDayOfInterval({ start: minDate, end: maxDate });
  const districts = Array.from(
    new Set(dataArray.map((point) => point.district))
  );
  const result = allDates.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dataPoint = allData[dateString] || { date: dateString };

    districts.forEach((district) => {
      if (dataPoint[district] === undefined) {
        let prevDate = new Date(date);
        while (minDate && prevDate >= minDate) {
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateString = format(prevDate, "yyyy-MM-dd");
          if (
            allData[prevDateString] &&
            allData[prevDateString][district] !== undefined
          ) {
            dataPoint[district] = allData[prevDateString][district];
            break;
          }
        }
      }
    });

    return dataPoint;
  });

  return result;
};

const HousePriceTrendChart: React.FC<HousePriceTrendChartProps> = ({
  data,
  selectedRegion,
  selectedDistrict,
}) => {
  const chartData = useMemo(() => {
    const processedData = processRegionData(data);

    if (!selectedDistrict || selectedDistrict === "") {
      return processedData;
    }

    console.log("處理選定區域的數據:", selectedDistrict);
    const filteredData = processedData
      .map((item) => ({
        date: item.date,
        price: Number(item[selectedDistrict]),
      }))
      .filter((item) => !isNaN(item.price) && item.price !== undefined);

    return filteredData;
  }, [data, selectedDistrict]);

  if (chartData.length === 0) {
    return <div>暫無數據可顯示。請確保已選擇一個區域。</div>;
  }

  const formatXAxis = (tickItem: string) => {
    return format(parseISO(tickItem), "MM/dd", { locale: zhTW });
  };

  const formatTooltipLabel = (label: string) => {
    return format(parseISO(label), "yyyy年MM月dd日", { locale: zhTW });
  };

  if (!selectedDistrict) {
    return <div>請選擇一個鄉鎮區</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {selectedDistrict}預售屋房價趨勢
      </h2>
      <div className="h-[60vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              tickFormatter={(value) => formatPrice(value)}
              label={{
                value: "平均每坪價格",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              labelFormatter={formatTooltipLabel}
              formatter={(value: number) => [formatPrice(value), "價格"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HousePriceTrendChart;
