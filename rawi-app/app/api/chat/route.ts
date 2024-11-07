import { NextRequest, NextResponse } from 'next/server';
import type { Message as VercelChatMessage } from 'ai';
import { HumanMessage, AIMessage, ChatMessage } from '@langchain/core/messages';

export const runtime = 'nodejs';

// Custom API Chat Model implementation
class CustomChatModel {
  private apiKey: string;
  private url: string;

  constructor(apiKey: string) {
    console.log('Initializing CustomChatModel');
    this.apiKey = apiKey;
    this.url = "https://ai.deem.sa/ml/v1/deployments/rawi1/text/generation?version=2021-05-01";
  }

  async call(messages: any[]) {
    const input = messages[messages.length - 1].content;
    console.log('Input for API:', input);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          input: input,
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 1000,
            min_new_tokens: 0,
            stop_sequences: [],
            repetition_penalty: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      // Return only the generated text
      console.log('Result from API:', result);
      const generatedText = result.results[0].generated_text.replace(/"""/g, '');
      return generatedText;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const formattedMessages = messages.map(formatVercelMessages);
    
    const model = new CustomChatModel(process.env.WATSONX_AI_ACCESS_TOKEN || '');
    const generatedText = await model.call(formattedMessages);
    
    return NextResponse.json(generatedText);
  } catch (error) {
    console.error('Error in route handler:', error);
    return NextResponse.json(
      { error: 'There was an error processing your request' },
      { status: 500 }
    );
  }
}

const formatVercelMessages = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};
