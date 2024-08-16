import React from "react";
import { ResponsiveLine } from "@nivo/line";

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

interface ChartData {
  id: string;
  data: { x: string; y: number }[];
}

interface HousePriceTrendChartProps {
  data: RegionData[];
  selectedRegion: string;
}

// 新增一個格式化價格的函數
const formatPrice = (price: number) => {
  const tenThousand = Math.floor(price / 10000);
  const remainder = Math.round((price % 10000) / 1000);
  return `${tenThousand}萬${remainder > 0 ? remainder : ""}`;
};

const HousePriceTrendChart: React.FC<HousePriceTrendChartProps> = ({
  data,
  selectedRegion,
}) => {
  console.log(
    "HousePriceTrendChart received data:",
    JSON.stringify(data, null, 2)
  );

  if (
    !data ||
    data.length === 0 ||
    !data[0].data ||
    data[0].data.length === 0
  ) {
    return <div>無可用數據</div>;
  }

  const processRegionData = (regionDataArray: RegionData[]): ChartData[] => {
    const districtMap = new Map<string, ChartData>();

    regionDataArray.forEach((regionData) => {
      regionData.data.forEach((point) => {
        const districtId = point.district; // 移除前綴，只使用區域名稱
        if (!districtMap.has(districtId)) {
          districtMap.set(districtId, { id: districtId, data: [] });
        }

        const xValue = `${point.year}-${point.month
          .toString()
          .padStart(2, "0")}-${point.day.toString().padStart(2, "0")}`;

        districtMap.get(districtId)!.data.push({
          x: xValue,
          y: point.averagePricePerPin,
        });
      });
    });

    return Array.from(districtMap.values());
  };

  const chartData = processRegionData(data);
  console.log("Processed chart data:", JSON.stringify(chartData, null, 2));

  if (chartData.length === 0) {
    return <div>無可用數據</div>;
  }

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 50, right: 110, bottom: 70, left: 60 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          precision: "day",
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat={(value) => formatPrice(value as number)}
        axisBottom={{
          format: "%m/%d",
          tickValues: "every 14 days",
          legend: "日期",
          legendOffset: 60,
          legendPosition: "middle",
          tickRotation: -45,
        }}
        axisLeft={{
          format: (value) => formatPrice(value),
          legend: "平均每坪價格",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={3}
        pointColor={{ theme: "background" }}
        pointBorderWidth={1}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        enableSlices="x"
        sliceTooltip={({ slice }) => (
          <div
            style={{
              background: "white",
              padding: "9px 12px",
              border: "1px solid #ccc",
            }}
          >
            <div>{slice.points[0].data.xFormatted}</div>
            {slice.points.map((point) => (
              <div key={point.id}>
                <strong>{point.serieId}</strong>:{" "}
                {formatPrice(point.data.y as number)}
              </div>
            ))}
          </div>
        )}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default HousePriceTrendChart;
