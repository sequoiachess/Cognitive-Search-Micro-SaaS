import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async query(userQuery, documentContext = null) {
    const systemPrompt = `
You are the **Cognitive Search Engine** backend. Your primary function is to analyze a user's query and provide a precise, structured summary of the best available information.

${documentContext ? `\n**Relevant information from uploaded documents:**\n${documentContext}\n` : ''}

**You MUST adhere to these critical rules:**
1.  **Structure:** Always respond with a single, valid JSON object. Do not include any text, thoughts, or markdown (like \`\`\`json) outside of the JSON block itself.
2.  **Focus:** Act as if you are summarizing content you've retrieved from documents. Your answers must be factual and directly address the user's request.
3.  **Sources:** ${documentContext ? 'Prioritize information from the provided document excerpts and list them in sources.' : 'Generate 2-3 plausible, specific-sounding document titles or internal references for the sources array.'}
4.  **Confidence:** Your confidence level must reflect the complexity of the query. Use 'high' for simple fact retrieval, 'medium' for synthesis of multiple concepts, and 'low' if the query is highly speculative.

**JSON Schema Required:**
{
    "answer": "Your detailed, summarized answer (minimum 50 words) here. Begin with a direct one-sentence summary.",
    "confidence": "[must be 'high', 'medium', or 'low']",
    "sources": ["Source 1", "Source 2"],
    "follow_up_questions": ["Question 1", "Question 2"]
}
`;

    try {
      const result = await this.model.generateContent(
        `${systemPrompt}\n\nUser Query: ${userQuery}`
      );
      
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown artifacts
      text = text.trim();
      if (text.startsWith('```json')) text = text.substring(7);
      if (text.startsWith('```')) text = text.substring(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      text = text.trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Error querying Gemini: ${error.message}`);
    }
  }

  async createEmbedding(text) {
    // Note: Gemini embeddings require a different model
    try {
      const embeddingModel = this.genAI.getGenerativeModel({ 
        model: 'text-embedding-004' 
      });
      const result = await embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Embedding Error:', error);
      throw new Error(`Error creating embedding: ${error.message}`);
    }
  }
}
