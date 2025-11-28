import { getEventDays } from "@/lib/events"
import { Header } from "@/components/header"
import { EmptyState } from "@/components/empty-state"
import { CalendarNavigation } from "@/components/calendar-navigation"

export default async function HomePage() {
  const eventDays = await getEventDays()

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Surveillance Events
          </h1>
          <p className="text-muted-foreground mt-2">
            {eventDays.length} days with recorded events
          </p>
        </div>

        {eventDays.length === 0 ? (
          <EmptyState />
        ) : (
          <CalendarNavigation eventDays={eventDays} />
        )}
      </main>
    </div>
  )
}