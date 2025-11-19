export default function UserVisitPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Visit</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-xl">
          <p className="text-gray-600 text-sm">Daily Visits</p>
          <h3 className="text-xl font-semibold mt-2">1,284</h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-gray-600 text-sm">Weekly Visits</p>
          <h3 className="text-xl font-semibold mt-2">9,420</h3>
        </div>

        <div className="p-6 bg-white border rounded-xl">
          <p className="text-gray-600 text-sm">Active Users</p>
          <h3 className="text-xl font-semibold mt-2">321</h3>
        </div>
      </div>

      {/* Visit Table */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Recent Visitors</h2>
        <table className="w-full text-left">
          <thead className="text-sm text-gray-500 border-b">
            <tr>
              <th className="py-2">User</th>
              <th>Country</th>
              <th>Visit Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-3">John Doe</td>
              <td>USA</td>
              <td>2 mins ago</td>
            </tr>
            <tr className="border-b">
              <td className="py-3">Anita Raj</td>
              <td>India</td>
              <td>5 mins ago</td>
            </tr>
            <tr>
              <td className="py-3">Michael Lee</td>
              <td>Singapore</td>
              <td>12 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
