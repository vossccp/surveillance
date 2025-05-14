import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const router = useRouter();
  async function handleClick() {}

  return (
    <div>
      <Button type="button" onClick={handleClick}>
        Add
      </Button>
    </div>
  );
}
