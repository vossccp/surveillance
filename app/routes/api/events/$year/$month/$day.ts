import * as fs from 'node:fs'
import path from 'node:path'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { createAPIFileRoute } from '@tanstack/react-start/api'

dayjs.extend(utc)
dayjs.extend(timezone)

interface SurveillanceEvent {
  cameraId: string
  id: number
  timestamp: Date
  extension: string
  filename: string
  mp4s: string[]
}

function parseImageFilename(filename: string): SurveillanceEvent {
  const match = filename.match(/^(.+?)_(\d{2})_(\d{14})\.(\w+)$/)
  if (!match) {
    throw new Error(`Filename "${filename}" does not match expected pattern`)
  }
  const [, cameraId, idStr, tsStr, extension] = match
  const id = parseInt(idStr, 10)
  const timestamp = dayjs.tz(tsStr, 'YYYYMMDDHHmmss', 'Europe/Berlin').toDate()
  return { cameraId, id, timestamp, extension, filename, mp4s: [] }
}

async function loadEvents({ year, month, day }: { year: string; month: string; day: string }) {
  const dir = path.join(process.env.PERSON_FOLDER || './', year, month, day)
  if (!fs.existsSync(dir)) {
    return []
  }
  const events: SurveillanceEvent[] = (await fs.promises.readdir(dir))
    .map((f) => parseImageFilename(f))
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0))

  const result = events.filter((e) => e.extension === 'jpg')
  for (let i = 0; i < result.length; i++) {
    const event = result[i]
    if (i === result.length - 1) {
      event.mp4s = events.filter((f) => f.extension === 'mp4' && f.timestamp >= event.timestamp).map((f) => f.filename)
    } else {
      const next = result[i + 1]
      event.mp4s = events
        .filter((f) => f.extension === 'mp4' && f.timestamp >= event.timestamp && f.timestamp <= next.timestamp)
        .map((f) => f.filename)
    }
  }
  return result
}

export const APIRoute = createAPIFileRoute('/api/events/$year/$month/$day')({
  GET: async ({ params }) => {
    const { year, month, day } = params
    const events = await loadEvents({ year, month, day })
    return new Response(JSON.stringify(events), { headers: { 'Content-Type': 'application/json' } })
  },
})
