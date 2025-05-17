import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import * as fs from "node:fs";
import path from "node:path";
import React from "react";

interface SurveillanceEvent {
  cameraId: string;
  id: number;
  timestamp: Date;
  extension: string;
  filename: string;
  mp4s: string[];
}

function parseImageFilename(filename: string): SurveillanceEvent {
  const match = filename.match(/^(.+?)_(\d{2})_(\d{14})\.(\w+)$/);
  if (!match) {
    throw new Error(`Filename "${filename}" does not match expected pattern`);
  }

  const [, cameraId, idStr, tsStr, extension] = match;
  const id = parseInt(idStr, 10);

  const timestamp = dayjs.tz(tsStr, "YYYYMMDDHHmmss", "Europe/Berlin").toDate();

  return { cameraId, id, timestamp, extension, filename, mp4s: [] };
}

async function detectionsLoader({
  year,
  month,
  day,
}: {
  year: string;
  month: string;
  day: string;
}) {
  const pathToImages = path.join(
    process.env.PERSON_FOLDER || "./",
    year,
    month,
    day,
  );

  if (!fs.existsSync(pathToImages)) {
    return [];
  }

  const events: SurveillanceEvent[] = (await fs.promises.readdir(pathToImages))
    .map((file) => parseImageFilename(file))
    .sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    });

  const result = events.filter((file) => file.extension === "jpg");

  for (var i = 0; i < result.length; i++) {
    const event = result[i];

    if (i === result.length - 1) {
      event.mp4s = events
        .filter((file) => file.extension === "mp4")
        .filter((file) => file.timestamp >= event.timestamp)
        .map((file) => file.filename);
    } else {
      const nextEvent = result[i + 1];

      event.mp4s = events
        .filter((file) => file.extension === "mp4")
        .filter(
          (file) =>
            file.timestamp >= event.timestamp &&
            file.timestamp <= nextEvent.timestamp,
        )
        .map((file) => file.filename);
    }
  }

  return result;
}

export const Route = createFileRoute("/$year/$month/$day/detections")({
  loader: async ({ params }) => {
    const { year, month, day } = params;
    return detectionsLoader({ year, month, day });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const events = Route.useLoaderData();
  const { year, month, day } = Route.useParams();

  const [selectedEvent, setSelectedEvent] =
    React.useState<SurveillanceEvent | null>(null);

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {events.map((file) => {
        const imageUrl = `/api/${year}/${month}/${day}/${file.filename}`;
        return (
          <div key={file.filename} className="relative w-1/1 h-1/1">
            <img
              src={imageUrl}
              alt={file.filename}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelectedEvent(file)}
            />
            <div className="absolute bottom-0 left-0 text-white p-2 bg-black/50">
              {dayjs(file.timestamp).format("DD.MM, HH:mm:ss")}
            </div>
          </div>
        );
      })}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full p-4 bg-black rounded">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setSelectedEvent(null)}
            >
              ✕
            </button>
            <video
              src={`/api/${year}/${month}/${day}/${selectedEvent.mp4s[0]}`}
              controls
              autoPlay
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
