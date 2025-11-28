import { getEventDays, type EventDay } from "@/lib/events";
import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { CalendarNavigation } from "@/components/calendar-navigation";

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Try multiple logging methods
  const timestamp = new Date().toISOString();
  console.log("[HomePage] Starting HomePage render at:", timestamp);
  console.error("[HomePage ERROR] Starting HomePage render at:", timestamp);
  process.stdout.write(`[STDOUT] HomePage render at ${timestamp}\n`);
  process.stderr.write(`[STDERR] HomePage render at ${timestamp}\n`);
  
  console.log("[HomePage] Environment:", process.env.NODE_ENV);
  console.log("[HomePage] PERSON_FOLDER env:", process.env.PERSON_FOLDER);

  let eventDays: EventDay[] = [];
  let error: string | null = null;

  try {
    console.log("[HomePage] About to call getEventDays...");
    eventDays = await getEventDays();
    console.log("[HomePage] getEventDays returned:", eventDays.length, "days");
  } catch (err: any) {
    console.log("[HomePage] ERROR caught:", err);
    console.log("[HomePage] Error stack:", err.stack);
    error = err.message || "Unknown error occurred";
  }

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
          {error && <p className="text-red-400 mt-2">Error: {error}</p>}
          
          {/* Debug info visible in UI */}
          <div className="mt-4 p-4 bg-gray-800 rounded text-xs text-gray-300">
            <p>Render time: {new Date().toISOString()}</p>
            <p>NODE_ENV: {process.env.NODE_ENV}</p>
            <p>PERSON_FOLDER: {process.env.PERSON_FOLDER || 'undefined'}</p>
            <p>Event count: {eventDays.length}</p>
            <p>Error: {error || 'none'}</p>
            <p>CWD: {process.cwd()}</p>
          </div>
        </div>

        {eventDays.length === 0 ? (
          <EmptyState />
        ) : (
          <CalendarNavigation eventDays={eventDays} />
        )}
      </main>
    </div>
  );
}
