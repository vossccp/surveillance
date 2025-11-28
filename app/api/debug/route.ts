import { NextResponse } from 'next/server'

export async function GET() {
  console.error('[Debug API] GET request received at:', new Date().toISOString())
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PERSON_FOLDER: process.env.PERSON_FOLDER,
      CWD: process.cwd(),
    },
    message: "Debug endpoint working"
  }
  
  console.error('[Debug API] Returning:', JSON.stringify(debugInfo))
  
  return NextResponse.json(debugInfo)
}