import React, { useMemo } from "react";
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

interface RegionData {
  _id: string;
  startDate: string;
  endDate: string;
  data: DataPoint[];
}

interface HousePriceTrendChartProps {
  data: RegionData[];
  selectedRegion: string;
  selectedDistrict: string;
}

const formatPrice = (price: number) => {
  const tenThousand = Math.floor(price / 10000);
  const remainder = Math.round((price % 10000) / 1000);
  return `${tenThousand}萬${remainder > 0 ? remainder : ""}`;
};

const getColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const processRegionData = (regionDataArray: RegionData[]) => {
  const allData: { [key: string]: any } = {};
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  regionDataArray.forEach((regionData) => {
    regionData.data.forEach((point) => {
      const date = new Date(point.year, point.month - 1, point.day);
      const dateString = format(date, "yyyy-MM-dd");
      if (!allData[dateString]) {
        allData[dateString] = { date: dateString };
      }
      allData[dateString][point.district] = point.averagePricePerPin;

      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    });
  });

  if (!minDate || !maxDate) return [];

  const allDates = eachDayOfInterval({ start: minDate, end: maxDate });
  const districts = Object.keys(Object.values(allData)[0]).filter(
    (key) => key !== "date"
  );

  return allDates.map((date) => {
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
};

const HousePriceTrendChart: React.FC<HousePriceTrendChartProps> = ({
  data,
  selectedRegion,
  selectedDistrict,
}) => {
  const chartData = useMemo(() => {
    if (!selectedDistrict) return [];
    return processRegionData(data)
      .map((item) => ({
        date: item.date,
        price: item[selectedDistrict],
      }))
      .filter((item) => item.price !== undefined);
  }, [data, selectedDistrict]);

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
