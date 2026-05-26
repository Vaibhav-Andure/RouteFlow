import { useEffect } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Send, User } from "lucide-react"
import { useDrivers } from "@/hooks/useDrivers"
import { PageHeader } from "@/components/Common/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Search schema to support Editing
interface DriversSearch {
  editId?: string
}

export const Route = createFileRoute("/_layout/drivers/new")({
  component: DriverFormPage,
  validateSearch: (search: Record<string, unknown>): DriversSearch => {
    return {
      editId: search.editId as string | undefined,
    }
  },
})

// Zod Validation Schema
const driverFormSchema = z.object({
  name: z.string().min(1, "Courier name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  vehicle_capacity: z.number().min(1, "Vehicle capacity must be greater than 0"),
  license_number: z.string().min(1, "Driving license number is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

type DriverFormValues = z.infer<typeof driverFormSchema>

function DriverFormPage() {
  const navigate = useNavigate()
  const search = Route.useSearch() as DriversSearch
  const editId = search.editId

  const { rawDrivers, addDriver, updateDriver } = useDrivers()

  // Find driver to edit
  const editingDriver = editId ? rawDrivers.find((d) => d.id === editId) : null

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      vehicle_type: "Van",
      vehicle_capacity: 50,
      license_number: "",
      status: "ACTIVE",
    },
  })

  // Prepopulate form if editing
  useEffect(() => {
    if (editingDriver) {
      reset({
        name: editingDriver.name,
        phone: editingDriver.phone,
        email: editingDriver.email,
        vehicle_type: editingDriver.vehicle_type,
        vehicle_capacity: editingDriver.vehicle_capacity,
        license_number: editingDriver.license_number,
        status: editingDriver.status,
      })
    }
  }, [editingDriver, reset])

  // Submit Handler
  const onSubmit = async (values: DriverFormValues) => {
    try {
      if (editId) {
        // Edit Mode
        updateDriver(editId, values)
      } else {
        // Create Mode
        addDriver(values)
      }
      navigate({ to: "/drivers" })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Link to="/drivers" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Drivers List
        </Link>
      </div>

      <PageHeader
        title={editId ? "Edit Driver" : "Register Driver"}
        description={
          editId
            ? `Update profile details and logistics parameters for driver ${editingDriver?.name}.`
            : "Register a new delivery driver, specify vehicle types, cargo payloads, and licenses."
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="size-5 text-primary" /> Courier Profile Information
            </CardTitle>
            <CardDescription>Enter contact details and logistics metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input
                id="name"
                placeholder="E.g. Alex Mercer"
                {...register("name")}
                className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.name && (
                <p className="text-xs font-semibold text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="E.g. +1 (555) 012-3456"
                  {...register("phone")}
                  className={errors.phone ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.phone && (
                  <p className="text-xs font-semibold text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E.g. alex.mercer@routeflow.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vehicle Type</Label>
                <Input
                  id="vehicle_type"
                  placeholder="E.g. EV Cargo Van, Box Truck..."
                  {...register("vehicle_type")}
                  className={errors.vehicle_type ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.vehicle_type && (
                  <p className="text-xs font-semibold text-destructive">{errors.vehicle_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cargo Capacity (kg)</Label>
                <Input
                  id="vehicle_capacity"
                  type="number"
                  placeholder="E.g. 80"
                  onChange={(e) => setValue("vehicle_capacity", parseInt(e.target.value) || 0)}
                  value={watch("vehicle_capacity")}
                  className={errors.vehicle_capacity ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.vehicle_capacity && (
                  <p className="text-xs font-semibold text-destructive">{errors.vehicle_capacity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driving License Number</Label>
                <Input
                  id="license_number"
                  placeholder="E.g. DL-9283471-A"
                  {...register("license_number")}
                  className={errors.license_number ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.license_number && (
                  <p className="text-xs font-semibold text-destructive">{errors.license_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Courier Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active / Dispatched</SelectItem>
                        <SelectItem value="INACTIVE">Inactive / Off Duty</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3">
              <Link to="/drivers">
                <Button type="button" variant="outline" className="bg-background">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="font-bold flex items-center gap-1.5 shadow-sm">
                <Send className="size-4" /> {editId ? "Update Profile" : "Register Driver"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
