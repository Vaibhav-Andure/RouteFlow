import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, Calendar, User as UserIcon, Clock, Clipboard, FileText, CheckCircle, Truck, Package, XCircle } from "lucide-react"
import { useEnrichedDeliveries } from "@/hooks/useEnrichedDeliveries"
import { PageHeader } from "@/components/Common/PageHeader"
import { DeliveryStatusBadge } from "@/components/Common/DeliveryStatusBadge"
import { PriorityBadge } from "@/components/Common/PriorityBadge"
import { ConfirmDeleteDialog } from "@/components/Common/ConfirmDeleteDialog"
import { MapView } from "@/components/Map/MapView"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import moment from "moment"

export const Route = createFileRoute("/_layout/deliveries/$id")({
  component: DeliveryDetailsPage,
  head: ({ params }) => ({
    meta: [
      {
        title: `Delivery ${params.id} - RouteFlow`,
      },
    ],
  }),
})

function DeliveryDetailsPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { deliveries, deleteDelivery } = useEnrichedDeliveries()

  const [deleteOpen, setDeleteOpen] = useState(false)

  const delivery = deliveries.find((d) => d.id === id)

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <MapPin className="size-12 text-muted-foreground animate-bounce mb-4" />
        <h3 className="text-xl font-bold">Delivery Not Found</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The delivery ID you are trying to view does not exist or has been deleted.
        </p>
        <Link to="/deliveries" className="mt-6">
          <Button variant="outline">Back to Deliveries</Button>
        </Link>
      </div>
    )
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteDelivery(delivery.id)
      navigate({ to: "/deliveries" })
    } catch (e) {
      console.error(e)
    }
  }

  // Define status milestones for timeline
  const milestones = [
    {
      status: "PENDING",
      title: "Order Placed & Registered",
      description: "Delivery ticket successfully added to logistics dispatch queue.",
      icon: Package,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      status: "IN_TRANSIT",
      title: "Dispatched & In Transit",
      description: `Order assigned to driver ${delivery.driver_name} and in routing.`,
      icon: Truck,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      status: "DELIVERED",
      title: "Delivered Successfully",
      description: "Package successfully checked off and verified at client destination.",
      icon: CheckCircle,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ]

  const getStatusIndex = (status: string) => {
    if (status === "CANCELLED") return -1
    if (status === "DELIVERED") return 2
    if (status === "IN_TRANSIT") return 1
    return 0
  }

  const currentStatusIndex = getStatusIndex(delivery.status || "PENDING")

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Link to="/deliveries" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Deliveries
        </Link>
      </div>

      <PageHeader
        title={delivery.tracking_id}
        description={`Order registered on ${moment(delivery.created_at).format("LLLL")}`}
      >
        <Link to={`/deliveries/new`} search={{ editId: delivery.id }}>
          <Button variant="outline" className="gap-1.5 h-10 bg-background shadow-sm">
            <Edit2 className="size-4" /> Edit Record
          </Button>
        </Link>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="gap-1.5 h-10 shadow-sm">
          <Trash2 className="size-4" /> Delete Record
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Delivery parameters & timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-bold">Delivery Parameters</CardTitle>
                  <CardDescription>Full log of client order metadata.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={delivery.priority} />
                  <DeliveryStatusBadge status={delivery.status || "PENDING"} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient Details */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Client Recipient</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <UserIcon className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{delivery.customer_name}</div>
                      <div className="text-xs text-muted-foreground">Recipient Name</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{delivery.phone}</div>
                      <div className="text-xs text-muted-foreground">Phone Number</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{delivery.email}</div>
                      <div className="text-xs text-muted-foreground">Email Address</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold max-w-[240px] truncate" title={delivery.address}>
                        {delivery.address}
                      </div>
                      <div className="text-xs text-muted-foreground">Drop-off Destination</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Logistics */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Dispatch Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <UserIcon className="size-5 text-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{delivery.driver_name}</div>
                      <div className="text-xs text-muted-foreground">Assigned Fleet Driver</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Clock className="size-5 text-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {delivery.window_start} - {delivery.window_end}
                      </div>
                      <div className="text-xs text-muted-foreground">ETA Delivery Window</div>
                    </div>
                  </div>
                </div>
              </div>

              {delivery.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Clipboard className="size-3.5" /> Dispatch Notes
                    </h4>
                    <p className="text-sm bg-accent/40 rounded-lg p-3 border border-border/60 text-muted-foreground leading-relaxed italic">
                      "{delivery.notes}"
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline Tracking */}
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileText className="size-5 text-primary" /> Delivery Status Timeline
              </CardTitle>
              <CardDescription>Audit log of status updates and transit milestones.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {delivery.status === "CANCELLED" ? (
                <div className="flex items-start gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 animate-in fade-in duration-300">
                  <div className="size-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
                    <XCircle className="size-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-rose-600 dark:text-rose-400">Delivery Cancelled</h5>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      This shipment route was manually cancelled by the administrator or dispatcher. The driver has been flagged.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative border-l-2 border-border/60 ml-4 pl-6 space-y-8 py-2">
                  {milestones.map((m, idx) => {
                    const isPassed = idx <= currentStatusIndex
                    const isCurrent = idx === currentStatusIndex
                    const IconComp = m.icon

                    return (
                      <div key={m.status} className="relative group/timeline animate-in fade-in duration-300">
                        {/* Bullet circle */}
                        <div className={`absolute -left-[35px] top-0 size-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                          isPassed 
                            ? isCurrent 
                              ? "bg-primary border-primary text-white scale-110 ring-4 ring-primary/20 animate-pulse"
                              : "bg-emerald-500 border-emerald-500 text-white" 
                            : "bg-background border-border text-muted-foreground"
                        }`}>
                          <IconComp className="size-4 shrink-0" />
                        </div>

                        <div>
                          <div className={`text-sm font-bold flex items-center gap-2 ${
                            isCurrent ? "text-primary text-base" : isPassed ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {m.title}
                            {isCurrent && (
                              <Badge variant="default" className="text-[9px] uppercase tracking-wider py-0 px-1.5 h-4 font-bold shadow-sm">
                                active state
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-md">
                            {m.description}
                          </p>
                          {isPassed && (
                            <div className="text-[10px] text-muted-foreground/80 mt-2 font-mono flex items-center gap-1 font-semibold">
                              <Calendar className="size-3" />
                              Timestamp: {moment(delivery.created_at).add(idx * 2, "hours").format("LLL")}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Map location & metadata */}
        <div className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Destination Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapView
                markers={[{
                  id: delivery.id,
                  latitude: delivery.latitude,
                  longitude: delivery.longitude,
                  title: delivery.customer_name,
                  subtitle: delivery.address,
                  status: delivery.status,
                  type: "delivery" as const,
                }]}
                center={[delivery.latitude, delivery.longitude]}
                zoom={14}
                className="h-[260px] w-full rounded-none"
              />
              <div className="p-4 space-y-2 bg-background/50 border-t border-border">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{delivery.latitude}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{delivery.longitude}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Audit & Owner Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Database ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 select-all">{delivery.id.substring(0, 18)}...</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span>Dispatcher (Owner ID):</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{delivery.owner_id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>System Status Check:</span>
                <span className="text-emerald-500 font-bold">Synchronized</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        description="Are you sure you want to permanently delete this delivery records? This cannot be undone."
      />
    </div>
  )
}
