export default function ProductCatalogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Product Catalog</h1>

      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div key={id} className="bg-white p-4 border rounded-xl">
            <div className="h-32 bg-gray-200 rounded-lg mb-3" />
            <h3 className="font-semibold">Product {id}</h3>
            <p className="text-gray-600 text-sm">Category</p>
            <p className="text-indigo-600 font-medium mt-2">$120.00</p>
          </div>
        ))}
      </div>
    </div>
  );
}
