import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    
    const response = await fetch("https://api.xai.com/llm", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.AI_API_TOKEN}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ prompt: message }),
    })
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({ 
      reply: data.response 
    })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    )
  }
}