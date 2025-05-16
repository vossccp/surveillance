import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();

  async function handleClick() {
    navigate({
      to: `${dayjs(date).format("YYYY/MM/DD")}/detections`,
    });
  }

  return (
    <div>
      <Calendar mode="single" selected={date} onSelect={setDate} />
      <Button type="button" onClick={handleClick}>
        Goto Date
      </Button>
    </div>
  );
}
