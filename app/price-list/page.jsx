export default function PriceListPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Price List</h1>

      <div className="bg-white border rounded-xl p-6">
        <table className="w-full text-left">
          <thead className="border-b text-sm text-gray-500">
            <tr>
              <th className="py-2">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((p) => (
              <tr key={p} className="border-b">
                <td className="py-3">Product {p}</td>
                <td>Category {p}</td>
                <td>$120.{p}0</td>
                <td>Today</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
