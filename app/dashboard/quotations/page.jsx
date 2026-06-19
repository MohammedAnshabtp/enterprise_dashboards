export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Quotations</h1>

      <div className="bg-white border rounded-xl p-6">
        <table className="w-full text-left">
          <thead className="text-sm text-gray-500 border-b">
            <tr>
              <th className="py-2">Quotation ID</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((q) => (
              <tr key={q} className="border-b">
                <td className="py-3">QTN00{q}</td>
                <td>Client {q}</td>
                <td>$12{q}</td>
                <td className="text-green-600">Approved</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
