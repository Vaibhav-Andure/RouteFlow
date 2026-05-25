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
  head: () => ({
    meta: [
      {
        title: "Dashboard - FastAPI Template",
      },
    ],
  }),
})
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

function DashboardContent() {
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
      borderColor: "border-purple-500",
    },
    {
      title: "Pending",
      value: summary.pending,
      description: "Deliveries awaiting pickup",
      icon: Clock,
      iconBg: "bg-orange-500/20 text-orange-500",
      borderColor: "border-orange-500",
    },
    {
      title: "In Transit",
      value: summary.in_transit,
      description: "Deliveries currently on route",
      icon: Truck,
      iconBg: "bg-blue-500/20 text-blue-500",
      borderColor: "border-blue-500",
    },
    {
      title: "Delivered",
      value: summary.delivered,
      description: "Deliveries successfully completed",
      icon: CheckCircle,
      iconBg: "bg-green-500/20 text-green-500",
      borderColor: "border-green-500",
    },
    {
      title: "Completion Rate",
      value: `${summary.completion_rate}%`,
      description: "Percentage of deliveries completed",
      icon: Target,
      iconBg: "bg-red-500/20 text-red-500", // Using red for completion rate as per image
      borderColor: "border-red-500",
    },
  ]

  const quickActions = [
    {
      title: "Create Delivery",
      description: "Add a new delivery to the system",
      icon: Plus,
      path: "/deliveries/create",
    },
    {
      title: "Optimize Route",
      description: "Find the best delivery route",
      icon: Map,
      path: "/optimize-route",
    },
    {
      title: "View Analytics",
      description: "See detailed analytics",
      icon: BarChart,
      path: "/analytics",
    },
  ]

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2026, 4, 20),
    to: new Date(2026, 4, 25),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
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
          <Card key={index} className={cn("flex flex-col", card.borderColor)}>
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
        <Card className="col-span-4">
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
        <Card className="col-span-3">
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
      <Card>
        <CardHeader>
          <CardTitle>Deliveries Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for the bar chart */}
          <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">
            Bar chart for daily deliveries will go here.
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action, index) => (
          <Card key={index} className="flex flex-col">
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
