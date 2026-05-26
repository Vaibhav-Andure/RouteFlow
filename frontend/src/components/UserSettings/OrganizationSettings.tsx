import { useState, useEffect } from "react"
import { Building, Save, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const STORAGE_KEY = "routeflow_settings_org"

export default function OrganizationSettings() {
  const [companyName, setCompanyName] = useState("RouteFlow Logistics Corp")
  const [logoUrl, setLogoUrl] = useState("https://routeflow.com/logo.png")
  const [address, setAddress] = useState("100 Broadway Ave, New York, NY 10005")
  const [timezone, setTimezone] = useState("America/New_York")

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      setCompanyName(data.companyName || "")
      setLogoUrl(data.logoUrl || "")
      setAddress(data.address || "")
      setTimezone(data.timezone || "")
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ companyName, logoUrl, address, timezone })
    )
    toast.success("Organization settings saved successfully!")
  }

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-sm shadow-sm animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Building className="size-5 text-primary" /> Organization Profile Settings
        </CardTitle>
        <CardDescription>Configure organizational credentials, global branding, and headquarter directories.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Legal Name</Label>
          <Input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="E.g. RouteFlow Inc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Brand Logo URL</Label>
          <Input
            id="logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="E.g. https://domain.com/brand_logo.png"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="org-address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corporate Headquarters Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="org-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full mailing address..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Global Operations Timezone</Label>
          <div className="relative">
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-full bg-background pl-3">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET) - America/New_York</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT) - America/Chicago</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT) - America/Denver</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT) - America/Los_Angeles</SelectItem>
                <SelectItem value="Europe/London">London (GMT) - Europe/London</SelectItem>
                <SelectItem value="Asia/Kolkata">India Standard Time (IST) - Asia/Kolkata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} className="font-bold flex items-center gap-1.5 shadow-sm">
            <Save className="size-4" /> Save Organization Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
