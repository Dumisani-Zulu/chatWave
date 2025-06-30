'use server';

/**
 * @fileOverview AI agent that suggests relevant files based on the chat conversation.
 *
 * - suggestRelevantFiles - A function that suggests relevant files.
 * - SuggestRelevantFilesInput - The input type for the suggestRelevantFiles function.
 * - SuggestRelevantFilesOutput - The return type for the suggestRelevantFiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantFilesInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The recent chat conversation history.'),
  availableFiles: z
    .array(z.string())
    .describe('A list of available file names to suggest from.'),
});
export type SuggestRelevantFilesInput = z.infer<
  typeof SuggestRelevantFilesInputSchema
>;

const SuggestRelevantFilesOutputSchema = z.object({
  suggestedFiles: z
    .array(z.string())
    .describe('A list of file names that are relevant to the conversation.'),
});
export type SuggestRelevantFilesOutput = z.infer<
  typeof SuggestRelevantFilesOutputSchema
>;

export async function suggestRelevantFiles(
  input: SuggestRelevantFilesInput
): Promise<SuggestRelevantFilesOutput> {
  return suggestRelevantFilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantFilesPrompt',
  input: {schema: SuggestRelevantFilesInputSchema},
  output: {schema: SuggestRelevantFilesOutputSchema},
  prompt: `You are an AI assistant helping users find relevant files to share in a chat.

  Given the following conversation history and a list of available files, suggest which files are most relevant to the conversation.

  Conversation History:
  {{conversationHistory}}

  Available Files:
  {{#each availableFiles}}- {{this}}\n{{/each}}

  Only return file names from the provided list of available files.
  If none of the files seem relevant, return an empty array.
  Do not add any other explanation.
  `,
});

const suggestRelevantFilesFlow = ai.defineFlow(
  {
    name: 'suggestRelevantFilesFlow',
    inputSchema: SuggestRelevantFilesInputSchema,
    outputSchema: SuggestRelevantFilesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
