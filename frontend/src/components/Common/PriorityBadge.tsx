import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH"

interface PriorityBadgeProps {
  priority: PriorityLevel | string
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const normalizedPriority = (priority || "LOW").toUpperCase() as PriorityLevel

  let badgeStyle = ""

  switch (normalizedPriority) {
    case "LOW":
      badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
      break
    case "MEDIUM":
      badgeStyle = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
      break
    case "HIGH":
      badgeStyle = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold"
      break
    default:
      badgeStyle = "bg-slate-100 text-slate-600 border-slate-200"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border shadow-sm w-fit shrink-0",
        badgeStyle,
        className
      )}
    >
      {normalizedPriority}
    </Badge>
  )
}
