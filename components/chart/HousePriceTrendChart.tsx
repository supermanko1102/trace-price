import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

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

  regionDataArray.forEach((regionData) => {
    regionData.data.forEach((point) => {
      const date = `${point.year}-${point.month
        .toString()
        .padStart(2, "0")}-${point.day.toString().padStart(2, "0")}`;
      if (!allData[date]) {
        allData[date] = { date };
      }
      allData[date][point.district] = point.averagePricePerPin;
    });
  });

  return Object.values(allData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

const HousePriceTrendChart: React.FC<HousePriceTrendChartProps> = ({
  data,
  selectedRegion,
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const chartData = useMemo(() => processRegionData(data), [data]);

  const districts = useMemo(() => {
    const allDistricts = new Set<string>();
    data.forEach((regionData) => {
      regionData.data.forEach((point) => {
        allDistricts.add(point.district);
      });
    });
    return Array.from(allDistricts);
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {selectedRegion}房價趨勢
      </h2>
      <div className="h-[50vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), "MM/dd")}
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
              formatter={(value: number, name: string) => [
                formatPrice(value),
                name,
              ]}
              labelFormatter={(label) =>
                format(new Date(label), "yyyy年MM月dd日")
              }
            />
            <Legend />
            {districts.map((district) => (
              <Line
                key={district}
                type="monotone"
                dataKey={district}
                stroke={getColorFromString(district)}
                strokeWidth={
                  hoveredDistrict === null || hoveredDistrict === district
                    ? 5
                    : 2
                }
                dot={false}
                opacity={
                  hoveredDistrict === null || hoveredDistrict === district
                    ? 1
                    : 0.3
                }
                onMouseEnter={() => setHoveredDistrict(district)}
                onMouseLeave={() => setHoveredDistrict(null)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HousePriceTrendChart;
