import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import * as fs from "node:fs";
import path from "node:path";

interface ParsedFilename {
  cameraId: string;
  id: number;
  timestamp: Date;
  extension: string;
  filename: string;
}

function parseFilename(filename: string): ParsedFilename {
  const match = filename.match(/^(.+?)_(\d{2})_(\d{14})\.(\w+)$/);
  if (!match) {
    throw new Error(`Filename "${filename}" does not match expected pattern`);
  }

  const [, cameraId, idStr, tsStr, extension] = match;
  const id = parseInt(idStr, 10);

  const timestamp = dayjs.tz(tsStr, "YYYYMMDDHHmmss", "Europe/Berlin").toDate();

  return { cameraId, id, timestamp, extension, filename };
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

  const files = await fs.promises.readdir(pathToImages);

  const result = files
    .filter((file) => file.endsWith(".jpg"))
    .map((file) => parseFilename(file));

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
  const imagefiles = Route.useLoaderData();
  const { year, month, day } = Route.useParams();

  return (
    <div className="flex flex-wrap gap-2 p-2">
      {imagefiles.map((file) => (
        <div key={file.filename} className="relative w-1/1 h-1/1">
          <img
            src={`/api/${year}/${month}/${day}/images/${file.filename}`}
            alt={file.filename}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 text-white p-2 bg-black/50">
            {dayjs(file.timestamp).format("DD.MM, HH:mm:ss")}
          </div>
        </div>
      ))}
    </div>
  );
}
