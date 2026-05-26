import { useEffect } from "react"
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, MapPin, Send, Trash } from "lucide-react"
import { useEnrichedDeliveries } from "@/hooks/useEnrichedDeliveries"
import { useDrivers } from "@/hooks/useDrivers"
import { PageHeader } from "@/components/Common/PageHeader"
import { DeliveryMap } from "@/components/Map/DeliveryMap"
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
interface DeliveriesSearch {
  editId?: string
}

export const Route = createFileRoute("/_layout/deliveries/new")({
  component: DeliveryFormPage,
  validateSearch: (search: Record<string, unknown>): DeliveriesSearch => {
    return {
      editId: search.editId as string | undefined,
    }
  },
})

// Zod Validation Schema
const deliveryFormSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional(),
  email: z.string().optional().or(z.literal("")),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  driver_id: z.string().optional(),
  window_start: z.string().optional(),
  window_end: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
})

type DeliveryFormValues = z.infer<typeof deliveryFormSchema>

function DeliveryFormPage() { console.log('DeliveryFormPage mounted');
  const navigate = useNavigate()
  const search = Route.useSearch() as DeliveriesSearch
  const editId = search.editId

  const { deliveries, createDelivery, updateDelivery, deleteDelivery } = useEnrichedDeliveries()
  const { drivers } = useDrivers()

  // Find delivery to edit
  const editingDelivery = editId ? deliveries.find((d) => d.id === editId) : null

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      address: "",
      latitude: undefined, // No default coordinate
      longitude: undefined,
      priority: "LOW",
      driver_id: "",
      window_start: "09:00 AM",
      window_end: "01:00 PM",
      notes: "",
      status: "PENDING",
    },
  })

  // Log validation errors if any
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Delivery Form Validation Errors:", errors)
    }
  }, [errors])

  // Prepopulate form if editing
  useEffect(() => {
    if (editingDelivery) {
      reset({
        customer_name: editingDelivery.customer_name,
        phone: editingDelivery.phone,
        email: editingDelivery.email,
        address: editingDelivery.address,
        latitude: editingDelivery.latitude,
        longitude: editingDelivery.longitude,
        priority: editingDelivery.priority,
        driver_id: editingDelivery.driver_id,
        window_start: editingDelivery.window_start,
        window_end: editingDelivery.window_end,
        notes: editingDelivery.notes,
        status: editingDelivery.status,
      })
    }
  }, [editingDelivery, reset])

  const watchLat = watch("latitude")
  const watchLng = watch("longitude")

  // Submit Handler
  const onSubmit = async (values: DeliveryFormValues) => {
    console.log('Submitting delivery values:', values);
    try {
      const enrichment = {
        phone: values.phone || "",
        email: values.email || "",
        address: values.address || "",
        driver_id: values.driver_id || "",
        priority: values.priority || "LOW",
        window_start: values.window_start || "09:00 AM",
        window_end: values.window_end || "05:00 PM",
        notes: values.notes || "",
        status: values.status || "PENDING",
      }

      if (editId) {
        // Edit Mode
        await updateDelivery({
          id: editId,
          customer_name: values.customer_name,
          latitude: values.latitude,
          longitude: values.longitude,
          status: values.status || "PENDING",
          enrichment,
        })
      } else {
        // Create Mode
        await createDelivery({
          customer_name: values.customer_name,
          latitude: values.latitude,
          longitude: values.longitude,
          status: values.status || "PENDING",
          enrichment,
        })
      }

      navigate({ to: "/deliveries" })
    } catch (e) {
      console.error(e)
    }
  }

  // Save Draft
  const handleSaveDraft = async () => {
    const values = watch()
    try {
      const enrichment = {
        phone: values.phone,
        email: values.email,
        address: values.address,
        driver_id: values.driver_id || "",
        priority: values.priority,
        window_start: values.window_start,
        window_end: values.window_end,
        notes: values.notes || "",
        status: "PENDING",
      }

      if (editId) {
        await updateDelivery({
          id: editId,
          customer_name: values.customer_name || "Draft Recipient",
          latitude: values.latitude || 40.7128,
          longitude: values.longitude || -74.006,
          status: "PENDING",
          enrichment,
        })
      } else {
        await createDelivery({
          customer_name: values.customer_name || "Draft Recipient",
          latitude: values.latitude || 40.7128,
          longitude: values.longitude || -74.006,
          status: "PENDING",
          enrichment,
        })
      }
      navigate({ to: "/deliveries" })
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async () => {
    if (!editId) return
    if (confirm("Are you sure you want to delete this delivery?")) {
      await deleteDelivery(editId)
      navigate({ to: "/deliveries" })
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Link to="/deliveries" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="size-3.5" /> Back to Deliveries
        </Link>
      </div>

      <PageHeader
        title={editId ? "Edit Delivery" : "Create Delivery"}
        description={
          editId
            ? `Update delivery records and assign vehicles for tracking ID ${editingDelivery?.tracking_id}.`
            : "Generate a new client logistics order and dispatch to active fleet vehicles."
        }
      >
        {editId && (
          <Button variant="destructive" onClick={handleDelete} className="gap-1.5 h-10">
            <Trash className="size-4" /> Delete Delivery
          </Button>
        )}
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recipient Information</CardTitle>
              <CardDescription>Enter contact details and delivery specifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Name</Label>
                  <Input
                    id="customer_name"
                    placeholder="E.g. Jane Doe"
                    {...register("customer_name")}
                    className={errors.customer_name ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                  {errors.customer_name && (
                    <p className="text-xs font-semibold text-destructive">{errors.customer_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="E.g. +1 (555) 019-2834"
                    {...register("phone")}
                    className={errors.phone ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                  {errors.phone && (
                    <p className="text-xs font-semibold text-destructive">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="E.g. jane.doe@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Address</Label>
                <Input
                  id="address"
                  placeholder="E.g. 742 Evergreen Terrace, Springfield"
                  {...register("address")}
                  className={errors.address ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.address && (
                  <p className="text-xs font-semibold text-destructive">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Scheduling & Logistics</CardTitle>
              <CardDescription>Assign priority, timeframes, and active drivers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority Level</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Driver Assignment (Optional)</Label>
                  <Controller
                    name="driver_id"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                          {drivers.map((drv) => (
                            <SelectItem key={drv.id} value={drv.id}>
                              {drv.name} ({drv.vehicle_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="window_start" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Window Start</Label>
                  <Input
                    id="window_start"
                    placeholder="E.g. 09:00 AM"
                    {...register("window_start")}
                    className={errors.window_start ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                  {errors.window_start && (
                    <p className="text-xs font-semibold text-destructive">{errors.window_start.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="window_end" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Window End</Label>
                  <Input
                    id="window_end"
                    placeholder="E.g. 01:00 PM"
                    {...register("window_end")}
                    className={errors.window_end ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                  {errors.window_end && (
                    <p className="text-xs font-semibold text-destructive">{errors.window_end.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Special Instructions / Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Gate code, instructions for drop-off..."
                  {...register("notes")}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {editId && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Delivery Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Location Coordinates & Map Picker Card */}
        <div className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card/60 backdrop-blur-sm lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="size-5 text-primary" /> Geolocation Coordinates
              </CardTitle>
              <CardDescription>
                Point coordinates of destination on map.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-xs font-bold tracking-wide">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.000001"
                    value={watchLat}
                    onChange={(e) => setValue("latitude", parseFloat(e.target.value) || 0)}
                    className={errors.latitude ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-xs font-bold tracking-wide">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.000001"
                    value={watchLng}
                    onChange={(e) => setValue("longitude", parseFloat(e.target.value) || 0)}
                    className={errors.longitude ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                </div>
              </div>

              {/* Map coordinate picker */}
              <div className="w-full h-[220px] rounded-lg overflow-hidden border border-border mt-2">
                <DeliveryMap
                  latitude={watchLat}
                  longitude={watchLng}
                  onLocationSelect={(lat, lng) => {
                    setValue("latitude", lat)
                    setValue("longitude", lng)
                  }}
                />
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="size-4" /> {editId ? "Update Delivery" : "Create Delivery"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="w-full font-bold flex items-center justify-center gap-1.5 shadow-sm bg-background"
                >
                  <Save className="size-4" /> Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
        {/* Fallback button in case the primary submit button is hidden */}
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            onClick={() => {
              // Manually trigger form submission
              handleSubmit(onSubmit)();
            }}
            className="w-48 font-bold"
          >
            Create Delivery
          </Button>
        </div>
    </div>
  )
}
