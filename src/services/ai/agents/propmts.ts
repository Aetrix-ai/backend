/**
 * return a well structured prompt for enriching user input/prompt
 * @param prompt 
 * @returns 
 */
export function getEnrichPrompt(prompt: string): string {
  return `Enrich this text: '${prompt}'`;
}

/**
 * returns a system prompt for enriching user input/prompt
 * @returns 
 */
export function getEnrichSystemPrompt(): string {
  return "You are a helpful AI assistant that enriches text.";
}

/**
 * returns a prompt for generating code based on requirements
 * @param requirements 
 * @returns 
 */
export function getGenerateCodePrompt(requirements: string): string {
  return `Generate code based on the following requirements: '${requirements}'`;
}

/**
 * returns a system prompt for generating code based on requirements
 * @returns 
 */
export function getGenerateCodeSystemPrompt(): string {
  return "You are a helpful AI assistant that generates code based on requirements.";
}

/**
 * returns a prompt for validating user prompt weather its meaningful or not
 * @param prompt 
 * @returns 
 */
export function getValidationPrompt(prompt: string): string {
  return `Validate the following code for errors and best practices: '${prompt}'`;
}
/**
 * returns a system prompt for validating user prompt weather its meaningful or not
 * @returns 
 */
export function getValidationSystemPrompt(): string {
  return "You are a helpful AI assistant that validates user prompts for errors and best practices.";
}

/**
 * returns a prompt for selecting a framework based on requirements
 * @param requirements 
 * @returns 
 */
export function getTechStackSelectionPrompt(requirements: string ,  techStack: string[]): string {
  return `Based on the following requirements: '${requirements}', suggest the most suitable framework for development. Provide a brief explanation for your choice. [${techStack.join(", ")}]`;
}

/**
 * returns a system prompt for selecting a framework based on requirements
 * @returns 
 */
export function getTechStackSelectionSystemPrompt(): string {
  return "You are a helpful AI assistant that suggests the most suitable tech stack for development based on given requirements.";
}