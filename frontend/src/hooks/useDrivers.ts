import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UsersService, type UserPublic } from "@/client"
import { toast } from "sonner"
import useAuth from "@/hooks/useAuth"

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
  vehicle_type: string
  vehicle_capacity: number
  license_number: string
  status: "ACTIVE" | "INACTIVE"
  created_at: string
}

export interface DriverEnriched extends Driver {
  deliveries_assigned: number
  deliveries_completed: number
}

export function useDrivers() {
  const queryClient = useQueryClient()
  const { user: currentUser } = useAuth()

  // 1. Fetch real users from the database (only for superusers)
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
    enabled: !!currentUser?.is_superuser,
  })

  // 2. Map backend users where is_superuser is false to Driver interface
  const dbDrivers: Driver[] = (usersQuery.data?.data || [])
    .filter((u) => !u.is_superuser)
    .map((u) => ({
      id: u.id,
      name: u.full_name || "Unknown Driver",
      phone: u.phone || "+1 (555) 012-3456",
      email: u.email,
      vehicle_type: u.vehicle_type || "Van",
      vehicle_capacity: u.vehicle_capacity || 50,
      license_number: u.license_number || "DL-9283471-A",
      status: u.is_active ? "ACTIVE" : "INACTIVE",
      created_at: u.created_at || new Date().toISOString(),
    }))

  // 3. Compute enriched stats (deliveries assigned vs completed)
  const getEnrichedDrivers = (): DriverEnriched[] => {
    const delsRaw = localStorage.getItem("routeflow_deliveries_enrichment")
    const delsDict = delsRaw ? JSON.parse(delsRaw) : {}
    
    const assignments: Record<string, { assigned: number; completed: number }> = {}
    
    Object.keys(delsDict).forEach((key) => {
      const del = delsDict[key]
      if (del.driver_id) {
        if (!assignments[del.driver_id]) {
          assignments[del.driver_id] = { assigned: 0, completed: 0 }
        }
        assignments[del.driver_id].assigned += 1
        if (del.status === "DELIVERED") {
          assignments[del.driver_id].completed += 1
        }
      }
    })

    return dbDrivers.map((driver) => {
      const counts = assignments[driver.id] || { assigned: 0, completed: 0 }
      return {
        ...driver,
        deliveries_assigned: counts.assigned,
        deliveries_completed: counts.completed,
      }
    })
  }

  // 4. Update Driver Mutation (mocked or database patch)
  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserPublic> }) => {
      return UsersService.updateUser({
        userId: id,
        requestBody: data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Driver profile updated successfully!")
    },
    onError: () => {
      toast.error("Failed to update driver profile.")
    }
  })

  // 5. Add Driver Mutation (For admin creating a driver manually)
  const addDriverMutation = useMutation({
    mutationFn: async (driverData: any) => {
      return UsersService.createUser({
        requestBody: {
          email: driverData.email,
          password: "changethis123", // default password
          full_name: driverData.name,
          phone: driverData.phone,
          vehicle_type: driverData.vehicle_type,
          vehicle_capacity: driverData.vehicle_capacity,
          license_number: driverData.license_number,
          is_superuser: false,
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Driver added successfully!")
    },
    onError: () => {
      toast.error("Failed to create driver.")
    }
  })

  return {
    drivers: getEnrichedDrivers(),
    rawDrivers: dbDrivers,
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    addDriver: (data: any) => addDriverMutation.mutate(data),
    updateDriver: (id: string, data: any) => updateDriverMutation.mutate({ id, data }),
    disableDriver: (id: string) => updateDriverMutation.mutate({ id, data: { is_active: false } }),
    enableDriver: (id: string) => updateDriverMutation.mutate({ id, data: { is_active: true } }),
  }
}
