import { type ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon
  actionLabel?: string
  onAction?: () => void
  className?: string
  children?: ReactNode
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-8 text-center animate-in fade-in duration-300",
      className
    )}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/50 text-muted-foreground shadow-inner">
        <Icon className="h-10 w-10 text-primary/75" />
      </div>
      <h3 className="mt-6 text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        {description}
      </p>
      {onAction && actionLabel && (
        <Button onClick={onAction} className="mt-6 shadow-sm hover:scale-[1.02] transition-transform">
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  )
}
