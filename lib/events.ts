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

// Resolve to absolute path to ensure consistency
const PERSON_FOLDER = path.resolve(process.env.PERSON_FOLDER || './surveillance')

// Log configuration on startup
if (process.env.NODE_ENV !== 'test') {
  console.log('[Events] Using PERSON_FOLDER:', PERSON_FOLDER)
  console.log('[Events] Path exists:', require('fs').existsSync(PERSON_FOLDER))
}
const TZ = 'Europe/Berlin'

export function parseFilename(filename: string): SurveillanceFile | null {
  console.log('[Events] Parsing filename:', filename)
  const match = filename.match(/^(.+?)_(\d+)_(\d{14})\.(.+)$/)
  if (!match) {
    console.log('[Events] Filename does not match pattern:', filename)
    return null
  }
  console.log('[Events] Filename matched pattern:', match)
  
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
    console.log('[Events] Loading events from:', dir)
    const files = await fs.readdir(dir)
    console.log('[Events] Found files:', files.length)
    const parsedFiles: SurveillanceFile[] = []
    
    console.log('[Events] Processing files:', files)
    for (const file of files) {
      console.log('[Events] Processing file:', file)
      const parsed = parseFilename(file)
      if (parsed) {
        console.log('[Events] File parsed successfully:', file, 'as', parsed)
        const fullPath = path.join(dir, file)
        const stats = await fs.stat(fullPath)
        parsed.fullPath = fullPath
        parsed.size = stats.size
        parsedFiles.push(parsed)
      } else {
        console.log('[Events] File skipped (no match):', file)
      }
    }
    console.log('[Events] Total parsed files:', parsedFiles.length)
    
    // Separate JPG and MP4 files
    const jpgFiles = parsedFiles.filter(f => f.extension.toLowerCase() === 'jpg')
    const mp4Files = parsedFiles.filter(f => f.extension.toLowerCase() === 'mp4')
    
    console.log('[Events] JPG files found:', jpgFiles.length)
    console.log('[Events] MP4 files found:', mp4Files.length)
    
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
    console.error('[Events] Error loading events from:', dir, error)
    if (error instanceof Error) {
      console.error('[Events] Stack trace:', error.stack)
    }
    return []
  }
}

export async function getEventDays(): Promise<EventDay[]> {
  try {
    console.log('[Events] getEventDays called')
    console.log('[Events] PERSON_FOLDER env:', process.env.PERSON_FOLDER)
    console.log('[Events] Resolved PERSON_FOLDER:', PERSON_FOLDER)
    console.log('[Events] Current working directory:', process.cwd())
    console.log('[Events] NODE_ENV:', process.env.NODE_ENV)
    
    // Check if directory exists
    try {
      await fs.access(PERSON_FOLDER)
      console.log('[Events] Directory exists and is accessible:', PERSON_FOLDER)
    } catch (error) {
      console.error('[Events] Directory access error:', error)
      console.error('[Events] Directory does not exist or is not accessible:', PERSON_FOLDER)
      console.error('[Events] Error details:', JSON.stringify(error, null, 2))
      return []
    }
    
    const years = await fs.readdir(PERSON_FOLDER)
    console.log('[Events] Found year directories:', years)
    const eventDays: EventDay[] = []
    
    for (const year of years) {
      console.log('[Events] Processing year:', year)
      const yearPath = path.join(PERSON_FOLDER, year)
      let stats
      try {
        stats = await fs.stat(yearPath)
      } catch (error) {
        console.log('[Events] Error accessing year path:', yearPath, error)
        continue
      }
      
      if (!stats.isDirectory()) {
        console.log('[Events] Skipping non-directory year entry:', year)
        continue
      }
      
      const months = await fs.readdir(yearPath)
      console.log('[Events] Found months in year', year, ':', months)
      
      for (const month of months) {
        console.log('[Events] Processing month:', month)
        const monthPath = path.join(yearPath, month)
        let monthStats
        try {
          monthStats = await fs.stat(monthPath)
        } catch (error) {
          console.log('[Events] Error accessing month path:', monthPath, error)
          continue
        }
        
        if (!monthStats.isDirectory()) {
          console.log('[Events] Skipping non-directory month entry:', month)
          continue
        }
        
        const days = await fs.readdir(monthPath)
        console.log('[Events] Found days in month', month, ':', days)
        
        for (const day of days) {
          console.log('[Events] Processing day:', day)
          const dayPath = path.join(monthPath, day)
          let dayStats
          try {
            dayStats = await fs.stat(dayPath)
          } catch (error) {
            console.log('[Events] Error accessing day path:', dayPath, error)
            continue
          }
          
          if (!dayStats.isDirectory()) {
            console.log('[Events] Skipping non-directory day entry:', day)
            continue
          }
          
          const dateStr = `${year}-${month}-${day}`
          console.log('[Events] Loading events for date:', dateStr)
          const events = await loadEvents(dateStr)
          console.log('[Events] Loaded', events.length, 'events for', dateStr)
          
          if (events.length > 0) {
            console.log('[Events] Adding event day for:', dateStr, 'with', events.length, 'events')
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
            console.log('[Events] Event day added successfully for:', dateStr)
          } else {
            console.log('[Events] No events found for date:', dateStr, '- skipping')
          }
        }
      }
    }
    
    // Sort by date descending (newest first)
    eventDays.sort((a, b) => b.date.localeCompare(a.date))
    
    console.log('[Events] Total event days found:', eventDays.length)
    return eventDays
  } catch (error) {
    console.error('[Events] Error getting event days:', error)
    if (error instanceof Error) {
      console.error('[Events] Stack trace:', error.stack)
    }
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