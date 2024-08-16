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
import { format, parseISO, eachDayOfInterval } from "date-fns";
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
      const date = `${point.year}-${point.month
        .toString()
        .padStart(2, "0")}-${point.day.toString().padStart(2, "0")}`;
      if (!allData[date]) {
        allData[date] = { date };
      }
      allData[date][point.district] = point.averagePricePerPin;

      const currentDate = parseISO(date);
      if (!minDate || currentDate < minDate) minDate = currentDate;
      if (!maxDate || currentDate > maxDate) maxDate = currentDate;
    });
  });

  if (!minDate || !maxDate) return [];

  const allDates = eachDayOfInterval({ start: minDate, end: maxDate });
  const districts = Object.keys(Object.values(allData)[0]).filter(
    (key) => key !== "date"
  );

  const processedData = allDates.map((date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const dataPoint = allData[dateString] || { date: dateString };

    districts.forEach((district) => {
      if (dataPoint[district] === undefined) {
        // 找到最近的前一個有效數據點
        let prevDate = new Date(date);
        while (
          minDate &&
          maxDate &&
          prevDate >= minDate &&
          prevDate <= maxDate
        ) {
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

  return processedData;
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

  const formatXAxis = (tickItem: string) => {
    const date = parseISO(tickItem);
    return format(date, "MM/dd", { locale: zhTW });
  };

  const formatTooltipLabel = (label: string) => {
    const date = parseISO(label);
    return format(date, "yyyy年MM月dd日", { locale: zhTW });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {selectedRegion}房價趨勢
      </h2>
      <div className="h-[60vh] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              interval="preserveStartEnd"
              minTickGap={50}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value) => formatPrice(value)}
              label={{
                value: "平均每坪價格",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatPrice(value),
                name,
              ]}
              labelFormatter={formatTooltipLabel}
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
                dot={
                  ((props: any) => {
                    const { cx, cy, payload } = props;
                    const hasRealData = data.some((regionData) =>
                      regionData.data.some(
                        (point) =>
                          point.date === payload.date &&
                          point.district === district
                      )
                    );
                    return hasRealData ? (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={getColorFromString(district)}
                      />
                    ) : null;
                  }) as React.ComponentProps<typeof Line>["dot"]
                }
                connectNulls={true}
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
