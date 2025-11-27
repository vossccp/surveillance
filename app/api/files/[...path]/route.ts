import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const PERSON_FOLDER = path.resolve(process.env.PERSON_FOLDER || "./surveillance")

// Log for debugging
console.log('[Files API] Using PERSON_FOLDER:', PERSON_FOLDER)

interface RouteParams {
  params: Promise<{ path: string[] }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { path: pathSegments } = await params
  
  if (!pathSegments || pathSegments.length < 4) {
    return NextResponse.json(
      { error: "Invalid file path" },
      { status: 400 }
    )
  }

  const [year, month, day, filename] = pathSegments
  const filePath = path.join(PERSON_FOLDER, year, month, day, filename)
  
  console.log('[Files API] Attempting to read file:', filePath)

  try {
    const file = await fs.readFile(filePath)
    console.log('[Files API] File read successfully:', filename)
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase()
    let contentType = "application/octet-stream"
    
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg"
    } else if (ext === ".mp4") {
      contentType = "video/mp4"
    } else if (ext === ".png") {
      contentType = "image/png"
    }

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error('[Files API] Error reading file:', filePath, error)
    return NextResponse.json(
      { error: "File not found", path: filePath },
      { status: 404 }
    )
  }
}