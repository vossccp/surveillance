import * as fs from "node:fs";
import path from "node:path";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/$year/$month/$day/$filename")({
  GET: async ({ params }) => {
    const { filename, year, month, day } = params;

    let file: Buffer;
    try {
      file = await fs.promises.readFile(
        path.join(process.env.PERSON_FOLDER || "./", year, month, day, filename),
      );
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException;
      if (error && error.code === "ENOENT") {
        return new Response("File not found", { status: 404 });
      }
      throw err;
    }

    const extension = path.extname(filename).toLowerCase();

    return new Response(file, {
      headers: {
        "Content-Type": [".jpg", ".jpeg"].includes(extension)
          ? "image/jpeg"
          : "video/mp4",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  },
});
