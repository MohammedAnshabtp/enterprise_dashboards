export default function StaffReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Staff Reports</h1>

      <div className="bg-white border rounded-xl p-6">
        <table className="w-full text-left">
          <thead className="border-b text-gray-500 text-sm">
            <tr>
              <th className="py-2">Staff</th>
              <th>Role</th>
              <th>Performance</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((s) => (
              <tr key={s} className="border-b">
                <td className="py-3">Staff {s}</td>
                <td>Sales</td>
                <td>92%</td>
                <td>97%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
