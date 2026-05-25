import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface AnalyticsChartProps {
  pending: number
  inTransit: number
  delivered: number
  cancelled: number
  totalDeliveries: number
}

const COLORS = ["#FFBB28", "#0088FE", "#00C49F", "#FF8042"] // Yellow, Blue, Green, Orange

export function AnalyticsChart({
  pending,
  inTransit,
  delivered,
  cancelled,
  totalDeliveries,
}: AnalyticsChartProps) {
  const data = [
    { name: "Pending", value: pending },
    { name: "In Transit", value: inTransit },
    { name: "Delivered", value: delivered },
    { name: "Cancelled", value: cancelled },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          {totalDeliveries > 0 && (
            <Label
              value={totalDeliveries}
              position="center"
              className="font-bold text-2xl"
            />
          )}
        </Pie>
        <Tooltip />
        <Legend
  formatter={(value: number | string, entry: any) =>  {
            const percentage =
              totalDeliveries > 0 && entry.payload
                ? ((entry.payload.value / totalDeliveries) * 100).toFixed(2)
                : 0
            return `${value} ${entry.payload?.value} (${percentage}%)`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
