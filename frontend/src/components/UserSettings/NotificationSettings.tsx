import { useState, useEffect } from "react"
import { Bell, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const STORAGE_KEY = "routeflow_settings_notifications"

export default function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [routeCompletionAlerts, setRouteCompletionAlerts] = useState(true)
  const [failedDeliveryAlerts, setFailedDeliveryAlerts] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      setEmailAlerts(data.emailAlerts ?? true)
      setRouteCompletionAlerts(data.routeCompletionAlerts ?? true)
      setFailedDeliveryAlerts(data.failedDeliveryAlerts ?? true)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ emailAlerts, routeCompletionAlerts, failedDeliveryAlerts })
    )
    toast.success("Notification preferences saved successfully!")
  }

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-sm shadow-sm animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bell className="size-5 text-primary" /> Logistics Alerts & Notifications
        </CardTitle>
        <CardDescription>Configure instant email warnings and carrier status webhooks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-w-lg">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border border-border/60 bg-accent/20 p-4">
            <Checkbox
              id="email-alerts"
              checked={emailAlerts}
              onCheckedChange={(checked) => setEmailAlerts(!!checked)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="email-alerts" className="text-sm font-bold text-foreground cursor-pointer">
                Dispatch Summary Email Alerts
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive a daily briefing email containing fleet routing stats, fuel saves, and performance logs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-border/60 bg-accent/20 p-4">
            <Checkbox
              id="route-complete"
              checked={routeCompletionAlerts}
              onCheckedChange={(checked) => setRouteCompletionAlerts(!!checked)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="route-complete" className="text-sm font-bold text-foreground cursor-pointer">
                Carrier Route Completion Alerts
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notify the dispatch office immediately when a driver checks off their final stop.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border border-border/60 bg-accent/20 p-4">
            <Checkbox
              id="failed-delivery"
              checked={failedDeliveryAlerts}
              onCheckedChange={(checked) => setFailedDeliveryAlerts(!!checked)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="failed-delivery" className="text-sm font-bold text-foreground cursor-pointer">
                Failed/Cancelled Delivery Warnings
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Trigger a high-priority browser alert when a shipping ticket is marked as Cancelled.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} className="font-bold flex items-center gap-1.5 shadow-sm">
            <Save className="size-4" /> Save Notification Alert Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
