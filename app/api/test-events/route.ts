import { NextRequest, NextResponse } from "next/server"
import { getEventDays } from "@/lib/events"

export async function GET(request: NextRequest) {
  console.log('[Test] Starting event loading test...')
  
  try {
    const eventDays = await getEventDays()
    
    console.log('[Test] Event loading completed. Found:', eventDays.length, 'event days')
    
    return NextResponse.json({
      success: true,
      eventDaysCount: eventDays.length,
      eventDays: eventDays,
      message: 'Check server logs for detailed scanning information'
    })
  } catch (error) {
    console.error('[Test] Error during event loading test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Check server logs for error details'
    }, { status: 500 })
  }
}