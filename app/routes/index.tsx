import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import * as fs from "node:fs";
import path from "node:path";

dayjs.extend(utc);
dayjs.extend(timezone);

async function getAvailableDates() {
  const root = process.env.PERSON_FOLDER || "./";
  const dates: string[] = [];

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
        dates.push(`${year}-${month}-${day}`);
      }
    }
  }

  return dates;
}

export const Route = createFileRoute("/")({
  loader: async () => {
    return getAvailableDates();
  },
  component: Home,
});

function Home() {
  const availableDates = Route.useLoaderData() as string[];
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const initialDate = availableDates[0]
    ? dayjs(availableDates[0]).toDate()
    : undefined;
  const [date, setDate] = useState<Date | undefined>(initialDate);

  const disabledDays = (d: Date) => {
    const key = dayjs(d).format("YYYY-MM-DD");
    return !availableSet.has(key);
  };

  const targetHref = date
    ? `/${dayjs(date).format("YYYY/MM/DD")}/detections`
    : "/";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card p-6 rounded-lg shadow max-w-fit">
        <h1 className="text-2xl font-bold text-center mb-4">Select a date</h1>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabledDays}
          className="max-w-md"
          classNames={{ day: "size-12 p-0 font-normal aria-selected:opacity-100" }}
        />
        <Button asChild className="w-full mt-4" disabled={!date}>
          <Link to={targetHref} reloadDocument>
            View Detections
          </Link>
        </Button>
      </div>
    </div>
  );
}
