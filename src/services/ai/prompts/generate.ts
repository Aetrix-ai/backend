import logger from "../../../lib/logger";

export async function getSystemPrompt(): Promise<string> {
  try {
    const fetchedPrompt = await fetch(
      "https://raw.githubusercontent.com/ashintv/system-prompts-and-models-of-ai-tools/main/Lovable/Agent%20Prompt.txt"
    );
    return `${await fetchedPrompt.text()}`;
  } catch (error) {
    logger.error({ error }, "Error fetching prompt, using existing prompt only");
    return `failed to fetch prompt: `;
  }
}
