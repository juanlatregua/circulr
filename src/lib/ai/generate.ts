import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateOptions {
  prompt: string;
  maxTokens?: number;
  model?: string;
}

interface GenerateResult {
  content: string;
  tokensUsed: number;
  model: string;
}

export async function generate({
  prompt,
  maxTokens = 4096,
  model = "claude-sonnet-4-20250514",
}: GenerateOptions): Promise<GenerateResult> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const content = textBlock ? textBlock.text : "";

  return {
    content,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    model: response.model,
  };
}

export async function generateStream({
  prompt,
  maxTokens = 4096,
  model = "claude-sonnet-4-20250514",
}: GenerateOptions) {
  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return stream;
}
