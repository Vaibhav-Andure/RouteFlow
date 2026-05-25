"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 shadow-sm",
        className
      )}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        className="w-full"
        classNames={{
          root: "w-full",

          months:
            "flex flex-col gap-4 sm:flex-row",

          month:
            "space-y-4 w-full",

          month_caption:
            "relative flex items-center justify-center h-10",

          caption_label:
            "text-sm font-semibold",

          nav:
            "flex items-center gap-1",

          button_previous:
            "absolute left-1 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent",

          button_next:
            "absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent",

          month_grid:
            "w-full border-collapse",

          weekdays:
            "flex",

          weekday:
            "w-10 text-center text-xs font-medium text-muted-foreground",

          week:
            "flex mt-1",

          day:
            "relative p-0 text-center",

          day_button:
            cn(
              "h-10 w-10 rounded-md text-sm font-normal transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            ),

          selected:
            "bg-primary text-primary-foreground hover:bg-primary",

          today:
            "border border-primary font-semibold",

          outside:
            "text-muted-foreground opacity-50",

          disabled:
            "text-muted-foreground opacity-30",

          hidden:
            "invisible",

          range_start:
            "bg-primary text-primary-foreground rounded-l-md rounded-r-none",

          range_end:
            "bg-primary text-primary-foreground rounded-r-md rounded-l-none",

          range_middle:
            "bg-primary/15 text-foreground rounded-none",

          ...classNames,
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === "left" ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ),
        }}
        {...props}
      />
    </div>
  )
}