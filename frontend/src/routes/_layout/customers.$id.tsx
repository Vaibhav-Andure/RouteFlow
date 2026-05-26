import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowLeft, User, Phone, Mail, Package, CheckCircle, Clock } from "lucide-react"
import { useEnrichedDeliveries } from "@/hooks/useEnrichedDeliveries"
import { getDerivedCustomers } from "./customers"
import { PageHeader } from "@/components/Common/PageHeader"
import { MetricCard } from "@/components/Common/MetricCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeliveryStatusBadge } from "@/components/Common/DeliveryStatusBadge"
import { PriorityBadge } from "@/components/Common/PriorityBadge"
import moment from "moment"

export const Route = createFileRoute("/_layout/customers/$id")({
  component: CustomerDetailPage,
  head: () => ({
    meta: [
      {
        title: "Customer Profile - RouteFlow",
      },
    ],
  }),
})

function CustomerDetailPage() {
  const { id } = Route.useParams()
  const { deliveries, isLoading } = useEnrichedDeliveries()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Derive customers
  const customers = getDerivedCustomers(deliveries)
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <User className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold">Customer Profile Not Found</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The customer profile you are trying to view does not exist.
        </p>
        <Link to="/customers" className="mt-6">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    )
  }

  // Statistics for this specific customer
  const totalStops = customer.deliveries.length
  const completedStops = customer.deliveries.filter((d) => d.status === "DELIVERED").length
  const pendingStops = customer.deliveries.filter((d) => d.status === "PENDING" || d.status === "IN_TRANSIT").length
  const successRate = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Link to="/customers" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Customers Intelligence
        </Link>
      </div>

      <PageHeader
        title={customer.name}
        description="View individual dispatch logs, active delivery coordinates, and retention history."
      />

      {/* Customer stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
        <MetricCard
          title="Total Orders Placed"
          value={`${totalStops} shipments`}
          icon={<Package className="size-5 text-primary" />}
        />
        <MetricCard
          title="Active Deliveries"
          value={`${pendingStops} shipments`}
          icon={<Clock className="size-5 text-amber-500" />}
          description="In transit or dispatch queue"
        />
        <MetricCard
          title="Fulfillment Success Rate"
          value={`${successRate}%`}
          icon={<CheckCircle className="size-5 text-emerald-500" />}
          description="Delivered without issues"
          trend={{ value: successRate, isPositive: successRate >= 80 }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="size-5 text-primary" /> Contact Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span className="font-semibold">{customer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate" title={customer.email}>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery history list */}
        <Card className="md:col-span-2 border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Fulfillment Shipment Log</CardTitle>
            <CardDescription>A chronological audit log of all deliveries for {customer.name}.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold">Tracking ID</TableHead>
                  <TableHead className="font-bold">Destination</TableHead>
                  <TableHead className="font-bold">Priority</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.deliveries.map((del) => (
                  <TableRow key={del.id} className="hover:bg-accent/40 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      <Link to="/deliveries/$id" params={{ id: del.id }} className="hover:underline">
                        {del.tracking_id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs truncate max-w-[160px]" title={del.address}>
                      {del.address}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={del.priority} />
                    </TableCell>
                    <TableCell>
                      <DeliveryStatusBadge status={del.status || "PENDING"} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {moment(del.created_at).format("MMM DD, YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
