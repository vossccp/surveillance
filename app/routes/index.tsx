import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import { useState } from "react";
import * as Events from "@/lib/Events";


function SurveillanceEventDay({
  eventDay,
  onView,
  onDelete,
}: {
  eventDay: Events.EventDay;
  onView: (date: string) => void;
  onDelete: (date: string) => void;
}) {
  return (
    <Card className="p-4 border-0">
      <div className="space-y-3">
        <div className="text-left">
          <h3 className="text-lg font-semibold">
            {dayjs(eventDay.date).format("DD MMMM YYYY")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {eventDay.eventCount} event{eventDay.eventCount !== 1 ? "s" : ""}
            {eventDay.totalSizeMB !== undefined && (
              <span> • {eventDay.totalSizeMB.toFixed(1)} MB</span>
            )}
          </p>
        </div>

        {eventDay.firstImage && (
          <div className="aspect-video overflow-hidden rounded-md">
            <img
              src={eventDay.firstImage}
              alt={`First event from ${eventDay.date}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(eventDay.date)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(eventDay.date)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}


export const Route = createFileRoute("/")({
  loader: async () => {
    const eventDays = await Events.GetAll();
    return { eventDays };
  },
  component: Home,
});

function Home() {
  const data = Route.useLoaderData() as {
    eventDays: Events.EventDay[];
  };

  const [eventDays, setEventDays] = useState<Events.EventDay[]>(data.eventDays);

  const handleDelete = async (dStr: string) => {
    const [y, m, d] = dStr.split("-");
    await fetch(`/api/files/${y}/${m}/${d}`, { method: "DELETE" });
    setEventDays((prev) => prev.filter((p) => p.date !== dStr));
  };

  const handleView = (dStr: string) => {
    // Navigate to specific day view - placeholder for future implementation
    console.log(`View events for ${dStr}`);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventDays.map((eventDay) => (
          <SurveillanceEventDay
            key={eventDay.date}
            eventDay={eventDay}
            onView={handleView}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
