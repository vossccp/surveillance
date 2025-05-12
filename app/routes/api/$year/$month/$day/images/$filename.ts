import * as fs from "node:fs";
import path from "node:path";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute(
  "/api/$year/$month/$day/images/$filename",
)({
  GET: async ({ params }) => {
    const { filename, year, month, day } = params;
    const file = await fs.promises.readFile(
      path.join(process.env.PERSON_FOLDER || "./", year, month, day, filename),
    );

    return new Response(file, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  },
});
