import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Limite de requisições excedido, tente novamente mais tarde" },
        { status: 429 }
      );
    }

    if (!response.ok) {
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      reply: data.candidates[0].content.parts[0].text,
    });
  } catch (error: unknown) { // Alterado de 'Error' para 'unknown'
    console.error("Erro na API de IA:", error);
    // Verifica se o erro é uma instância de Error para acessar .message
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: errorMessage || "Falha ao obter resposta da IA" },
      { status: 500 }
    );
  }
}