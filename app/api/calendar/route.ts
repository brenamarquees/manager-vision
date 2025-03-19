import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { summary, start, end } = await request.json();

    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error("GOOGLE_CREDENTIALS não está configurado no .env");
    }

    console.log("Valor bruto de GOOGLE_CREDENTIALS:", process.env.GOOGLE_CREDENTIALS); // Log temporário

    let credentials;
    try {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } catch (parseError) {
      console.error("Erro ao fazer parse de GOOGLE_CREDENTIALS:", parseError);
      throw new Error("GOOGLE_CREDENTIALS não é um JSON válido");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const event = await calendar.events.insert({
      calendarId: "primary",
      requestBody: { 
        summary, 
        start, 
        end 
      },
    });

    return NextResponse.json({ 
      message: "Evento agendado!",
      eventId: event.data.id 
    });
  } catch (error: unknown) {
    console.error("Calendar API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: errorMessage || "Failed to schedule event" },
      { status: 500 }
    );
  }
}