import { google } from "googleapis"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { summary, start, end } = await request.json()
    
    // Create a new OAuth2 client
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    })
    
    const calendar = google.calendar({ version: "v3", auth })
    
    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: { 
        summary, 
        start, 
        end 
      },
    })
    
    return NextResponse.json({ 
      message: "Evento agendado!",
      eventId: event.data.id 
    })
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json(
      { error: "Failed to schedule event" },
      { status: 500 }
    )
  }
}