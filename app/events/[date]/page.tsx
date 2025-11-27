import { loadEvents } from "@/lib/events"
import { Header } from "@/components/header"
import { SurveillanceView } from "@/components/surveillance-view"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"

interface EventsPageProps {
  params: Promise<{ date: string }>
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { date } = await params
  const events = await loadEvents(date)

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 fade-in">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20">
              <Calendar className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                {formatDate(date)}
              </h1>
              <p className="text-muted-foreground mt-1">
                {events.length} events captured
              </p>
            </div>
          </div>
        </div>

        <SurveillanceView events={events} date={date} />
      </main>
    </div>
  )
}