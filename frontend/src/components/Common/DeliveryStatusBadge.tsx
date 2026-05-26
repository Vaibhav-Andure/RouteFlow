import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type DeliveryStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED"

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus | string
  className?: string
}

export function DeliveryStatusBadge({ status, className }: DeliveryStatusBadgeProps) {
  const normalizedStatus = (status || "PENDING").toUpperCase() as DeliveryStatus

  let badgeStyle = ""
  let dotStyle = ""

  switch (normalizedStatus) {
    case "PENDING":
      badgeStyle = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15"
      dotStyle = "bg-amber-500"
      break
    case "IN_TRANSIT":
      badgeStyle = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15"
      dotStyle = "bg-blue-500 animate-pulse"
      break
    case "DELIVERED":
      badgeStyle = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
      dotStyle = "bg-emerald-500"
      break
    case "CANCELLED":
      badgeStyle = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/15"
      dotStyle = "bg-rose-500"
      break
    default:
      badgeStyle = "bg-slate-500/10 text-slate-600 border-slate-500/20"
      dotStyle = "bg-slate-500"
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold tracking-wide flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border shadow-sm w-fit shrink-0",
        badgeStyle,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", dotStyle)} />
      {normalizedStatus.replace("_", " ")}
    </Badge>
  )
}
