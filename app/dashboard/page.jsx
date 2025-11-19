// app/dashboard/page.jsx
import SimpleSparkline from "./components/SimpleSparkline";
import SimpleBarChart from "./components/SimpleBarChart";
import StatCard from "./components/StatCard";

export default function DashboardPage() {
  const visits = [120, 160, 140, 200, 180, 220, 210]; // example data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Weekly visits" value="14.2k" change="+8%" />
        <StatCard label="Active users" value="3,280" change="+2%" />
        <StatCard label="Revenue (M)" value="$92k" change="+11%" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SimpleSparkline title="Visits (last 7 days)" data={visits} />
        <SimpleBarChart
          title="Sales by day"
          data={[520, 680, 430, 900, 700, 750, 820]}
        />
      </div>
    </div>
  );
}
