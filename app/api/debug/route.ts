import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET(request: NextRequest) {
  const PERSON_FOLDER = path.resolve(process.env.PERSON_FOLDER || "./surveillance")
  
  const debug = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PERSON_FOLDER_ENV: process.env.PERSON_FOLDER,
      PERSON_FOLDER_RESOLVED: PERSON_FOLDER,
      CWD: process.cwd(),
    },
    checks: {
      folderExists: false,
      folderIsReadable: false,
      folderContents: [] as string[],
      sampleStructure: {} as any,
    },
    errors: [] as string[],
  }

  try {
    // Check if folder exists
    await fs.access(PERSON_FOLDER)
    debug.checks.folderExists = true

    // Check if folder is readable
    await fs.access(PERSON_FOLDER, fs.constants.R_OK)
    debug.checks.folderIsReadable = true

    // List folder contents
    const contents = await fs.readdir(PERSON_FOLDER)
    debug.checks.folderContents = contents

    // Try to explore the structure
    if (contents.length > 0) {
      const firstItem = contents[0]
      const firstPath = path.join(PERSON_FOLDER, firstItem)
      const stats = await fs.stat(firstPath)
      
      if (stats.isDirectory()) {
        const firstDirContents = await fs.readdir(firstPath)
        debug.checks.sampleStructure = {
          [firstItem]: firstDirContents.slice(0, 5) // Show first 5 items
        }

        // Try to go deeper if it's a year folder
        if (firstDirContents.length > 0) {
          const monthPath = path.join(firstPath, firstDirContents[0])
          try {
            const monthStats = await fs.stat(monthPath)
            if (monthStats.isDirectory()) {
              const monthContents = await fs.readdir(monthPath)
              debug.checks.sampleStructure[firstItem] = {
                [firstDirContents[0]]: monthContents.slice(0, 5)
              }
            }
          } catch (e) {
            // Ignore errors for deeper exploration
          }
        }
      }
    }
  } catch (error: any) {
    debug.errors.push(`Error accessing ${PERSON_FOLDER}: ${error.message}`)
    
    // Try to check parent directory
    try {
      const parentDir = path.dirname(PERSON_FOLDER)
      const parentContents = await fs.readdir(parentDir)
      debug.errors.push(`Parent directory contents: ${parentContents.slice(0, 10).join(", ")}`)
    } catch (e) {
      debug.errors.push(`Cannot read parent directory`)
    }
  }

  // Try with some common paths
  const commonPaths = [
    "/surveillance",
    "/app/surveillance",
    "./surveillance",
    "../surveillance",
    "/var/surveillance",
    "/data/surveillance",
  ]

  for (const testPath of commonPaths) {
    try {
      const resolvedPath = path.resolve(testPath)
      await fs.access(resolvedPath)
      debug.errors.push(`Found accessible path: ${testPath} -> ${resolvedPath}`)
    } catch (e) {
      // Path not accessible
    }
  }

  return NextResponse.json(debug, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}