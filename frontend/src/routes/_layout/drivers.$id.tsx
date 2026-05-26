import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, Edit2, User, Phone, Mail, Truck, Award, CheckCircle, Package, Clock, MapPin } from "lucide-react"
import { useDrivers } from "@/hooks/useDrivers"
import { useEnrichedDeliveries } from "@/hooks/useEnrichedDeliveries"
import { PageHeader } from "@/components/Common/PageHeader"
import { MetricCard } from "@/components/Common/MetricCard"
import { MapView } from "@/components/Map/MapView"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { DeliveryStatusBadge } from "@/components/Common/DeliveryStatusBadge"
import { PriorityBadge } from "@/components/Common/PriorityBadge"
import moment from "moment"

export const Route = createFileRoute("/_layout/drivers/$id")({
  component: DriverDetailsPage,
  head: () => ({
    meta: [
      {
        title: "Driver Profile - RouteFlow",
      },
    ],
  }),
})

function DriverDetailsPage() {
  const { id } = Route.useParams()
  const { drivers, disableDriver, enableDriver } = useDrivers()
  const { deliveries } = useEnrichedDeliveries()

  const driver = drivers.find((d) => d.id === id)

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <User className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold">Driver Not Found</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The driver profile you are trying to view does not exist.
        </p>
        <Link to="/drivers" className="mt-6">
          <Button variant="outline">Back to Drivers</Button>
        </Link>
      </div>
    )
  }

  // Get deliveries assigned to this driver
  const assignedDeliveries = deliveries.filter((d) => d.driver_id === driver.id)

  const activeDeliveries = assignedDeliveries.filter((d) => d.status !== "DELIVERED" && d.status !== "CANCELLED")
  const completedDeliveries = assignedDeliveries.filter((d) => d.status === "DELIVERED")

  // Map markers for driver's stops
  const mapMarkers = assignedDeliveries.map((del) => ({
    id: del.id,
    latitude: del.latitude,
    longitude: del.longitude,
    title: del.customer_name,
    subtitle: del.address,
    status: del.status,
    type: "delivery" as const,
  }))

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Link to="/drivers" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Fleet Drivers
        </Link>
      </div>

      <PageHeader
        title={driver.name}
        description={`Courier partner since ${moment(driver.created_at).format("MMMM YYYY")}`}
      >
        <Link to={`/drivers/new`} search={{ editId: driver.id }}>
          <Button variant="outline" className="gap-1.5 h-10 bg-background shadow-sm">
            <Edit2 className="size-4" /> Edit Profile
          </Button>
        </Link>
        {driver.status === "ACTIVE" ? (
          <Button variant="destructive" onClick={() => disableDriver(driver.id)} className="gap-1.5 h-10 shadow-sm">
            Disable Driver
          </Button>
        ) : (
          <Button variant="default" onClick={() => enableDriver(driver.id)} className="gap-1.5 h-10 shadow-sm">
            Enable Driver
          </Button>
        )}
      </PageHeader>

      {/* Driver summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
        <MetricCard
          title="Assigned Workload"
          value={`${assignedDeliveries.length} stops`}
          icon={<Package className="size-5 text-primary" />}
          description="Total lifetime assignments"
        />
        <MetricCard
          title="Pending Deliveries"
          value={`${activeDeliveries.length} stops`}
          icon={<Clock className="size-5 text-amber-500" />}
          description="Stops remaining on route today"
        />
        <MetricCard
          title="Completed Deliveries"
          value={`${completedDeliveries.length} stops`}
          icon={<CheckCircle className="size-5 text-emerald-500" />}
          description="Successfully completed runs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Stops List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Courier Profile Parameters</CardTitle>
              <CardDescription>Official driver licensing, vehicles and load specifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{driver.name}</div>
                    <div className="text-xs text-muted-foreground">Full Name</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{driver.phone}</div>
                    <div className="text-xs text-muted-foreground">Contact Phone</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold truncate max-w-[200px]" title={driver.email}>
                      {driver.email}
                    </div>
                    <div className="text-xs text-muted-foreground">Email Address</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Award className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-mono font-semibold">{driver.license_number}</div>
                    <div className="text-xs text-muted-foreground">License ID Certificate</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Truck className="size-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{driver.vehicle_type}</div>
                    <div className="text-xs text-muted-foreground">Dispatched Vehicle</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <Package className="size-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{driver.vehicle_capacity} kg</div>
                    <div className="text-xs text-muted-foreground">Maximum Payload Weight</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Stops Table */}
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Assigned Stops Sequence</CardTitle>
              <CardDescription>Real-time list of client shipments assigned to driver.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {assignedDeliveries.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No shipments currently assigned to this driver.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Tracking ID</TableHead>
                      <TableHead className="font-bold">Customer</TableHead>
                      <TableHead className="font-bold">Address</TableHead>
                      <TableHead className="font-bold">Priority</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">ETA Window</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedDeliveries.map((del) => (
                      <TableRow key={del.id} className="hover:bg-accent/40 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          <Link to="/deliveries/$id" params={{ id: del.id }} className="hover:underline">
                            {del.tracking_id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground">{del.customer_name}</TableCell>
                        <TableCell className="text-xs truncate max-w-[150px]">{del.address}</TableCell>
                        <TableCell>
                          <PriorityBadge priority={del.priority} />
                        </TableCell>
                        <TableCell>
                          <DeliveryStatusBadge status={del.status || "PENDING"} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {del.window_start} - {del.window_end}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Map & Route details */}
        <div className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Active Route
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {assignedDeliveries.length > 0 ? (
                <MapView
                  markers={mapMarkers}
                  className="h-[300px] w-full"
                />
              ) : (
                <div className="h-[200px] flex items-center justify-center bg-accent/20 text-xs text-muted-foreground font-semibold">
                  No coordinates available (no stops assigned)
                </div>
              )}
              <div className="p-4 space-y-2 bg-background/50 border-t border-border text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver Status:</span>
                  {driver.status === "ACTIVE" ? (
                    <span className="text-emerald-500 font-bold">On Duty / Active</span>
                  ) : (
                    <span className="text-rose-500 font-bold">Off Duty / Inactive</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Stops:</span>
                  <span className="text-foreground font-bold">{assignedDeliveries.length} stops</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
