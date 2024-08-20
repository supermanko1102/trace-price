export const formatPrice = (price: number): string => {
  const wan = Math.floor(price / 10000);
  const remainder = price % 10000;
  return `${wan}萬${remainder > 0 ? remainder : ""}元`;
};
export const formatDate = (dateString: string) => {
  // 檢查日期字符串是否為預期的格式
  if (!/^\d{7}$/.test(dateString)) {
    return "無效日期";
  }

  const year = parseInt(dateString.substr(0, 3)) + 1911; // 民國年轉換為西元年
  const month = dateString.substr(3, 2);
  const day = dateString.substr(5, 2);

  // 創建日期對象
  const date = new Date(year, parseInt(month) - 1, parseInt(day));

  // 格式化日期
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
