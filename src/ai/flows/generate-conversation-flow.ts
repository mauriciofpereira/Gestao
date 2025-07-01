
'use server';
/**
 * @fileOverview An AI flow to generate a conversation between two users.
 *
 * - generateConversation - A function that handles the conversation generation.
 * - ConversationInput - The input type for the generateConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationInputSchema = z.object({
  user1: z.string().describe('The name of the first person in the conversation.'),
  user2: z.string().describe('The name of the second person in the conversation.'),
  scenario: z.string().optional().describe('The specific topic or context for the conversation.'),
});
export type ConversationInput = z.infer<typeof ConversationInputSchema>;

export async function generateConversation(input: ConversationInput): Promise<string> {
  const result = await conversationFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'conversationPrompt',
  input: {schema: ConversationInputSchema},
  prompt: `You are a script writer for a professional workplace environment. 
  
  Write a short, professional, and friendly conversation between two colleagues: {{{user1}}} and {{{user2}}}.
  
  The topic should be about {{#if scenario}}{{{scenario}}}{{else}}coordinating a work-related task{{/if}}. The conversation should be brief, with 2-3 exchanges per person.
  
  Format the output clearly, with each line starting with the speaker's name followed by a colon. 
  For example:
  {{{user1}}}: Hi {{{user2}}}, do you have a moment?
  {{{user2}}}: Sure, what's up?`,
});

const conversationFlow = ai.defineFlow(
  {
    name: 'conversationFlow',
    inputSchema: ConversationInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
