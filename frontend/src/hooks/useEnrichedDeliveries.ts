import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DeliveriesService, type DeliveryPublic } from "@/client"
import { toast } from "sonner"

export interface DeliveryEnriched extends DeliveryPublic {
  tracking_id: string
  phone: string
  email: string
  address: string
  driver_name: string
  driver_id: string
  priority: "LOW" | "MEDIUM" | "HIGH"
  window_start: string
  window_end: string
  notes: string
}

interface EnrichmentData {
  phone?: string
  email?: string
  address?: string
  driver_id?: string
  priority?: "LOW" | "MEDIUM" | "HIGH"
  window_start?: string
  window_end?: string
  notes?: string
}

const LOCAL_STORAGE_KEY = "routeflow_deliveries_enrichment"

// Helper to get enrichment dictionary
function getEnrichmentDict(): Record<string, EnrichmentData> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(LOCAL_STORAGE_KEY)
  return data ? JSON.parse(data) : {}
}

// Helper to set enrichment dictionary
function saveEnrichmentDict(dict: Record<string, EnrichmentData>) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dict))
}

// Generate deterministic mock fallbacks based on ID
export function generateMockEnrichment(id: string, name: string): EnrichmentData {
  const hash = id.split("-").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const streets = ["MG Road", "Brigade Road", "Church Street", "Indiranagar", "Whitefield", "Koramangala", "Electronic City", "HSR Layout"]
  const streetNum = (hash % 800) + 100
  const street = streets[hash % streets.length]
  const address = `${streetNum} ${street}, Bengaluru, Karnataka, India`

  const priorities: ("LOW" | "MEDIUM" | "HIGH")[] = ["LOW", "MEDIUM", "HIGH"]
  const priority = priorities[hash % priorities.length]

  const phone = `+1 (555) 019-${(hash % 9000) + 1000}`
  const email = `${name.toLowerCase().replace(/\s+/g, "")}@example.com`

  // Get simulated drivers
  const driversRaw = localStorage.getItem("routeflow_drivers")
  let driver_id = ""
  if (driversRaw) {
    const drivers = JSON.parse(driversRaw)
    if (drivers.length > 0) {
      driver_id = drivers[hash % drivers.length].id
    }
  }

  const window_start = `${9 + (hash % 4)}:00 AM`
  const window_end = `${1 + (hash % 4)}:00 PM`

  return {
    phone,
    email,
    address,
    driver_id,
    priority,
    window_start,
    window_end,
    notes: "Leave package at front porch if recipient is not available.",
  }
}

export function useEnrichedDeliveries(skip = 0, limit = 100) {
  const queryClient = useQueryClient()

  // 1. Fetch from real backend
  const deliveriesQuery = useQuery({
    queryKey: ["deliveries", skip, limit],
    queryFn: () => DeliveriesService.readDeliveries({ skip, limit }),
  })

  // 2. Merge with enrichment layer
  const enrichmentDict = getEnrichmentDict()
  
  // Load drivers list to map driver_id to driver_name
  const driversRaw = localStorage.getItem("routeflow_drivers")
  const driversList = driversRaw ? JSON.parse(driversRaw) : []
  const driverMap = new Map<string, string>(
    driversList.map((d: any) => [d.id, d.name])
  )

  const enrichedData: DeliveryEnriched[] = (deliveriesQuery.data?.data || []).map((del) => {
    const enrichment = enrichmentDict[del.id] || generateMockEnrichment(del.id, del.customer_name)
    
    // Save generated fallback back into local dict if not set
    if (!enrichmentDict[del.id]) {
      enrichmentDict[del.id] = enrichment
      saveEnrichmentDict(enrichmentDict)
    }

    return {
      ...del,
      tracking_id: `RTF-${del.id.substring(0, 8).toUpperCase()}`,
      phone: enrichment.phone || "",
      email: enrichment.email || "",
      address: enrichment.address || "",
      driver_id: enrichment.driver_id || "",
      driver_name: enrichment.driver_id ? (driverMap.get(enrichment.driver_id) || "Assigned Driver") : "Unassigned",
      priority: enrichment.priority || "LOW",
      window_start: enrichment.window_start || "09:00 AM",
      window_end: enrichment.window_end || "05:00 PM",
      notes: enrichment.notes || "",
    }
  })

  // 3. Create Delivery Mutation
  const createDeliveryMutation = useMutation({
    mutationFn: async ({
      customer_name,
      latitude,
      longitude,
      status,
      enrichment,
    }: {
      customer_name: string
      latitude: number
      longitude: number
      status: string
      enrichment: EnrichmentData
    }) => {
      // Parse driver_id to be either a valid UUID or null
      const backendDriverId = (enrichment.driver_id && enrichment.driver_id !== "UNASSIGNED") 
        ? enrichment.driver_id 
        : null

      // POST to backend
      const res = await DeliveriesService.createDelivery({
        requestBody: {
          customer_name,
          latitude,
          longitude,
          status: status as any,
          driver_id: backendDriverId,
        },
      })
      // Save enrichment locally
      const dict = getEnrichmentDict()
      dict[res.id] = enrichment
      saveEnrichmentDict(dict)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Delivery created successfully!")
    },
    onError: (err: any) => {
      console.error(err)
      toast.error("Failed to create delivery. Please check details.")
    },
  })

  // 4. Update Delivery Mutation
  const updateDeliveryMutation = useMutation({
    mutationFn: async ({
      id,
      customer_name,
      latitude,
      longitude,
      status,
      enrichment,
    }: {
      id: string
      customer_name?: string
      latitude?: number
      longitude?: number
      status?: string
      enrichment?: EnrichmentData
    }) => {
      const backendDriverId = (enrichment?.driver_id && enrichment.driver_id !== "UNASSIGNED") 
        ? enrichment.driver_id 
        : null

      // PUT to backend
      const res = await DeliveriesService.updateDelivery({
        id,
        requestBody: {
          customer_name: customer_name || "",
          latitude: latitude || 0,
          longitude: longitude || 0,
          status: status as any,
          driver_id: backendDriverId,
        },
      })

      // Update enrichment locally
      if (enrichment) {
        const dict = getEnrichmentDict()
        dict[id] = {
          ...(dict[id] || {}),
          ...enrichment,
        }
        saveEnrichmentDict(dict)
      }
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Delivery updated successfully!")
    },
  })

  // 5. Delete Delivery Mutation
  const deleteDeliveryMutation = useMutation({
    mutationFn: async (id: string) => {
      await DeliveriesService.deleteDelivery({ id })
      // Clear enrichment
      const dict = getEnrichmentDict()
      delete dict[id]
      saveEnrichmentDict(dict)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Delivery deleted successfully!")
    },
  })

  return {
    deliveries: enrichedData,
    count: deliveriesQuery.data?.count || 0,
    isLoading: deliveriesQuery.isLoading,
    isError: deliveriesQuery.isError,
    createDelivery: createDeliveryMutation.mutateAsync,
    isCreating: createDeliveryMutation.isPending,
    updateDelivery: updateDeliveryMutation.mutateAsync,
    isUpdating: updateDeliveryMutation.isPending,
    deleteDelivery: deleteDeliveryMutation.mutateAsync,
    isDeleting: deleteDeliveryMutation.isPending,
  }
}
