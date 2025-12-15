import { Template, waitForPort } from "e2b";

export const template: any = Template()
  .fromImage("node:22-bookworm")
  .runCmd("curl -fsSL https://code-server.dev/install.sh | sh")
  .gitClone("https://github.com/Aetrix-ai/templates.git")
  .runCmd("cd templates/react-starter && npm install")
  .runCmd(
    `
mkdir -p ~/.local/share/code-server/User &&
cat <<EOF > ~/.local/share/code-server/User/settings.json
{
  "workbench.colorTheme": "Dark+ (default dark)",
  "workbench.preferredDarkColorTheme": "Dark+ (default dark)",
  "window.autoDetectColorScheme": false
}
EOF
`
  )
  .runCmd("cd templates/react-starter && npx vite build")
  .setStartCmd("cd templates/react-starter && code-server --bind-addr 0.0.0.0:8080 --auth none .", waitForPort(8080));
// Runtime commands
