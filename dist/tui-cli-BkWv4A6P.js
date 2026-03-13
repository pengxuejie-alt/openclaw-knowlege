import "./paths-B4BZAPZh.js";
import { B as theme } from "./utils-BKDT474X.js";
import "./thinking-EAliFiVK.js";
import { f as defaultRuntime } from "./subsystem-DFF5bJzM.js";
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
import "./dock-DZMW4XtF.js";
import "./message-channel-AiWnTVRO.js";
import "./pi-embedded-helpers-Dq4JEbLT.js";
import "./sandbox-Cqbu9H1O.js";
import "./tool-catalog-DMUbE5LE.js";
import "./chrome-B5_-wkdZ.js";
import "./tailscale-B7TN0YFP.js";
import "./ip-DJ5wsTQn.js";
import "./tailnet-C9lH_YnG.js";
import "./ws-XBTtYpJc.js";
import "./auth-DpuVH6rW.js";
import "./server-context-B_TARiRc.js";
import "./frontmatter-CdUHSoKB.js";
import "./skills-BNAX_fmw.js";
import "./path-alias-guards-DNXrwEhU.js";
import "./paths-Ds9fRoRV.js";
import "./redact-xCR1DVXq.js";
import "./errors-CiSHb--3.js";
import "./fs-safe-Dp4xnBTM.js";
import "./ssrf-Dw9zzKSM.js";
import "./image-ops-BZTKbSND.js";
import "./store-VRnzpYjd.js";
import "./ports-DBu05eik.js";
import "./trash-DlkGvbj1.js";
import "./server-middleware-ClTAn7Ra.js";
import "./sessions-B4xDFQR-.js";
import "./plugins-D6GIpFVm.js";
import "./accounts-_D91lwNC.js";
import "./accounts-JI0F4PVp.js";
import "./accounts-Ck1_o2aD.js";
import "./bindings-BHOprCZK.js";
import "./logging-q4KyMmY-.js";
import "./paths-ypkxllDe.js";
import "./chat-envelope-84JC1yYX.js";
import "./tool-images-B-kGIr6q.js";
import "./tool-display-NVXMsqfs.js";
import "./commands-Jc67mbxZ.js";
import "./commands-registry-Bi9MU2TQ.js";
import "./client-BGHU1qbs.js";
import "./call-DyUJTy-M.js";
import "./pairing-token-DBSyAz0_.js";
import { t as formatDocsLink } from "./links-CJgAt-D6.js";
import { t as parseTimeoutMs } from "./parse-timeout-DT8wPERl.js";
import { t as runTui } from "./tui-DrFsa-Sf.js";

//#region src/cli/tui-cli.ts
function registerTuiCli(program) {
	program.command("tui").description("Open a terminal UI connected to the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Session key (default: \"main\", or \"global\" when scope is global)").option("--deliver", "Deliver assistant replies", false).option("--thinking <level>", "Thinking level override").option("--message <text>", "Send an initial message after connecting").option("--timeout-ms <ms>", "Agent timeout in ms (defaults to agents.defaults.timeoutSeconds)").option("--history-limit <n>", "History entries to load", "200").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/tui", "docs.openclaw.ai/cli/tui")}\n`).action(async (opts) => {
		try {
			const timeoutMs = parseTimeoutMs(opts.timeoutMs);
			if (opts.timeoutMs !== void 0 && timeoutMs === void 0) defaultRuntime.error(`warning: invalid --timeout-ms "${String(opts.timeoutMs)}"; ignoring`);
			const historyLimit = Number.parseInt(String(opts.historyLimit ?? "200"), 10);
			await runTui({
				url: opts.url,
				token: opts.token,
				password: opts.password,
				session: opts.session,
				deliver: Boolean(opts.deliver),
				thinking: opts.thinking,
				message: opts.message,
				timeoutMs,
				historyLimit: Number.isNaN(historyLimit) ? void 0 : historyLimit
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerTuiCli };