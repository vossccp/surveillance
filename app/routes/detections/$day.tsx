import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import * as Events from "@/lib/Events";

function EventCard({ event, day }: { event: Events.SurveillanceEvent; day: string }) {
  const [year, month, dayStr] = day.split("-");
  
  return (
    <Card className="p-4 border-0">
      <div className="space-y-3">
        <div className="text-left">
          <h3 className="text-lg font-semibold">
            {dayjs(event.timestamp).format("HH:mm:ss")}
          </h3>
          <p className="text-sm text-muted-foreground">
            Camera: {event.cameraId}
            {event.fileSize && (
              <span> • {(event.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
            )}
            {event.mp4s.length > 0 && (
              <span> • {event.mp4s.length} video{event.mp4s.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        
        <div className="aspect-video overflow-hidden rounded-md">
          <img
            src={`/api/files/${year}/${month}/${dayStr}/${event.filename}`}
            alt={`Event at ${dayjs(event.timestamp).format("HH:mm:ss")}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {event.mp4s.length > 0 && (
          <div className="flex gap-2">
            {event.mp4s.map((mp4, index) => (
              <video
                key={mp4}
                src={`/api/files/${year}/${month}/${dayStr}/${mp4}`}
                controls
                className="w-32 h-20 object-cover rounded"
                preload="metadata"
                onPlay={(e) => {
                  const video = e.currentTarget;
                  if (video.requestFullscreen) {
                    video.requestFullscreen();
                  } else if ((video as any).webkitRequestFullscreen) {
                    (video as any).webkitRequestFullscreen();
                  } else if ((video as any).mozRequestFullScreen) {
                    (video as any).mozRequestFullScreen();
                  } else if ((video as any).msRequestFullscreen) {
                    (video as any).msRequestFullscreen();
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export const Route = createFileRoute("/detections/$day")({
  loader: async ({ params }) => {
    const events = await Events.GetEventsForDay(params.day);
    return { events, day: params.day };
  },
  component: DetectionsPage,
});

function DetectionsPage() {
  const { events, day } = Route.useLoaderData();
  
  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Detections for {dayjs(day).format("DD MMMM YYYY")}
        </h1>
        <p className="text-muted-foreground">
          {events.length} event{events.length !== 1 ? 's' : ''} detected
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard
            key={event.filename}
            event={event}
            day={day}
          />
        ))}
      </div>
    </div>
  );
}