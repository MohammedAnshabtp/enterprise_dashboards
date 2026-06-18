import SimpleSparkline from "./components/SimpleSparkline";
import SimpleBarChart from "./components/SimpleBarChart";
import StatCard from "./components/StatCard";
import AnimateIn from "../components/ui/AnimateIn";

const stats = [
  { label: "Weekly Visits", value: "14.2k", change: "+8%",  iconKey: "Users",       color: "indigo" },
  { label: "Active Users",  value: "3,280",  change: "+2%",  iconKey: "Activity",    color: "emerald" },
  { label: "Revenue (M)",   value: "₹92k",   change: "+11%", iconKey: "IndianRupee", color: "amber" },
];

const visits = [120, 160, 140, 200, 180, 220, 210];
const sales  = [520, 680, 430, 900, 700, 750, 820];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <AnimateIn key={s.label} variant="fadeUp" delay={i * 80}>
            <StatCard {...s} />
          </AnimateIn>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimateIn variant="fadeUp" delay={260}>
          <SimpleSparkline title="Visits (last 7 days)" data={visits} />
        </AnimateIn>
        <AnimateIn variant="fadeUp" delay={320}>
          <SimpleBarChart title="Sales by day" data={sales} />
        </AnimateIn>
      </div>
    </div>
  );
}
