import { Template, waitForPort } from "e2b";

export const template: any = Template()
  .fromTemplate("mcp-gateway")
  .addMcpServer("filesystem")
  .runCmd("curl -fsSL https://code-server.dev/install.sh | sh")
  .gitClone("https://github.com/Aetrix-ai/templates.git")
  .runCmd("cd templates/react-starter && npm install")
  .runCmd("cd templates/react-starter && npx vite build")
  .setStartCmd("cd templates/react-starter && code-server --bind-addr 0.0.0.0:8080 --auth none .", waitForPort(8080));
// Runtime commands
``
