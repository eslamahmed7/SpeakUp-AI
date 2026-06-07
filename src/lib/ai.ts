import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function generateAIResponse(
  messages: ChatMessage[],
  systemInstruction: string
): Promise<string> {
  if (!API_KEY) {
    console.error('Gemini API key is missing.');
    return 'Error: API key is missing. Please check your environment variables.';
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const lastMessage = messages[messages.length - 1].text;

    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
  } catch (error: any) {
    console.error('Error calling Gemini API:', error?.message || error);
    // Return a user-friendly fallback message
    if (error?.message?.includes('API_KEY') || error?.message?.includes('403')) {
      return 'API key error. Please check your Gemini API key in the settings.';
    }
    return 'Sorry, an error occurred while processing your request. Please try again.';
  }
}

export function evaluatePronunciationScore(text: string, targetWord: string): number {
  // A simple implementation for evaluating pronunciation based on string matching
  // In a production app, you might want to use a more sophisticated phonetic comparison
  const normalize = (s: string) => s.toLowerCase().replace(/[.,!?]/g, '').trim();
  const normalizedText = normalize(text);
  const normalizedTarget = normalize(targetWord);
  
  if (normalizedText === normalizedTarget) return 100;
  if (normalizedText.includes(normalizedTarget) || normalizedTarget.includes(normalizedText)) return 85;
  
  // Basic Levenshtein-like approximation or simple word match percentage
  const textWords = normalizedText.split(' ');
  const targetWords = normalizedTarget.split(' ');
  
  let matches = 0;
  for (const tw of targetWords) {
    if (textWords.includes(tw)) matches++;
  }
  
  const percentage = (matches / Math.max(targetWords.length, 1)) * 100;
  return Math.max(Math.floor(percentage), 40); // Floor at 40% if they said something
}
