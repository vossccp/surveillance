import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

dayjs.extend(utc);
dayjs.extend(timezone);

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const targetHref = `/${dayjs(date).format("YYYY/MM/DD")}/detections`;

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen p-4">
      <div className="w-full h-full max-w-screen-md flex items-center justify-center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="w-full h-full"
        />
      </div>
      <Button asChild className="mt-4">
        <Link to={targetHref} reloadDocument>
          Goto Date
        </Link>
      </Button>
    </div>
  );
}
