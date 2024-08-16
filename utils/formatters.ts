export const formatPrice = (price: number): string => {
  const wan = Math.floor(price / 10000);
  const remainder = price % 10000;
  return `${wan}萬${remainder > 0 ? remainder : ""}元`;
};
