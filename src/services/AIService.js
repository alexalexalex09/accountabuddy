import OpenAI from 'openai';

// Note: In a real app, store API key securely, e.g., in environment variables or secure storage
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY', // Fallback for development
});

export const analyzeResponse = async (text) => {
  try {
    const prompt = `Analyze the following response about completing a daily habit. Determine:
1. Whether the habit was actually completed (true/false)
2. The overall sentiment (positive, negative, neutral)

Response: "${text}"

Provide the answer in JSON format: {"completed": boolean, "sentiment": "string"}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
    });

    const result = response.choices[0].message.content.trim();
    const parsed = JSON.parse(result);

    return {
      completed: parsed.completed,
      sentiment: parsed.sentiment,
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    // Fallback: assume completed if text is provided
    return {
      completed: true,
      sentiment: 'neutral',
    };
  }
};