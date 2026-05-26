import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus, Search, Phone, Mail, Truck, CheckCircle, Eye, Edit2, Ban, ShieldCheck } from "lucide-react"
import { useDrivers } from "@/hooks/useDrivers"
import { PageHeader } from "@/components/Common/PageHeader"
import { MetricCard } from "@/components/Common/MetricCard"
import { EmptyState } from "@/components/Common/EmptyState"
import { Input } from "@/components/ui/input"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Route = createFileRoute("/_layout/drivers")({
  component: DriversPage,
  head: () => ({
    meta: [
      {
        title: "Drivers Management - RouteFlow",
      },
    ],
  }),
})

function DriversPage() {
  const { drivers, isLoading, disableDriver, enableDriver } = useDrivers()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter drivers
  const filteredDrivers = drivers.filter((drv) =>
    drv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drv.phone.includes(searchQuery) ||
    drv.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drv.license_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Compute quick summary stats
  const totalDrivers = drivers.length
  const activeDrivers = drivers.filter((d) => d.status === "ACTIVE").length
  const totalCapacity = drivers.reduce((acc, d) => acc + (d.status === "ACTIVE" ? d.vehicle_capacity : 0), 0)
  const averageCapacity = activeDrivers > 0 ? Math.round(totalCapacity / activeDrivers) : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Drivers & Fleet"
        description="Monitor active courier drivers, track vehicle capacities, and assign logistics orders."
      >
        <Link to="/drivers/new">
          <Button className="font-bold flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform">
            <Plus className="size-4" /> Add Courier Driver
          </Button>
        </Link>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
        <MetricCard
          title="Total Fleet Drivers"
          value={totalDrivers}
          icon={<Truck className="size-5" />}
          description="Total drivers registered in system"
        />
        <MetricCard
          title="Active Drivers"
          value={activeDrivers}
          icon={<CheckCircle className="size-5 text-emerald-500" />}
          description="Drivers ready for routing schedules"
          trend={{ value: Math.round((activeDrivers / (totalDrivers || 1)) * 100), isPositive: true, label: "active" }}
        />
        <MetricCard
          title="Total Payload Capacity"
          value={`${totalCapacity} kg`}
          icon={<Truck className="size-5 text-blue-500" />}
          description="Combined cargo load limit"
        />
        <MetricCard
          title="Average Capacity"
          value={`${averageCapacity} kg`}
          icon={<Truck className="size-5 text-amber-500" />}
          description="Mean loading limit per courier vehicle"
        />
      </div>

      {/* Search and Table */}
      <div className="flex items-center gap-3 bg-card border border-border/80 rounded-xl p-4 shadow-sm animate-in fade-in duration-300">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search drivers by name, vehicle, license number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 bg-background"
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery("")} className="text-xs">
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No drivers found" : "No drivers registered"}
          description={
            searchQuery
              ? "Try adjusting your spelling or searching for another driver attribute."
              : "Register your delivery team, vehicle payloads, and driving certifications."
          }
          icon={Truck}
          actionLabel={searchQuery ? "Clear Search" : "Register Driver"}
          onAction={searchQuery ? () => setSearchQuery("") : () => {}}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in duration-300">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold">Courier Name</TableHead>
                <TableHead className="font-bold">Contact Info</TableHead>
                <TableHead className="font-bold">Vehicle Specification</TableHead>
                <TableHead className="font-bold">Cargo Capacity</TableHead>
                <TableHead className="font-bold">License Number</TableHead>
                <TableHead className="font-bold">Assigned Stops</TableHead>
                <TableHead className="font-bold">Stops Completed</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="w-[80px] text-right font-bold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((drv) => (
                <TableRow key={drv.id} className="hover:bg-accent/40 transition-colors">
                  <TableCell className="font-semibold text-foreground text-sm">{drv.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <Phone className="size-3 text-muted-foreground" /> {drv.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="size-3 text-muted-foreground" /> {drv.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Truck className="size-3.5 text-primary" /> {drv.vehicle_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    <Badge variant="secondary" className="shadow-inner font-mono text-xs">
                      {drv.vehicle_capacity} kg
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-muted-foreground">{drv.license_number}</TableCell>
                  <TableCell className="text-xs font-bold text-center">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {drv.deliveries_assigned} stops
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-center">
                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                      {drv.deliveries_completed} stops
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {drv.status === "ACTIVE" ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold px-2.5 rounded-full">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold px-2.5 rounded-full">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          • • •
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to="/drivers/$id" params={{ id: drv.id }}>
                          <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
                            <Eye className="size-3.5" /> View Profile
                          </DropdownMenuItem>
                        </Link>
                        <Link to={`/drivers/new`} search={{ editId: drv.id }}>
                          <DropdownMenuItem className="gap-2 cursor-pointer text-xs">
                            <Edit2 className="size-3.5" /> Edit Profile
                          </DropdownMenuItem>
                        </Link>
                        {drv.status === "ACTIVE" ? (
                          <DropdownMenuItem
                            onClick={() => disableDriver(drv.id)}
                            className="gap-2 text-rose-500 cursor-pointer text-xs hover:bg-rose-500/10"
                          >
                            <Ban className="size-3.5" /> Set Inactive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => enableDriver(drv.id)}
                            className="gap-2 text-emerald-500 cursor-pointer text-xs hover:bg-emerald-500/10"
                          >
                            <ShieldCheck className="size-3.5" /> Set Active
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
