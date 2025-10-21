import { Response } from "express";
import { EnrichPrompt } from "./agents/enrichment-agent";
import { ValidateUserPrompt } from "./agents/validator-agent";
import { GenerateCode } from "./agents/generator-agent";
import { selectTeckStack } from "./agents/techstack-agent";
import ca from "zod/v4/locales/ca.js";
import logger from "../../lib/logger";

//TODO add a valid return type
export const GeneratedResponse = async (userInput: string, res: Response): Promise<any> => {
  // TODO: response streaming
  try {
    res.write(JSON.stringify({ status: "validation", message: "Validating Input" }));
    const validatedInput = await ValidateUserPrompt(userInput);
    res.write(JSON.stringify({ status: "enrichment", message: "Enriching Input" }));
    const enrichedInput = await EnrichPrompt(validatedInput);
    // TODO: add a todo steps layer
    const framework = await selectTeckStack(enrichedInput);
    res.write(JSON.stringify({ status: "generation", message: "Generating Response" }));
    const result = await GenerateCode(framework[0] as string);
    return result;
  } catch (error: any) {
    logger.error("Error in GeneratedResponse pipeline:", error);
    res.write(JSON.stringify({ status: "error", message: error.message || "An error occurred" }));
    return { results: [], message: error.message || "An error occurred" };
  }
};
