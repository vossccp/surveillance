import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { useEffect, useMemo, useState } from 'react'
import * as fs from 'node:fs'
import path from 'node:path'

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

async function getAvailableDates() {
  const root = process.env.PERSON_FOLDER || './'
  const dates: string[] = []
  const yearDirs = await fs.promises.readdir(root).catch(() => [])
  for (const year of yearDirs) {
    if (!/^\d{4}$/.test(year)) continue
    const monthsPath = path.join(root, year)
    const monthDirs = await fs.promises.readdir(monthsPath).catch(() => [])
    for (const month of monthDirs) {
      if (!/^\d{2}$/.test(month)) continue
      const daysPath = path.join(monthsPath, month)
      const dayDirs = await fs.promises.readdir(daysPath).catch(() => [])
      for (const day of dayDirs) {
        if (!/^\d{2}$/.test(day)) continue
        dates.push(`${year}-${month}-${day}`)
      }
    }
  }
  return dates
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

export const Route = createFileRoute('/')({
  loader: async () => {
    const availableDates = await getAvailableDates()
    const today = dayjs().tz('Europe/Berlin').format('YYYY-MM-DD')
    const initial = availableDates.includes(today) ? today : availableDates[0]
    let events: SurveillanceEvent[] = []
    if (initial) {
      const [y, m, d] = initial.split('-')
      events = await loadEvents({ year: y, month: m, day: d })
    }
    return { availableDates, initialDate: initial, events }
  },
  component: Home,
})

function SurveillanceView({ events, date }: { events: SurveillanceEvent[]; date?: Date }) {
  const [selected, setSelected] = useState<SurveillanceEvent | null>(null)
  const { year, month, day } = useMemo(() => {
    if (!date) return { year: '', month: '', day: '' }
    const d = dayjs(date)
    return { year: d.format('YYYY'), month: d.format('MM'), day: d.format('DD') }
  }, [date])
  return (
    <div className="flex flex-wrap gap-2">
      {events.map((file) => {
        const imageUrl = `/api/${year}/${month}/${day}/${file.filename}`
        return (
          <div key={file.filename} className="relative w-40 h-40">
            <img
              src={imageUrl}
              alt={file.filename}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelected(file)}
            />
            <div className="absolute bottom-0 left-0 text-white p-1 text-xs bg-black/50">
              {dayjs(file.timestamp).format('DD.MM, HH:mm:ss')}
            </div>
          </div>
        )
      })}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full p-4 bg-black rounded">
            <button className="absolute top-2 right-2 text-white text-xl" onClick={() => setSelected(null)}>
              ✕
            </button>
            <video src={`/api/${year}/${month}/${day}/${selected.mp4s[0]}`} controls autoPlay className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  )
}

function AllEventsView({ dates, onDelete }: { dates: string[]; onDelete: (d: string) => void }) {
  return (
    <ul className="space-y-2">
      {dates.map((d) => (
        <li key={d} className="flex justify-between items-center border-b pb-1">
          <span>{d}</span>
          <Button size="sm" variant="destructive" onClick={() => onDelete(d)}>
            Delete
          </Button>
        </li>
      ))}
    </ul>
  )
}

function Home() {
  const data = Route.useLoaderData() as {
    availableDates: string[]
    initialDate?: string
    events: SurveillanceEvent[]
  }
  const [availableDates, setAvailableDates] = useState(data.availableDates)
  const availableSet = useMemo(() => new Set(availableDates), [availableDates])
  const [tab, setTab] = useState<'surveillance' | 'all'>('surveillance')
  const [date, setDate] = useState<Date | undefined>(data.initialDate ? dayjs(data.initialDate).toDate() : undefined)
  const [events, setEvents] = useState<SurveillanceEvent[]>(data.events)

  useEffect(() => {
    if (!date) return
    const key = dayjs(date).format('YYYY-MM-DD')
    if (!availableSet.has(key)) {
      setEvents([])
      return
    }
    const [y, m, d] = key.split('-')
    fetch(`/api/events/${y}/${m}/${d}`)
      .then((r) => r.json())
      .then((ev) => setEvents(ev))
  }, [date, availableSet])

  const disabledDays = (d: Date) => !availableSet.has(dayjs(d).format('YYYY-MM-DD'))

  const handleDelete = async (dStr: string) => {
    const [y, m, d] = dStr.split('-')
    await fetch(`/api/${y}/${m}/${d}`, { method: 'DELETE' })
    setAvailableDates((prev) => prev.filter((p) => p !== dStr))
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r p-4 bg-sidebar text-sidebar-foreground">
        <div className="flex flex-col gap-2">
          <Button variant={tab === 'surveillance' ? 'secondary' : 'ghost'} onClick={() => setTab('surveillance')}>
            Surveillance
          </Button>
          <Button variant={tab === 'all' ? 'secondary' : 'ghost'} onClick={() => setTab('all')}>
            All Events
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex">
        <main className="flex-1 p-4 overflow-y-auto">
          {tab === 'surveillance' ? (
            <SurveillanceView events={events} date={date} />
          ) : (
            <AllEventsView dates={availableDates} onDelete={handleDelete} />
          )}
        </main>
        {tab === 'surveillance' && (
          <div className="w-80 border-l p-4">
            <Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledDays} />
          </div>
        )}
      </div>
    </div>
  )
}
