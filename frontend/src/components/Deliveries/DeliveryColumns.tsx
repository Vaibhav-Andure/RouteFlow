import type { ColumnDef } from "@tanstack/react-table"
import { Check, Copy } from "lucide-react"
import moment from "moment"

import type { DeliveryPublic } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

function CopyId({ id }: { id: string }) {
  const [copiedText, copy] = useCopyToClipboard()
  const isCopied = copiedText === id

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="font-mono text-xs text-muted-foreground">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copy(id)}
      >
        {isCopied ? (
          <Check className="size-3 text-green-500" />
        ) : (
          <Copy className="size-3" />
        )}
        <span className="sr-only">Copy ID</span>
      </Button>
    </div>
  )
}

export const DeliveryColumns: ColumnDef<DeliveryPublic>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <CopyId id={row.original.id} />,
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.customer_name}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default"
      switch (status) {
        case "PENDING":
          variant = "secondary"
          break
        case "IN_TRANSIT":
          variant = "default"
          break
        case "DELIVERED":
          variant = "default" // Could be 'success' if we add it
          break
        case "CANCELLED":
          variant = "destructive"
          break
      }
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "latitude",
    header: "Latitude",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.latitude}</span>
    ),
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.longitude}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = moment(row.original.created_at).format(
        "YYYY-MM-DD HH:mm",
      )
      return <span className="text-muted-foreground">{createdAt}</span>
    },
  },
]
