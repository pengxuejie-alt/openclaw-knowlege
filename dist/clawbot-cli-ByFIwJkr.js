import { Ot as theme } from "./entry.js";
import "./auth-profiles-0NafhXwT.js";
import "./openclaw-root-jpxkdOqd.js";
import "./exec-DanmqEBd.js";
import "./agent-scope-DIyeRIwV.js";
import "./github-copilot-token-q57TYcbJ.js";
import "./host-env-security-VbAkcANc.js";
import "./env-vars-DuCByIOF.js";
import "./manifest-registry-HCsle6hF.js";
import "./ip-DZF2tb1n.js";
import { t as formatDocsLink } from "./links-BXWkrGr8.js";
import { n as registerQrCli } from "./qr-cli-D9hKYa_J.js";

//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}

//#endregion
export { registerClawbotCli };