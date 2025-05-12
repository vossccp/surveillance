import * as fs from "node:fs";
import { createFileRoute } from "@tanstack/react-router";
import path from "node:path";
import { Card, CardContent } from "@/components/ui/card";

const folderPath = "./surveillance";

interface ParsedFilename {
  cameraId: string;
  id: number;
  timestamp: Date;
  extension: string;
  filename: string;
}

function parseFilename(filename: string): ParsedFilename {
  // Regex breakdown:
  //   ^(.+?)       → capture cameraId (non-greedy up to first underscore)
  //   _(\d{2})     → underscore + two-digit id
  //   _(\d{14})    → underscore + 14-digit timestamp (YYYYMMDDHHMMSS)
  //   \.(\w+)$     → dot + extension (letters/numbers/underscores) at end
  const match = filename.match(/^(.+?)_(\d{2})_(\d{14})\.(\w+)$/);
  if (!match) {
    throw new Error(`Filename "${filename}" does not match expected pattern`);
  }

  const [, cameraId, idStr, tsStr, extension] = match;
  const id = parseInt(idStr, 10);

  // Parse timestamp "YYYYMMDDHHMMSS"
  const year = +tsStr.slice(0, 4);
  const month = +tsStr.slice(4, 6) - 1; // JS months are 0-based
  const day = +tsStr.slice(6, 8);
  const hour = +tsStr.slice(8, 10);
  const minute = +tsStr.slice(10, 12);
  const second = +tsStr.slice(12, 14);

  const timestamp = new Date(year, month, day, hour, minute, second);

  return { cameraId, id, timestamp, extension, filename };
}

export const Route = createFileRoute("/$year/$month/$day/detections")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { year, month, day } = params;

    const files = await fs.promises.readdir(
      path.join(folderPath, year, month, day),
    );

    return files.map((file) => parseFilename(file));
  },
});

function RouteComponent() {
  const imagefiles = Route.useLoaderData();
  const { year, month, day } = Route.useParams();

  console.log(imagefiles);
  return (
    <div className={`flex flex-wrap gap-2`}>
      {imagefiles
        .filter((f) => f.filename.endsWith(".jpg"))
        .map((file) => (
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
