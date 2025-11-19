export default function ProductCRUDPage() {
  return (
    <div className="space-y-6 w-full max-w-3xl">
      <h1 className="text-2xl font-semibold">Product Management</h1>

      <form className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Product Name</label>
          <input className="w-full border rounded-lg p-2 mt-1" />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Price</label>
          <input className="w-full border rounded-lg p-2 mt-1" />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Image</label>
          <input type="file" className="w-full border rounded-lg p-2 mt-1" />
        </div>

        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Add Product
        </button>
      </form>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Existing Products</h2>
        <table className="w-full text-left">
          <thead className="text-sm text-gray-500 border-b">
            <tr>
              <th className="py-2">Product</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((p) => (
              <tr key={p} className="border-b">
                <td className="py-3">Product {p}</td>
                <td>$99.{p}</td>
                <td>
                  <button className="text-blue-600 mr-3">Edit</button>
                  <button className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
