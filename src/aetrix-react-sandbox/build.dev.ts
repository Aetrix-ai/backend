import "dotenv/config";
import { Template, defaultBuildLogger } from "e2b";
import { template } from "./template";

async function main() {
  await Template.build(template, {
    alias: "aetrix-sandbox-dev",
    cpuCount: 8,
    memoryMB: 8192,
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);
