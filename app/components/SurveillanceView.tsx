import { useState, useMemo } from "react";
import dayjs from "dayjs";

interface SurveillanceEvent {
  cameraId: string;
  id: number;
  timestamp: Date;
  extension: string;
  filename: string;
  mp4s: string[];
}

export function SurveillanceView({
  events,
  date,
}: {
  events: SurveillanceEvent[];
  date?: Date;
}) {
  const [selected, setSelected] = useState<SurveillanceEvent | null>(null);
  const { year, month, day } = useMemo(() => {
    if (!date) return { year: "", month: "", day: "" };
    const d = dayjs(date).tz("Europe/Berlin");
    return {
      year: d.format("YYYY"),
      month: d.format("MM"),
      day: d.format("DD"),
    };
  }, [date]);

  return (
    <div className="flex flex-wrap gap-2">
      {events.map((file) => {
        const imageUrl = `/api/files/${year}/${month}/${day}/${file.filename}`;
        return (
          <div key={file.filename} className="relative w-40 h-40">
            <img
              src={imageUrl}
              alt={file.filename}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelected(file)}
            />
            <div className="absolute bottom-0 left-0 text-white p-1 text-xs bg-black/50">
              {dayjs(file.timestamp).format("DD.MM, HH:mm:ss")}
            </div>
          </div>
        );
      })}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full p-4 bg-black rounded">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
            <video
              src={`/api/files/${year}/${month}/${day}/${selected.mp4s[0]}`}
              controls
              autoPlay
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}