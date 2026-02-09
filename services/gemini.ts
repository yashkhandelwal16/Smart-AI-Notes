
import { GoogleGenAI } from "@google/genai";
import { Note, ChatMessage } from "../types";

/**
 * Helper to retry a function with exponential backoff.
 * Target 429 (Quota) and 5xx errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errorMessage = err.message || '';
      // Retry on Rate Limit (429) or Server Errors (500, 503, 504)
      if (errorMessage.includes('429') || errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('504')) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function askAssistant(query: string, notes: Note[], history: ChatMessage[]): Promise<{ text: string; references: string[] }> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = 'gemini-3-flash-preview';
    
    // Format notes as context
    const notesContext = notes.map(n => `ID: ${n.id}\nTITLE: ${n.title}\nCONTENT: ${n.content}`).join('\n---\n');
    
    const systemInstruction = `
      You are a professional and helpful Smart AI Notes Assistant. 
      You have full read access to the user's workspace provided below.
      
      CRITICAL FORMATTING RULES FOR EVERY RESPONSE:
      1. START WITH A CONCISE SUMMARY (2-3 sentences max) - highlight the key takeaway
      2. Use ### for main sections and ## for subsections
      3. Use bullet points (•) and numbered lists for clarity
      4. BOLD (**text**) all key terms, names, and important identifiers
      5. Base answers strictly on user's notes - if missing info, state "Not found in workspace"
      6. Use code blocks for technical content: \`\`\`language ... \`\`\`
      7. Add relevant references at the end: "Source: [Note Title]"
      8. Keep paragraphs short (max 3-4 lines)
      
      RESPONSE STRUCTURE:
      **Summary:** [2-3 sentence polish]
      
      ### Main Point 1
      Content here...
      
      ### Main Point 2
      Content here...
      
      **References:** [List sources from workspace]
      
      USER'S NOTES CONTEXT:
      ${notesContext}
    `;

    const conversationHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model,
      contents: [
        ...conversationHistory.slice(-5), // last 5 turns for context
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || "I'm sorry, I couldn't process that request right now.";
    
    const references = notes
      .filter(n => text.toLowerCase().includes(n.title.toLowerCase()) || query.toLowerCase().includes(n.title.toLowerCase()))
      .map(n => n.title);

    return { text, references: Array.from(new Set(references)) };
  });
}
