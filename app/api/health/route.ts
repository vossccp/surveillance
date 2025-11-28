import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  const PERSON_FOLDER = path.resolve(process.env.PERSON_FOLDER || './surveillance')
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PERSON_FOLDER_ENV: process.env.PERSON_FOLDER,
      PERSON_FOLDER_RESOLVED: PERSON_FOLDER,
      CWD: process.cwd(),
    },
    checks: {
      personFolderExists: false,
      personFolderAccessible: false,
      personFolderStats: null as any,
      yearDirectories: [] as string[],
      errors: [] as string[]
    }
  }

  try {
    // Check if directory exists
    await fs.access(PERSON_FOLDER)
    health.checks.personFolderAccessible = true
    
    // Get directory stats
    const stats = await fs.stat(PERSON_FOLDER)
    health.checks.personFolderExists = stats.isDirectory()
    health.checks.personFolderStats = {
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      mode: stats.mode,
      uid: stats.uid,
      gid: stats.gid,
      size: stats.size
    }
    
    // Try to read directory contents
    if (stats.isDirectory()) {
      try {
        const files = await fs.readdir(PERSON_FOLDER)
        health.checks.yearDirectories = files
      } catch (error: any) {
        health.checks.errors.push(`Failed to read directory: ${error.message}`)
      }
    }
  } catch (error: any) {
    health.checks.errors.push(`Directory access failed: ${error.message}`)
    health.status = 'error'
  }

  return NextResponse.json(health, { 
    status: health.status === 'ok' ? 200 : 500 
  })
}