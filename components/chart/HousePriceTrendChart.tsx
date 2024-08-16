import React from "react";
import { ResponsiveLine } from "@nivo/line";

interface DataPoint {
  count: number;
  district: string;
  year: number;
  week: number;
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
        const districtId = `${selectedRegion}-${point.district}`;
        if (!districtMap.has(districtId)) {
          districtMap.set(districtId, { id: districtId, data: [] });
        }

        const xValue = `${point.year}-W${point.week
          .toString()
          .padStart(2, "0")}`;

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
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{
          type: "time",
          format: "%Y-W%W",
          precision: "day",
        }}
        xFormat="time:%Y-W%W"
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        yFormat=" >-.2f"
        axisBottom={{
          format: "%Y-W%W",
          tickValues: "every 2 weeks",
          legend: "年份-週數",
          legendOffset: 36,
          legendPosition: "middle",
        }}
        axisLeft={{
          legend: "平均每坪價格",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
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
