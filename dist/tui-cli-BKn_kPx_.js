import { Ot as theme, v as defaultRuntime } from "./entry.js";
import "./auth-profiles-0NafhXwT.js";
import "./openclaw-root-jpxkdOqd.js";
import "./exec-DanmqEBd.js";
import "./agent-scope-DIyeRIwV.js";
import "./github-copilot-token-q57TYcbJ.js";
import "./host-env-security-VbAkcANc.js";
import "./env-vars-DuCByIOF.js";
import "./manifest-registry-HCsle6hF.js";
import "./dock-BQCVKcZL.js";
import "./frontmatter-aDb-YadT.js";
import "./skills-0mPuFOUn.js";
import "./path-alias-guards-C4tNGjPE.js";
import "./message-channel-CxHKaTgX.js";
import "./sessions-Bp3qR6Tw.js";
import "./plugins-m9MqVmdr.js";
import "./accounts-B2kIp6qA.js";
import "./accounts-DUsGdKnq.js";
import "./accounts-BNLQbNiM.js";
import "./bindings-ByCIQwuN.js";
import "./logging-Bgrm4o7g.js";
import "./paths-BvPCP-jf.js";
import "./chat-envelope-BbjUfSpL.js";
import "./client-BqUbcbV8.js";
import "./call-BP9ziIDj.js";
import "./pairing-token-SouSrG_r.js";
import "./net-gZV4PaxN.js";
import "./ip-DZF2tb1n.js";
import "./tailnet-DlV_mHNG.js";
import "./image-ops-qGJz1hIz.js";
import "./pi-embedded-helpers-ZUlTEVbk.js";
import "./sandbox-D2rsqOoY.js";
import "./tool-catalog-C6QgTHG4.js";
import "./chrome-CMlRJr8W.js";
import "./tailscale-2WWUN5_D.js";
import "./auth-D6sRRUT0.js";
import "./server-context-dfzBVdwV.js";
import "./paths-C82DQ0ar.js";
import "./redact-6vvLhMiY.js";
import "./errors-27FEsju9.js";
import "./fs-safe-Chvvdo1-.js";
import "./ssrf-CYyGTUfr.js";
import "./store-CZT5QwHx.js";
import "./ports-vw6wMYU9.js";
import "./trash-BXA_kzSK.js";
import "./server-middleware-LnMDQ9k2.js";
import "./tool-images-Cue9KtUK.js";
import "./thinking-Ds3Ekf1K.js";
import "./commands-DMVnfDNZ.js";
import "./commands-registry-C75WkVal.js";
import "./tool-display-BoRynF3H.js";
import { t as parseTimeoutMs } from "./parse-timeout-U3P8xqXu.js";
import { t as formatDocsLink } from "./links-BXWkrGr8.js";
import { t as runTui } from "./tui-BmfyHrek.js";

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