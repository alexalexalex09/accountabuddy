import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
});

const BUDDY_SYSTEM_PROMPT = `You are an accountability buddy—warm, supportive, and occasionally playfully guilt-inducing like a good friend who cares. You use encouragement, gentle nudging, and light guilt (e.g. "Come on, you've got this!" or "I believe in you, but today wasn't the day—tomorrow will be!") to help the user stick to their goals.

When analyzing a user's check-in about whether they completed their goal:
1. Determine if they actually completed it (true/false). Be fair but not overly lenient—vague or evasive answers suggest incomplete.
2. Identify sentiment: positive, negative, or neutral.

Always respond with valid JSON only: {"completed": boolean, "sentiment": "string"}`;

/**
 * Analyzes a user's check-in response with full goal context.
 * @param {string} text - User's check-in text
 * @param {Object} goal - Goal object { name, description, timescale }
 * @param {Array} recentResponses - Recent check-ins [{ date, text, completed, sentiment }]
 * @returns {Promise<{completed: boolean, sentiment: string}>}
 */
export const analyzeResponse = async (text, goal, recentResponses = []) => {
  try {
    const goalContext = [
      `Goal: ${goal?.name || 'Unknown'}`,
      goal?.description ? `Description: ${goal.description}` : null,
      `Timescale: ${goal?.timescale || 'daily'}`,
    ]
      .filter(Boolean)
      .join('\n');

    const historyText =
      recentResponses.length > 0
        ? `Recent check-ins:\n${recentResponses
            .slice(-5)
            .map(
              (r) =>
                `- ${r.date}: "${r.text}" (completed: ${r.completed}, sentiment: ${r.sentiment})`
            )
            .join('\n')}`
        : 'No previous check-ins.';

    const userPrompt = `Goal context:
${goalContext}

${historyText}

Today's response: "${text}"

Analyze and respond with JSON only: {"completed": boolean, "sentiment": "string"}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: BUDDY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 100,
    });

    const result = response.choices[0].message.content.trim();
    const parsed = JSON.parse(result);

    return {
      completed: !!parsed.completed,
      sentiment: String(parsed.sentiment || 'neutral').toLowerCase(),
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      completed: true,
      sentiment: 'neutral',
    };
  }
};
