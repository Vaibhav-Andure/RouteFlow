import { useState, useEffect } from "react"
import { Zap, Save, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const STORAGE_KEY = "routeflow_settings_optimization"

export default function OptimizationSettings() {
  const [maxDuration, setMaxDuration] = useState(8)
  const [avgSpeed, setAvgSpeed] = useState(45)
  const [serviceTime, setServiceTime] = useState(10)
  const [defaultCapacity, setDefaultCapacity] = useState(100)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      setMaxDuration(data.maxDuration || 8)
      setAvgSpeed(data.avgSpeed || 45)
      setServiceTime(data.serviceTime || 10)
      setDefaultCapacity(data.defaultCapacity || 100)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ maxDuration, avgSpeed, serviceTime, defaultCapacity })
    )
    toast.success("Optimization settings saved successfully!")
  }

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-sm shadow-sm animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Zap className="size-5 text-primary" /> Routing Optimization Parameters
        </CardTitle>
        <CardDescription>
          Adjust global vehicle speed standards, maximum labor durations, and stop service overheads.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="max-duration" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Clock className="size-3.5" /> Max Route Duration per Driver (Hours)
          </Label>
          <Input
            id="max-duration"
            type="number"
            value={maxDuration}
            onChange={(e) => setMaxDuration(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avg-speed" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Average Courier Speed Limit (km/h)
          </Label>
          <Input
            id="avg-speed"
            type="number"
            value={avgSpeed}
            onChange={(e) => setAvgSpeed(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="service-time" className="To text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Mean Stop Hand-off Service Time (Minutes)
          </Label>
          <Input
            id="service-time"
            type="number"
            value={serviceTime}
            onChange={(e) => setServiceTime(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="def-capacity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Default Vehicle Payload Capacity Weight (kg)
          </Label>
          <Input
            id="def-capacity"
            type="number"
            value={defaultCapacity}
            onChange={(e) => setDefaultCapacity(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} className="font-bold flex items-center gap-1.5 shadow-sm">
            <Save className="size-4" /> Save Optimization Config
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
