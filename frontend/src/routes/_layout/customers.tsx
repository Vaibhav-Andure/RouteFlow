import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Search, Eye, Phone, Mail, Calendar, Package, Users, BarChart } from "lucide-react"
import { useEnrichedDeliveries, type DeliveryEnriched } from "@/hooks/useEnrichedDeliveries"
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
import moment from "moment"

export const Route = createFileRoute("/_layout/customers")({
  component: CustomersPage,
  head: () => ({
    meta: [
      {
        title: "Customers Intelligence - RouteFlow",
      },
    ],
  }),
})

export interface DerivedCustomer {
  id: string // Deterministic hash
  name: string
  email: string
  phone: string
  deliveriesCount: number
  lastDeliveryDate: string
  deliveries: DeliveryEnriched[]
}

// Dynamic derivation of customers from deliveries
export function getDerivedCustomers(deliveries: DeliveryEnriched[]): DerivedCustomer[] {
  const customerMap = new Map<string, DeliveryEnriched[]>()

  // Group deliveries by customer name
  deliveries.forEach((del) => {
    const key = del.customer_name.trim()
    if (!customerMap.has(key)) {
      customerMap.set(key, [])
    }
    customerMap.get(key)!.push(del)
  })

  return Array.from(customerMap.entries()).map(([name, dels]) => {
    // Sort deliveries for this customer to find the latest
    const sorted = [...dels].sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())
    const latest = sorted[0]
    
    // Deterministic ID generation based on customer name
    const hashId = name.split("").reduce((acc, char) => acc + char.charCodeAt(0).toString(16), "")

    return {
      id: hashId,
      name,
      email: latest.email || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      phone: latest.phone || "+1 (555) 000-0000",
      deliveriesCount: dels.length,
      lastDeliveryDate: latest.created_at || new Date().toISOString(),
      deliveries: sorted,
    }
  })
}

function CustomersPage() {
  const { deliveries, isLoading } = useEnrichedDeliveries()
  const [searchQuery, setSearchQuery] = useState("")

  const customers = getDerivedCustomers(deliveries)

  // Filter customers
  const filteredCustomers = customers.filter((cust) =>
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.phone.includes(searchQuery)
  )

  // Compute summary stats
  const totalCustomers = customers.length
  const multiOrderCustomers = customers.filter((c) => c.deliveriesCount > 1).length
  const repeatClientRate = totalCustomers > 0 ? Math.round((multiOrderCustomers / totalCustomers) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers Intelligence"
        description="View client engagement records, dispatch volumes, and historical order retention analytics."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
        <MetricCard
          title="Total Client Base"
          value={totalCustomers}
          icon={<Users className="size-5 text-primary" />}
          description="Unique clients registered in system"
        />
        <MetricCard
          title="Repeat Dispatch Customers"
          value={multiOrderCustomers}
          icon={<Package className="size-5 text-emerald-500" />}
          description="Clients with 2 or more delivery orders"
        />
        <MetricCard
          title="Retention Loyalty Rate"
          value={`${repeatClientRate}%`}
          icon={<BarChart className="size-5 text-amber-500" />}
          description="Percentage of repeat courier requests"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-card border border-border/80 rounded-xl p-4 shadow-sm animate-in fade-in duration-300">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search customers by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
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
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No customers found" : "No customers registered"}
          description={
            searchQuery
              ? "Try adjusting your search query or spelling parameters."
              : "Generate deliveries to automatically build customer portfolios and retain contacts."
          }
          icon={Users}
          actionLabel={searchQuery ? "Clear Search" : "Create Delivery"}
          onAction={searchQuery ? () => setSearchQuery("") : () => {}}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card/70 backdrop-blur-sm overflow-hidden shadow-sm animate-in fade-in duration-300">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-bold">Client Name</TableHead>
                <TableHead className="font-bold">Email Address</TableHead>
                <TableHead className="font-bold">Contact Phone</TableHead>
                <TableHead className="font-bold text-center">Deliveries Dispatched</TableHead>
                <TableHead className="font-bold">Latest Order Date</TableHead>
                <TableHead className="w-[80px] text-right font-bold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((cust) => (
                <TableRow key={cust.id} className="hover:bg-accent/40 transition-colors">
                  <TableCell className="font-semibold text-foreground text-sm">{cust.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Mail className="size-3.5 text-muted-foreground" /> {cust.email}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Phone className="size-3.5 text-muted-foreground" /> {cust.phone}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="shadow-inner font-bold font-mono text-xs">
                      {cust.deliveriesCount} orders
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {moment(cust.lastDeliveryDate).format("MMMM DD, YYYY")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/customers/$id" params={{ id: cust.id }}>
                      <Button variant="ghost" size="icon" className="size-8" title="View Portfolio">
                        <Eye className="size-4 text-primary" />
                      </Button>
                    </Link>
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
