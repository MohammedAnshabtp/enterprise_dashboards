export const getSales = async () => {
  const res = await fetch("/api/sales");
  return res.json();
};
