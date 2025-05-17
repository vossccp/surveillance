import * as fs from "node:fs";
import path from "node:path";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/$year/$month/$day/$filename")({
  GET: async ({ params }) => {
    const { filename, year, month, day } = params;

    const file = await fs.promises.readFile(
      path.join(process.env.PERSON_FOLDER || "./", year, month, day, filename),
    );

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    const extension = path.extname(filename);

    return new Response(file, {
      headers: {
        "Content-Type": extension === ".jpg" ? "image/jpeg" : "video/mp4",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  },
});
