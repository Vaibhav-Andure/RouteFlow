import { Search, Download, Trash2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  // Search
  searchPlaceholder?: string
  searchQuery: string
  onSearchChange: (query: string) => void

  // Status Filter
  statusValue?: string
  onStatusChange?: (status: string) => void
  statusOptions?: FilterOption[]

  // Date Filter
  dateValue?: string
  onDateChange?: (date: string) => void

  // Extra Actions
  onExportCSV?: () => void

  // Bulk Actions
  selectedCount?: number
  onBulkDelete?: () => void
  onBulkStatusUpdate?: (status: string) => void
  bulkStatusOptions?: FilterOption[]

  // Clear filters
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchQuery,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions = [],
  dateValue,
  onDateChange,
  onExportCSV,
  selectedCount = 0,
  onBulkDelete,
  onBulkStatusUpdate,
  bulkStatusOptions = [],
  onClearFilters,
  hasActiveFilters = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 bg-card border border-border/80 rounded-xl p-4 shadow-sm mb-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Basic Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 bg-background shadow-inner"
            />
          </div>

          {onStatusChange && statusOptions.length > 0 && (
            <Select value={statusValue || "ALL"} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {onDateChange && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateValue || ""}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-[160px] bg-background"
              />
            </div>
          )}

          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="text-xs flex items-center gap-1 hover:bg-accent"
            >
              <X className="size-3" /> Clear Filters
            </Button>
          )}
        </div>

        {/* Global actions like export */}
        <div className="flex items-center gap-2 shrink-0">
          {onExportCSV && (
            <Button
              variant="outline"
              onClick={onExportCSV}
              className="text-sm shadow-sm gap-1.5 flex items-center bg-background"
            >
              <Download className="size-4" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions banner */}
      {selectedCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="shadow-sm font-bold">
              {selectedCount} Selected
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              perform actions on selected records
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onBulkStatusUpdate && bulkStatusOptions.length > 0 && (
              <Select
                onValueChange={(val) => {
                  if (val && val !== "PLACEHOLDER") {
                    onBulkStatusUpdate(val)
                  }
                }}
              >
                <SelectTrigger className="w-[180px] h-9 bg-background text-xs">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  {bulkStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                className="h-9 gap-1.5 text-xs shadow-sm"
              >
                <Trash2 className="size-3.5" /> Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
