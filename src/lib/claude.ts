import Anthropic from '@anthropic-ai/sdk';
import { LogEntry } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeData(
  logs: LogEntry[],
  dateRange: string,
  customQuestion?: string
): Promise<string> {
  const simplified = logs.map((log) => ({
    date: log.date,
    logger: log.logger,
    entryType: log.entryType,
    ...Object.fromEntries(
      Object.entries(log.sections)
        .filter(([, data]) => data.active)
        .map(([key, data]) => [key, data.fields])
    ),
  }));

  const dataSnippet = JSON.stringify(simplified, null, 2);

  const systemPrompt = `You are a dog behavior analyst helping track patterns for a dog named Manny. You are given behavioral tracking data over a ${dateRange} period. The data includes demand barking (intensity 1-3), reactivity (triggers and green/yellow/red intensity), medication (clomipramine and clonidine), enrichment activities, and daily notes.

Analyze the data and provide:
1. **Summary**: Brief overview of the period
2. **Patterns**: Specific correlations and patterns you notice (especially medication vs. behavior, time patterns, trigger patterns)
3. **Concerns**: Any concerning trends to flag
4. **Positives**: Improvements or positive patterns
5. **Questions for Trainer**: Suggested questions for the next trainer session

Be specific and reference actual data points. Keep your analysis concise but actionable.`;

  const userContent = customQuestion
    ? `Here is the behavioral data:\n\n${dataSnippet}\n\nSpecific question: ${customQuestion}`
    : `Here is the behavioral data:\n\n${dataSnippet}\n\nPlease analyze this data and provide insights.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}
