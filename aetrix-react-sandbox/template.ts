import { Template, waitForPort } from "e2b";

export const template: any = Template()
  .fromImage("e2bdev/base")
  .runCmd("curl -fsSL https://code-server.dev/install.sh | sh")

  // Runtime commands
  .setStartCmd(
    `
    code server --bind-addr 0.0.0.0:8080 --auth none .
      `,
    waitForPort(8080)
  );
