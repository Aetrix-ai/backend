import { BaseCallbackHandler } from "@langchain/core/callbacks/base";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export class GlobalDelayCallback extends BaseCallbackHandler {
  name = "global-delay-callback";
  private delayMs: number;

  constructor(delayMs: number) {
    super();
    this.delayMs = delayMs;
  }

  async handleLLMStart() {
    await sleep(this.delayMs);
  }

  async handleToolStart() {
    await sleep(this.delayMs);
  }

  async handleAgentAction() {
    await sleep(this.delayMs);
  }
}

