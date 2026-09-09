import { PortalRooms } from "@/components/portal-rooms"
import { Suspense } from "react"

export default function OwnerRoomsPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading...</main>}><PortalRooms /></Suspense>
}
