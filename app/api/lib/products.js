export const getProducts = async () => {
  const res = await fetch("/api/products");
  return res.json();
};
