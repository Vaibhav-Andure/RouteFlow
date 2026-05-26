import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Plus, Eye, Edit2, Trash2, MapPin, Calendar, Clock, User as UserIcon } from "lucide-react"
import { useEnrichedDeliveries } from "@/hooks/useEnrichedDeliveries"
import { PageHeader } from "@/components/Common/PageHeader"
import { FilterBar } from "@/components/Common/FilterBar"
import { EmptyState } from "@/components/Common/EmptyState"
import { DeliveryStatusBadge } from "@/components/Common/DeliveryStatusBadge"
import { PriorityBadge } from "@/components/Common/PriorityBadge"
import { ConfirmDeleteDialog } from "@/components/Common/ConfirmDeleteDialog"
import { MapView } from "@/components/Map/MapView"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import moment from "moment"

export const Route = createFileRoute("/_layout/deliveries")({
  component: Deliveries,
  head: () => ({
    meta: [
      {
        title: "Deliveries - RouteFlow",
      },
    ],
  }),
})

function Deliveries() {
  const navigate = useNavigate()
  const {
    deliveries,
    isLoading,
    deleteDelivery,
    updateDelivery,
  } = useEnrichedDeliveries()

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateFilter, setDateFilter] = useState("")

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((del) => {
    // 1. Search Query
    const matchesSearch =
      del.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      del.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      del.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      del.tracking_id.toLowerCase().includes(searchQuery.toLowerCase())

    // 2. Status
    const matchesStatus =
      statusFilter === "ALL" || (del.status || "PENDING").toUpperCase() === statusFilter.toUpperCase()

    // 3. Date
    const matchesDate =
      !dateFilter ||
      moment(del.created_at).format("YYYY-MM-DD") === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  // Export CSV
  const handleExportCSV = () => {
    if (filteredDeliveries.length === 0) return
    const headers = "Tracking ID,Customer,Phone,Email,Address,Latitude,Longitude,Driver,Priority,Status,Created Date\n"
    const rows = filteredDeliveries
      .map(
        (d) =>
          `"${d.tracking_id}","${d.customer_name}","${d.phone}","${d.email}","${d.address.replace(/"/g, '""')}",${d.latitude},${d.longitude},"${d.driver_name}","${d.priority}","${d.status || "PENDING"}","${moment(d.created_at).format("YYYY-MM-DD")}"`
      )
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `routeflow_deliveries_${moment().format("YYYYMMDD_HHmmss")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle Bulk Status Update
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateDelivery({ id, status })
        )
      )
      setSelectedIds([])
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Delete Click
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
    setIsBulkDeleting(false)
    setDeleteOpen(true)
  }

  // Handle Bulk Delete Click
  const handleBulkDeleteClick = () => {
    setIsBulkDeleting(true)
    setDeleteOpen(true)
  }

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      if (isBulkDeleting) {
        await Promise.all(selectedIds.map((id) => deleteDelivery(id)))
        setSelectedIds([])
      } else if (deleteTargetId) {
        await deleteDelivery(deleteTargetId)
        setDeleteTargetId(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Map markers representation
  const mapMarkers = filteredDeliveries.map((del) => ({
    id: del.id,
    latitude: del.latitude,
    longitude: del.longitude,
    title: del.customer_name,
    subtitle: del.address,
    status: del.status || "PENDING",
    type: "delivery" as const,
  }))

  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "In Transit", value: "IN_TRANSIT" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ]

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL" || dateFilter !== ""

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setDateFilter("")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deliveries"
        description="Dispatch, view, search, and monitor ongoing client deliveries."
      >
        <Link to="/deliveries/new">
          <Button className="font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform">
            <Plus className="size-4" /> Create Delivery
          </Button>
        </Link>
      </PageHeader>

      {/* Map panel */}
      {filteredDeliveries.length > 0 && (
        <div className="w-full relative rounded-xl overflow-hidden shadow border border-border animate-in fade-in duration-300">
          <MapView markers={mapMarkers} zoom={11} className="h-[280px] w-full" />
          <div className="absolute top-3 right-3 z-[400] bg-background/95 backdrop-blur-sm border border-border font-bold text-xs px-3 py-1.5 rounded-lg shadow flex items-center gap-2">
            <Badge variant="secondary" className="shadow-inner">{filteredDeliveries.length}</Badge> active markers
          </div>
        </div>
      )}

      {/* Filter bar */}
      <FilterBar
        searchPlaceholder="Search customer, address, driver, tracking ID..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusOptions}
        dateValue={dateFilter}
        onDateChange={setDateFilter}
        onExportCSV={handleExportCSV}
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDeleteClick}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        bulkStatusOptions={statusOptions}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Main content table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching deliveries found" : "No deliveries yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your search criteria, dates, or status filters."
              : "Generate logistics transactions and assign them to your fleet."
          }
          icon={MapPin}
          actionLabel={hasActiveFilters ? "Clear Filters" : "Create Delivery"}
          onAction={hasActiveFilters ? handleClearFilters : () => navigate({ to: "/deliveries/new" })}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in duration-300">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={
                      selectedIds.length === filteredDeliveries.length &&
                      filteredDeliveries.length > 0
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(filteredDeliveries.map((d) => d.id))
                      } else {
                        setSelectedIds([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="font-bold">Tracking ID</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">Phone</TableHead>
                <TableHead className="font-bold">Address</TableHead>
                <TableHead className="font-bold">Driver</TableHead>
                <TableHead className="font-bold">Priority</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">ETA Window</TableHead>
                <TableHead className="font-bold">Created</TableHead>
                <TableHead className="w-[80px] text-right font-bold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.map((del) => {
                const isSelected = selectedIds.includes(del.id)
                return (
                  <TableRow
                    key={del.id}
                    className={`hover:bg-accent/40 transition-colors ${
                      isSelected ? "bg-primary/5 hover:bg-primary/10" : ""
                    }`}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds([...selectedIds, del.id])
                          } else {
                            setSelectedIds(selectedIds.filter((id) => id !== del.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {del.tracking_id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{del.customer_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{del.phone}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate" title={del.address}>
                      {del.address}
                    </TableCell>
                    <TableCell className="text-xs font-semibold">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <UserIcon className="size-3 text-muted-foreground" />
                        {del.driver_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={del.priority} />
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge status={del.status || "PENDING"} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" />
                        {del.window_start} - {del.window_end}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {moment(del.created_at).format("MMM DD, YYYY")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <span className="sr-only">Open Actions Menu</span>
                            • • •
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to="/deliveries/$id" params={{ id: del.id }}>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
                              <Eye className="size-3.5" /> View Details
                            </DropdownMenuItem>
                          </Link>
                          <Link to={`/deliveries/new`} search={{ editId: del.id }}>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
                              <Edit2 className="size-3.5" /> Edit Record
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(del.id)}
                            className="gap-2 text-destructive cursor-pointer text-xs hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        title={isBulkDeleting ? "Delete Selected Deliveries" : "Delete Delivery"}
        description={
          isBulkDeleting
            ? `Are you sure you want to delete ${selectedIds.length} selected deliveries? This action cannot be undone.`
            : "Are you sure you want to delete this delivery transaction? This will permanently erase the database record."
        }
      />
    </div>
  )
}
