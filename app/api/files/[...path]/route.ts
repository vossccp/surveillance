import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const PERSON_FOLDER = process.env.PERSON_FOLDER || "./surveillance"

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

  try {
    const file = await fs.readFile(filePath)
    
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
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    )
  }
}