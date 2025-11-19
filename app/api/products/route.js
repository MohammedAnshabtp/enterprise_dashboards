export async function GET() {
  return Response.json([{ id: 1, sku: "SKU1", name: "Item 1", price: 120 }]);
}
