export default function SaleReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sales Report</h1>

      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Sales Summary</h2>

        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 border rounded-xl">
            <p className="text-sm text-gray-500">Today</p>
            <h3 className="text-xl font-semibold">$920</h3>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="text-sm text-gray-500">This Week</p>
            <h3 className="text-xl font-semibold">$6,540</h3>
          </div>

          <div className="p-4 border rounded-xl">
            <p className="text-sm text-gray-500">This Month</p>
            <h3 className="text-xl font-semibold">$18,210</h3>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <table className="w-full text-left">
            <thead className="text-sm text-gray-500 border-b">
              <tr>
                <th className="py-2">Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((o) => (
                <tr key={o} className="border-b">
                  <td className="py-3">#ORD00{o}</td>
                  <td>Customer {o}</td>
                  <td>$99{o}</td>
                  <td>Today</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
