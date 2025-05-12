import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

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
