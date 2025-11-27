import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { promises as fs } from 'fs'
import path from 'path'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface SurveillanceFile {
  cameraId: string
  id: string
  timestamp: string
  extension: string
  filename: string
  fullPath: string
  size?: number
}

export interface SurveillanceEvent extends SurveillanceFile {
  mp4Files: SurveillanceFile[]
}

export interface EventDay {
  date: string
  year: string
  month: string
  day: string
  eventCount: number
  totalSize: number
  firstEvent?: SurveillanceEvent
  lastEvent?: SurveillanceEvent
}

const PERSON_FOLDER = process.env.PERSON_FOLDER || './surveillance'
const TZ = 'Europe/Berlin'

export function parseFilename(filename: string): SurveillanceFile | null {
  const match = filename.match(/^(.+?)_(\d+)_(\d{14})\.(.+)$/)
  if (!match) return null
  
  const [, cameraId, id, timestamp, extension] = match
  const year = timestamp.substring(0, 4)
  const month = timestamp.substring(4, 6)
  const day = timestamp.substring(6, 8)
  const hour = timestamp.substring(8, 10)
  const minute = timestamp.substring(10, 12)
  const second = timestamp.substring(12, 14)
  
  const dateStr = `${year}-${month}-${day} ${hour}:${minute}:${second}`
  const date = dayjs.tz(dateStr, TZ)
  
  return {
    cameraId,
    id,
    timestamp: date.toISOString(),
    extension,
    filename,
    fullPath: ''
  }
}

export async function loadEvents(date: string): Promise<SurveillanceEvent[]> {
  const d = dayjs(date).tz(TZ)
  const year = d.format('YYYY')
  const month = d.format('MM')
  const day = d.format('DD')
  
  const dir = path.join(PERSON_FOLDER, year, month, day)
  
  try {
    const files = await fs.readdir(dir)
    const parsedFiles: SurveillanceFile[] = []
    
    for (const file of files) {
      const parsed = parseFilename(file)
      if (parsed) {
        const fullPath = path.join(dir, file)
        const stats = await fs.stat(fullPath)
        parsed.fullPath = fullPath
        parsed.size = stats.size
        parsedFiles.push(parsed)
      }
    }
    
    // Separate JPG and MP4 files
    const jpgFiles = parsedFiles.filter(f => f.extension.toLowerCase() === 'jpg')
    const mp4Files = parsedFiles.filter(f => f.extension.toLowerCase() === 'mp4')
    
    // Sort by timestamp
    jpgFiles.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    mp4Files.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    
    // Associate MP4 files with JPG events
    const events: SurveillanceEvent[] = jpgFiles.map((jpg, index) => {
      const nextJpg = jpgFiles[index + 1]
      const associatedMp4s = mp4Files.filter(mp4 => {
        const mp4Time = dayjs(mp4.timestamp)
        const jpgTime = dayjs(jpg.timestamp)
        
        if (nextJpg) {
          const nextTime = dayjs(nextJpg.timestamp)
          return mp4Time.isAfter(jpgTime) && mp4Time.isBefore(nextTime)
        } else {
          return mp4Time.isAfter(jpgTime)
        }
      })
      
      return {
        ...jpg,
        mp4Files: associatedMp4s
      }
    })
    
    return events
  } catch (error) {
    console.error('Error loading events:', error)
    return []
  }
}

export async function getEventDays(): Promise<EventDay[]> {
  try {
    const years = await fs.readdir(PERSON_FOLDER)
    const eventDays: EventDay[] = []
    
    for (const year of years) {
      const yearPath = path.join(PERSON_FOLDER, year)
      const stats = await fs.stat(yearPath)
      if (!stats.isDirectory()) continue
      
      const months = await fs.readdir(yearPath)
      
      for (const month of months) {
        const monthPath = path.join(yearPath, month)
        const monthStats = await fs.stat(monthPath)
        if (!monthStats.isDirectory()) continue
        
        const days = await fs.readdir(monthPath)
        
        for (const day of days) {
          const dayPath = path.join(monthPath, day)
          const dayStats = await fs.stat(dayPath)
          if (!dayStats.isDirectory()) continue
          
          const dateStr = `${year}-${month}-${day}`
          const events = await loadEvents(dateStr)
          
          if (events.length > 0) {
            const totalSize = events.reduce((sum, event) => {
              const eventSize = event.size || 0
              const mp4Size = event.mp4Files.reduce((s, f) => s + (f.size || 0), 0)
              return sum + eventSize + mp4Size
            }, 0)
            
            eventDays.push({
              date: dateStr,
              year,
              month,
              day,
              eventCount: events.length,
              totalSize,
              firstEvent: events[0],
              lastEvent: events[events.length - 1]
            })
          }
        }
      }
    }
    
    // Sort by date descending (newest first)
    eventDays.sort((a, b) => b.date.localeCompare(a.date))
    
    return eventDays
  } catch (error) {
    console.error('Error getting event days:', error)
    return []
  }
}

export async function deleteEventDay(date: string): Promise<boolean> {
  const d = dayjs(date).tz(TZ)
  const year = d.format('YYYY')
  const month = d.format('MM')
  const day = d.format('DD')
  
  const dir = path.join(PERSON_FOLDER, year, month, day)
  
  try {
    await fs.rm(dir, { recursive: true, force: true })
    return true
  } catch (error) {
    console.error('Error deleting event day:', error)
    return false
  }
}