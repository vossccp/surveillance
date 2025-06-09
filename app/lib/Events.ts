import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import * as fs from "node:fs";
import path from "node:path";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface EventDay {
  date: string;
  eventCount: number;
  firstImage?: string;
  totalSizeMB?: number;
}

export interface SurveillanceEvent {
  cameraId: string;
  id: number;
  timestamp: Date;
  extension: string;
  filename: string;
  mp4s: string[];
  fileSize?: number;
  mp4Sizes?: number[];
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

async function loadEvents({
  year,
  month,
  day,
}: {
  year: string;
  month: string;
  day: string;
}): Promise<SurveillanceEvent[]> {
  const dir = path.join(process.env.PERSON_FOLDER || "./", year, month, day);
  if (!fs.existsSync(dir)) {
    return [];
  }
  const events: SurveillanceEvent[] = (await fs.promises.readdir(dir))
    .map((f) => parseImageFilename(f))
    .sort((a, b) =>
      a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0,
    );

  const result = events.filter((e) => e.extension === "jpg");
  for (let i = 0; i < result.length; i++) {
    const event = result[i];

    // Get file size for the JPG event
    const eventPath = path.join(dir, event.filename);
    try {
      const eventStats = await fs.promises.stat(eventPath);
      event.fileSize = eventStats.size;
    } catch (error) {
      event.fileSize = 0;
    }

    // Get associated MP4s and their sizes
    let mp4Events: SurveillanceEvent[];
    if (i === result.length - 1) {
      mp4Events = events.filter(
        (f) => f.extension === "mp4" && f.timestamp >= event.timestamp,
      );
    } else {
      const next = result[i + 1];
      mp4Events = events.filter(
        (f) =>
          f.extension === "mp4" &&
          f.timestamp >= event.timestamp &&
          f.timestamp <= next.timestamp,
      );
    }

    event.mp4s = mp4Events.map((f) => f.filename);
    event.mp4Sizes = [];

    for (const mp4Event of mp4Events) {
      const mp4Path = path.join(dir, mp4Event.filename);
      try {
        const mp4Stats = await fs.promises.stat(mp4Path);
        event.mp4Sizes.push(mp4Stats.size);
      } catch (error) {
        event.mp4Sizes.push(0);
      }
    }
  }
  return result;
}

export async function GetAll(): Promise<EventDay[]> {
  const root = process.env.PERSON_FOLDER || "./";
  const eventDayData: EventDay[] = [];

  const yearDirs = await fs.promises.readdir(root).catch(() => []);
  for (const year of yearDirs) {
    if (!/^\d{4}$/.test(year)) continue;
    const monthsPath = path.join(root, year);
    const monthDirs = await fs.promises.readdir(monthsPath).catch(() => []);
    for (const month of monthDirs) {
      if (!/^\d{2}$/.test(month)) continue;
      const daysPath = path.join(monthsPath, month);
      const dayDirs = await fs.promises.readdir(daysPath).catch(() => []);
      for (const day of dayDirs) {
        if (!/^\d{2}$/.test(day)) continue;
        const date = `${year}-${month}-${day}`;

        try {
          const events = await loadEvents({ year, month, day });
          const firstEvent = events[0];

          // Calculate total size including JPGs and MP4s
          let totalSize = 0;
          for (const event of events) {
            if (event.fileSize) totalSize += event.fileSize;
            if (event.mp4Sizes) {
              totalSize += event.mp4Sizes.reduce(
                (sum: number, size: number) => sum + size,
                0,
              );
            }
          }

          eventDayData.push({
            date,
            eventCount: events.length,
            firstImage: firstEvent
              ? `/api/files/${year}/${month}/${day}/${firstEvent.filename}`
              : undefined,
            totalSizeMB: totalSize / (1024 * 1024), // Convert bytes to MB
          });
        } catch (error) {
          eventDayData.push({
            date,
            eventCount: 0,
            totalSizeMB: 0,
          });
        }
      }
    }
  }

  // Sort by date descending (most recent first)
  eventDayData.sort((a, b) => b.date.localeCompare(a.date));
  return eventDayData;
}

export async function GetEventsForDay(date: string): Promise<SurveillanceEvent[]> {
  const [year, month, day] = date.split("-");
  return await loadEvents({ year, month, day });
}