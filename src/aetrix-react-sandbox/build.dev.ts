import "dotenv/config";
import { Template, defaultBuildLogger } from "e2b";
import { template } from "./template";

async function main() {
  await Template.build(template, {
    alias: "aetrix-react-sandbox-dev",
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);
