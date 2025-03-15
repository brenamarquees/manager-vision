"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"

// Tipo para as mensagens do chat
type Message = {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

// Tipo para eventos do Google Agenda
type CalendarEvent = {
  summary: string
  description?: string
  start: { dateTime: string }
  end: { dateTime: string }
}

export function ExecutiveAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Função para enviar mensagem à API da LLM
  const sendMessageToLLM = async (message: string) => {
    try {
      setIsLoading(true)
      // Substitua pela URL da sua API de LLM (ex.: xAI ou outra)
      const response = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) throw new Error("Failed to fetch LLM response")
      const data = await response.json()
      return data.reply // Ajuste conforme a estrutura da resposta da API
    } catch (error) {
      console.error("Error fetching LLM response:", error)
      return "Desculpe, ocorreu um erro ao processar sua mensagem."
    } finally {
      setIsLoading(false)
    }
  }

  // Função para agendar evento no Google Agenda
  const scheduleGoogleCalendarEvent = async (event: CalendarEvent) => {
    try {
      // Substitua pela URL da sua API que integra com o Google Calendar
      const response = await fetch("/api/google-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      })

      if (!response.ok) throw new Error("Failed to schedule event")
      return "Evento agendado com sucesso!"
    } catch (error) {
      console.error("Error scheduling event:", error)
      return "Erro ao agendar o evento no Google Agenda."
    }
  }

  // Função para interpretar a mensagem e decidir se é um agendamento
  const processMessage = async (message: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Verifica se a mensagem contém palavras-chave de agendamento
    const lowerMessage = message.toLowerCase()
    if (
      lowerMessage.includes("agendar") ||
      lowerMessage.includes("marcar") ||
      lowerMessage.includes("compromisso")
    ) {
      // Exemplo simples de extração de dados (pode ser melhorado com NLP)
      const event: CalendarEvent = {
        summary: message.split("agendar")[1]?.trim() || "Compromisso do CEO",
        start: { dateTime: new Date().toISOString() }, // Data atual como padrão
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() }, // 1 hora depois
      }

      const reply = await scheduleGoogleCalendarEvent(event)
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: reply,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } else {
      // Envia para a LLM para resposta genérica
      const reply = await sendMessageToLLM(message)
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        content: reply,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    }
  }

  // Enviar mensagem ao pressionar Enter ou clicar no botão
  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return
    processMessage(input)
    setInput("")
  }

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Assistente do Executivo</h2>
        <p className="text-sm text-muted-foreground">
          Pergunte qualquer coisa ou agende compromissos!
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Inicie a conversa digitando uma mensagem abaixo.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p>{msg.content}</p>
                <span className="text-xs opacity-70">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </ScrollArea>

      <div className="p-4 border-t flex items-center space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem ou peça para agendar algo..."
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  )
}