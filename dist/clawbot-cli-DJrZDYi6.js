import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-BKDT474X.js";
import "./subsystem-DFF5bJzM.js";
import "./openclaw-root-CiXMCkaN.js";
import "./exec-D3xDF_CZ.js";
import "./agent-scope-BTkaxOmC.js";
import "./model-selection-CTrlAwmO.js";
import "./github-copilot-token-DaPBqE1w.js";
import "./boolean-BsqeuxE6.js";
import "./env-BIrAaG_2.js";
import "./host-env-security-DkAVVuaw.js";
import "./env-vars-CgBIXgEO.js";
import "./manifest-registry-Mi9bZrvb.js";
import "./ip-DJ5wsTQn.js";
import { t as formatDocsLink } from "./links-CJgAt-D6.js";
import { n as registerQrCli } from "./qr-cli-B2zsLBa9.js";

//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}

//#endregion
export { registerClawbotCli };