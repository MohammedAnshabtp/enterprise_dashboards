"use client";
export default function ProductTable({ products }) {
  return (
    <table className="w-full text-sm border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">SKU</th>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id} className="border-t">
            <td className="p-2">{p.sku}</td>
            <td className="p-2">{p.name}</td>
            <td className="p-2 text-right">₹{p.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
