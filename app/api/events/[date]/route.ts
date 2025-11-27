import { NextRequest, NextResponse } from "next/server"
import { loadEvents, deleteEventDay } from "@/lib/events"

interface RouteParams {
  params: Promise<{ date: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { date } = await params
  
  try {
    const events = await loadEvents(date)
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { date } = await params
  
  try {
    const success = await deleteEventDay(date)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: "Failed to delete event day" },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete event day" },
      { status: 500 }
    )
  }
}