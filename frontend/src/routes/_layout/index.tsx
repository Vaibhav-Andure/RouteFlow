import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link as RouterLink } from "@tanstack/react-router" // Added Link as RouterLink
import {
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle,
  Target,
  Calendar as CalendarIcon,
  Plus,
  Map,
  BarChart,
  ArrowRight,
} from "lucide-react"
import React, { Suspense } from "react" // Added React import
import { DateRange } from "react-day-picker" // Added DateRange import
import { format } from "date-fns" // Added format import

import { AnalyticsService, DeliveriesService } from "@/client"
import { AnalyticsChart } from "@/components/Analytics/AnalyticsChart"
import { DataTable } from "@/components/Common/DataTable"
import { DeliveryColumns } from "@/components/Deliveries/DeliveryColumns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PendingAnalytics,
  PendingDeliveries,
} from "@/components/Pending/PendingDashboard"
import { Button } from "@/components/ui/button" // Added Button import
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Added Popover imports
import { Calendar } from "@/components/ui/calendar" // Added Calendar import
import useAuth from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_layout/")({
  component: DashboardPage,
  beforeLoad: async () => {
    if (!localStorage.getItem("access_token")) {
      throw redirect({ to: "/login" });
    }
  },
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Template",
      },
    ],
  }),
})
import { useEnrichedDeliveries } from "@/hooks/useEnrichedDeliveries"
import { DeliveryStatusBadge } from "@/components/Common/DeliveryStatusBadge"
import { PriorityBadge } from "@/components/Common/PriorityBadge"
import { 
  Phone, 
  MapPin, 
  Play, 
  CheckCircle2, 
  XSquare, 
  FileText, 
  Navigation,
  Sparkles
} from "lucide-react"

function getAnalyticsQueryOptions() {
  return {
    queryFn: () => AnalyticsService.getAnalytics(),
    queryKey: ["analytics"],
  }
}

function getRecentDeliveriesQueryOptions() {
  return {
    queryFn: () => DeliveriesService.readDeliveries({ skip: 0, limit: 10 }),
    queryKey: ["recent-deliveries"],
  }
}

function AdminDashboardContent() {
  const { user: currentUser } = useAuth()
  const { data: analyticsData } = useSuspenseQuery(getAnalyticsQueryOptions())
  const { data: recentDeliveries } = useSuspenseQuery(
    getRecentDeliveriesQueryOptions(),
  )

  const { summary } = analyticsData

  const kpiCards = [
    {
      title: "Total Deliveries",
      value: summary.total_deliveries,
      description: "All deliveries recorded",
      icon: Package,
      iconBg: "bg-purple-500/20 text-purple-500",
      borderColor: "border-purple-500/30",
    },
    {
      title: "Pending",
      value: summary.pending,
      description: "Deliveries awaiting pickup",
      icon: Clock,
      iconBg: "bg-orange-500/20 text-orange-500",
      borderColor: "border-orange-500/30",
    },
    {
      title: "In Transit",
      value: summary.in_transit,
      description: "Deliveries currently on route",
      icon: Truck,
      iconBg: "bg-blue-500/20 text-blue-500",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Delivered",
      value: summary.delivered,
      description: "Deliveries successfully completed",
      icon: CheckCircle,
      iconBg: "bg-green-500/20 text-green-500",
      borderColor: "border-green-500/30",
    },
    {
      title: "Completion Rate",
      value: `${summary.completion_rate}%`,
      description: "Percentage of deliveries completed",
      icon: Target,
      iconBg: "bg-red-500/20 text-red-500",
      borderColor: "border-red-500/30",
    },
  ]

  const adminActions = [
    {
      title: "Create Delivery",
      description: "Add a new delivery to the system",
      icon: Plus,
      path: "/deliveries/new",
    },
    {
      title: "Optimize Route",
      description: "Find the best delivery route",
      icon: Map,
      path: "/optimization",
    },
    {
      title: "View Analytics",
      description: "See detailed analytics",
      icon: BarChart,
      path: "/analytics",
    },
  ];

  const driverActions = [
    {
      title: "My Deliveries",
      description: "View your assigned deliveries",
      icon: Truck,
      path: "/deliveries",
    },
    {
      title: "Route Map",
      description: "See your active route on map",
      icon: Map,
      path: "/optimization",
    },
  ];

  const quickActions = currentUser?.is_superuser ? adminActions : driverActions;

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2026, 4, 20),
    to: new Date(2026, 4, 25),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground">
            Hi, {currentUser?.full_name || currentUser?.email} 👋 Welcome back!
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpiCards.map((card, index) => (
          <Card key={index} className={cn("flex flex-col border bg-card/40 backdrop-blur-sm shadow-sm", card.borderColor)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  card.iconBg,
                )}
              >
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Chart and Recent Deliveries */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border border-border/60 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Delivery Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AnalyticsChart
              pending={summary.pending}
              inTransit={summary.in_transit}
              delivered={summary.delivered}
              cancelled={summary.cancelled}
              totalDeliveries={summary.total_deliveries}
            />
          </CardContent>
        </Card>
        <Card className="col-span-3 border border-border/60 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDeliveries.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  No recent deliveries yet
                </h3>
                <p className="text-muted-foreground">
                  Add a new delivery to see it here.
                </p>
              </div>
            ) : (
              <DataTable
                columns={DeliveryColumns}
                data={recentDeliveries.data}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deliveries Over Time */}
      <Card className="border border-border/60 bg-card/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Deliveries Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <BarChart className="size-10 text-muted-foreground/45" />
            <span className="text-sm font-semibold">Analytics overview loaded from active delivery sequences.</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          <Card key={index} className="flex flex-col border border-border/60 bg-card/30 backdrop-blur-sm hover:border-primary/45 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full bg-muted",
                )}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <Button variant="ghost" size="icon" asChild>
                <RouterLink to={action.path}>
                  <ArrowRight className="h-5 w-5" />
                </RouterLink>
              </Button>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardTitle className="text-lg font-bold">
                {action.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DriverDashboardContent() {
  const { user: currentUser, logout } = useAuth()
  const { deliveries, updateDelivery, isLoading } = useEnrichedDeliveries()

  // Dynamic KPIs compiled strictly from their assigned deliveries
  const totalStops = deliveries.length
  const pendingStops = deliveries.filter((d) => d.status === "PENDING").length
  const inTransitStops = deliveries.filter((d) => d.status === "IN_TRANSIT").length
  const completedStops = deliveries.filter((d) => d.status === "DELIVERED").length

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const delivery = deliveries.find((d) => d.id === id)
      if (!delivery) return

      await updateDelivery({
        id,
        customer_name: delivery.customer_name,
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        status: newStatus,
        enrichment: {
          phone: delivery.phone,
          email: delivery.email,
          address: delivery.address,
          driver_id: delivery.driver_id,
          priority: delivery.priority,
          window_start: delivery.window_start,
          window_end: delivery.window_end,
          notes: delivery.notes,
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  const driverKpiCards = [
    {
      title: "Assigned Stops",
      value: totalStops,
      description: "Total deliveries assigned",
      icon: Package,
      iconBg: "bg-purple-500/20 text-purple-500",
      borderColor: "border-purple-500/30",
    },
    {
      title: "Pending Pickup",
      value: pendingStops,
      description: "Awaiting route departure",
      icon: Clock,
      iconBg: "bg-orange-500/20 text-orange-500",
      borderColor: "border-orange-500/30",
    },
    {
      title: "In Transit",
      value: inTransitStops,
      description: "Stops currently active",
      icon: Truck,
      iconBg: "bg-blue-500/20 text-blue-500",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Completed",
      value: completedStops,
      description: "Successful drop-offs",
      icon: CheckCircle2,
      iconBg: "bg-green-500/20 text-green-500",
      borderColor: "border-green-500/30",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Driver Workspace</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.full_name || currentUser?.email} 👋 Vehicle: <span className="font-bold text-primary">{currentUser?.vehicle_type || "Standard Van"}</span> (Cap: {currentUser?.vehicle_capacity || 50}kg)
        </p>
      </div>
          <div className="flex justify-end mt-2">
            <Button variant="outline" onClick={logout}>Log Out</Button>
          </div>

      {/* Driver KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {driverKpiCards.map((card, index) => (
          <Card key={index} className={cn("flex flex-col border bg-card/40 backdrop-blur-sm shadow-sm", card.borderColor)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", card.iconBg)}>
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid split: Stops vs Guidelines */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Stops column */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border border-border/60 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Navigation className="size-5 text-primary animate-pulse" /> Active Stops Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Loading assigned deliveries...</p>
              ) : deliveries.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-2">
                  <div className="rounded-full bg-muted p-4">
                    <Search className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-md">No assigned stops</h3>
                  <p className="text-xs text-muted-foreground">You do not have any deliveries assigned to your vehicle today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveries.map((del) => (
                    <div 
                      key={del.id} 
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col sm:flex-row justify-between gap-4 bg-background/50",
                        del.status === "DELIVERED" ? "border-green-500/20 bg-green-500/5 opacity-75" : "border-border hover:border-border/80"
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{del.tracking_id}</span>
                          <DeliveryStatusBadge status={del.status || "PENDING"} />
                          <PriorityBadge priority={del.priority || "LOW"} />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{del.customer_name}</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {del.address || "Warehouse Pickup Location"}</p>
                          {del.phone && <p className="flex items-center gap-1.5"><Phone className="size-3.5" /> {del.phone}</p>}
                          <p className="flex items-center gap-1.5"><Clock className="size-3.5" /> Window: {del.window_start} - {del.window_end}</p>
                        </div>
                        {del.notes && (
                          <div className="text-xs border-l-2 border-primary/35 pl-2 mt-2 py-0.5 text-muted-foreground flex gap-1 bg-muted/30 rounded-r p-1">
                            <FileText className="size-3.5 shrink-0 text-primary/75 mt-0.5" />
                            <span><strong>Instructions:</strong> {del.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Action Buttons */}
                      <div className="flex sm:flex-col justify-end items-end gap-2 shrink-0">
                        {del.status === "PENDING" && (
                          <Button 
                            size="sm" 
                            className="w-full sm:w-32 gap-1.5 font-semibold text-xs" 
                            onClick={() => handleUpdateStatus(del.id, "IN_TRANSIT")}
                          >
                            <Play className="size-3.5" /> Start Route
                          </Button>
                        )}
                        {del.status === "IN_TRANSIT" && (
                          <Button 
                            size="sm" 
                            variant="default"
                            className="w-full sm:w-32 gap-1.5 font-semibold text-xs bg-green-600 hover:bg-green-700 text-white" 
                            onClick={() => handleUpdateStatus(del.id, "DELIVERED")}
                          >
                            <CheckCircle2 className="size-3.5" /> Complete Drop
                          </Button>
                        )}
                        {del.status !== "DELIVERED" && del.status !== "CANCELLED" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full sm:w-32 gap-1.5 font-semibold text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            onClick={() => handleUpdateStatus(del.id, "CANCELLED")}
                          >
                            <XSquare className="size-3.5" /> Cancel Stop
                          </Button>
                        )}
                        {del.status === "DELIVERED" && (
                          <span className="text-xs font-bold text-green-500 flex items-center gap-1"><CheckCircle2 className="size-4" /> Finished</span>
                        )}
                        {del.status === "CANCELLED" && (
                          <span className="text-xs font-bold text-destructive flex items-center gap-1"><XSquare className="size-4" /> Cancelled</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Guidelines column */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border border-border/60 bg-card/30 backdrop-blur-sm lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> WHAT TO DO Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Follow these standardized steps to execute your assigned routes efficiently and keep the dispatcher team updated in real time.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-foreground">Prepare vehicle load</h5>
                    <p className="text-muted-foreground">Verify all parcels against your stops sequence list before leaving the warehouse.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-foreground">Start the active route</h5>
                    <p className="text-muted-foreground">Click the <strong>Start Route</strong> button when departing. This sets status to <em>In Transit</em> so customers are notified.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-foreground">Review delivery details</h5>
                    <p className="text-muted-foreground">Check customer notes, phone numbers, and coordinates on maps to find exact drop locations.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">4</div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-foreground">Confirm drops in real-time</h5>
                    <p className="text-muted-foreground">Once package is in client hands, click <strong>Complete Drop</strong> to finalize, or <strong>Cancel Stop</strong> if unreachable.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 text-[11px] text-muted-foreground italic leading-normal">
                Need dispatcher support? Reach out to support@routeflow.com or call dispatcher hotline directly. Keep safe on the road!
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}

function DashboardContent() {
  const { user: currentUser } = useAuth()
  
  if (currentUser?.is_superuser) {
    return <AdminDashboardContent />
  } else {
    return <DriverDashboardContent />
  }
}

function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <PendingAnalytics />
            <PendingAnalytics />
            <PendingAnalytics />
            <PendingAnalytics />
            <PendingAnalytics />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Delivery Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingDeliveries />
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
