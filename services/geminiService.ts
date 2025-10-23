
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a more user-friendly error.
  // For this context, we assume the API_KEY is provided.
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateTags = async (itemName: string): Promise<string[]> => {
  if (!API_KEY) {
    return [];
  }
  try {
    const prompt = `Generate 3-5 relevant, single-word, lowercase, searchable tags for the following inventory item: '${itemName}'. Return the response as a JSON array of strings. For example, for 'iPhone 15 Pro Max', you might return: ["electronics", "apple", "smartphone", "mobile", "gadget"]`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A single searchable tag",
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const tags = JSON.parse(jsonString);

    if (Array.isArray(tags) && tags.every(t => typeof t === 'string')) {
      return tags;
    }
    return [];

  } catch (error) {
    console.error("Error generating tags with Gemini API:", error);
    return []; // Return empty array on error
  }
};
