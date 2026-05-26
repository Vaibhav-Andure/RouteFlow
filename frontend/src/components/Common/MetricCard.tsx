import { type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  className?: string
}

export function MetricCard({ title, value, icon, description, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="flex items-center justify-center size-10 rounded-lg bg-accent text-accent-foreground shadow-sm">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium shrink-0",
              trend.isPositive 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}>
              {trend.isPositive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              <span>{trend.value}%</span>
              {trend.label && (
                <span className="ml-1 text-[10px] text-muted-foreground lowercase">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
