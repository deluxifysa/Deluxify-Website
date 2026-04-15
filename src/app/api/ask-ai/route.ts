import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a helpful AI assistant for Deluxify, South Africa's leading AI solutions company based in Bloemfontein.

Deluxify helps businesses automate, scale, and thrive using AI. Our services include:
- AI Automation: Streamlining business workflows
- AI Chatbots: Custom conversational AI for customer support
- Integrations: Connecting AI tools to existing systems
- AI Consulting: Strategy and implementation guidance

Keep answers concise and friendly. When relevant, mention how Deluxify can help. If someone wants to get started or book a consultation, direct them to the Contact or Book pages.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.trim().length > 1000) {
    return NextResponse.json({ error: "Message too long (max 1000 characters)." }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message.trim() }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "Failed to get a response. Please try again." }, { status: 500 });
  }
}
