import * as fs from "node:fs";
import { createFileRoute } from "@tanstack/react-router";
import path from "node:path";
import { Card, CardContent } from "@/components/ui/card";
import dayjs from "dayjs";

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

export const Route = createFileRoute("/$year/$month/$day/detections")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { year, month, day } = params;

    const files = await fs.promises.readdir(
      path.join(process.env.PERSON_FOLDER || "./", year, month, day),
    );

    const result = files
      .filter((file) => file.endsWith(".jpg"))
      .map((file) => parseFilename(file));

    return result;
  },
});

function RouteComponent() {
  const imagefiles = Route.useLoaderData();
  const { year, month, day } = Route.useParams();

  return (
    <div className={`flex flex-wrap gap-2`}>
      {imagefiles.map((file) => (
        <Card key={file.filename} className="overflow-hidden">
          <CardContent className="p-0 relative">
            <img
              src={`/api/${year}/${month}/${day}/images/${file.filename}`}
              alt={file.filename}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 text-white p-2">
              {file.timestamp.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
