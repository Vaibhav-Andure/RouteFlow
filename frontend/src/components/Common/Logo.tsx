import { cn } from "@/lib/utils"

type LogoProps = {
  variant?: "full" | "responsive"
  className?: string
  asLink?: boolean
}

export function Logo({
  variant = "full",
  className,
}: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
        RF
      </div>

      {variant !== "responsive" && (
        <div>
          <p className="font-semibold">RouteFlow</p>
          <p className="text-xs text-muted-foreground">
            Delivery Optimization
          </p>
        </div>
      )}
    </div>
  )

  return content
}