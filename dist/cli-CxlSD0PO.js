import { s as createSubsystemLogger } from "./entry.js";
import { j as loadConfig } from "./auth-profiles-0NafhXwT.js";
import "./openclaw-root-jpxkdOqd.js";
import "./exec-DanmqEBd.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-DIyeRIwV.js";
import "./github-copilot-token-q57TYcbJ.js";
import "./host-env-security-VbAkcANc.js";
import "./env-vars-DuCByIOF.js";
import "./manifest-registry-HCsle6hF.js";
import "./dock-BQCVKcZL.js";
import "./model-B0KrJA7k.js";
import "./pi-model-discovery-oH9Hk1Gw.js";
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
import "./send-DLu8xXnE.js";
import "./send-8sCdPPj_.js";
import { _ as loadOpenClawPlugins } from "./subagent-registry-tIcCr1XE.js";
import "./paths-BvPCP-jf.js";
import "./chat-envelope-BbjUfSpL.js";
import "./client-BqUbcbV8.js";
import "./call-BP9ziIDj.js";
import "./pairing-token-SouSrG_r.js";
import "./net-gZV4PaxN.js";
import "./ip-DZF2tb1n.js";
import "./tailnet-DlV_mHNG.js";
import "./tokens-Dq9J__0M.js";
import "./with-timeout-PB1yrHJD.js";
import "./deliver-enaATHDX.js";
import "./diagnostic-3R7EyDo2.js";
import "./diagnostic-session-state-cwjDplnM.js";
import "./send-DJSkrf9G.js";
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
import "./models-config-ChKtmyem.js";
import "./exec-approvals-allowlist-CDjewClL.js";
import "./exec-safe-bin-runtime-policy-Cbj7ouQo.js";
import "./reply-prefix-CbreE2me.js";
import "./memory-cli-DGSdjtIJ.js";
import "./manager-BVaYZmCG.js";
import "./gemini-auth-CIslOHue.js";
import "./fetch-guard-DHsIRI5K.js";
import "./query-expansion-X3vbva0F.js";
import "./retry-D7bSETth.js";
import "./target-errors-CBYoV-r2.js";
import "./chunk-ovaA0X4A.js";
import "./markdown-tables-Y10nk5Bh.js";
import "./local-roots-DE_WZCbt.js";
import "./ir-Bd8vY_Ao.js";
import "./render-CC7dS9Xb.js";
import "./commands-DMVnfDNZ.js";
import "./commands-registry-C75WkVal.js";
import "./image-CeDDzVBN.js";
import "./tool-display-BoRynF3H.js";
import "./runner-Ifho-pOe.js";
import "./model-catalog-DdcLYAX5.js";
import "./fetch-CLurgmdh.js";
import "./pairing-store-BT3ARjY_.js";
import "./exec-approvals-Cw71ZwnF.js";
import "./nodes-screen-BpGvBLA9.js";
import "./session-utils-Bv0cua6j.js";
import "./session-cost-usage-C2SjKcJX.js";
import "./skill-commands-Bi7kVsgu.js";
import "./workspace-dirs-CzC5BnHS.js";
import "./channel-activity-y6fRXZsT.js";
import "./tables-BVDOviE7.js";
import "./server-lifecycle-VjYMdfRu.js";
import "./stagger-DAKdJbmK.js";
import "./channel-selection-mS8vmtKZ.js";
import "./plugin-auto-enable-DMsYAgHe.js";
import "./send-DGkuppvL.js";
import "./outbound-attachment-ze8fTO9Q.js";
import "./delivery-queue-BQZr4-ta.js";
import "./send-C7dMdGs-.js";
import "./resolve-route-C9qMEAHm.js";
import "./system-run-command-VL-7vsc4.js";
import "./pi-tools.policy-18oy4THv.js";
import "./proxy-h0elQk1G.js";
import "./links-BXWkrGr8.js";
import "./cli-utils-BlFG2Sa_.js";
import "./help-format-GFuiXY9-.js";
import "./progress-CrCu56Pm.js";
import "./replies-1Cp-gYeg.js";
import "./onboard-helpers-B0Dw__Bi.js";
import "./prompt-style-BIi-Kp_L.js";
import "./pairing-labels-BQKfZTQ_.js";

//#region src/plugins/cli.ts
const log = createSubsystemLogger("plugins");
function registerPluginCliCommands(program, cfg) {
	const config = cfg ?? loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const logger = {
		info: (msg) => log.info(msg),
		warn: (msg) => log.warn(msg),
		error: (msg) => log.error(msg),
		debug: (msg) => log.debug(msg)
	};
	const registry = loadOpenClawPlugins({
		config,
		workspaceDir,
		logger
	});
	const existingCommands = new Set(program.commands.map((cmd) => cmd.name()));
	for (const entry of registry.cliRegistrars) {
		if (entry.commands.length > 0) {
			const overlaps = entry.commands.filter((command) => existingCommands.has(command));
			if (overlaps.length > 0) {
				log.debug(`plugin CLI register skipped (${entry.pluginId}): command already registered (${overlaps.join(", ")})`);
				continue;
			}
		}
		try {
			const result = entry.register({
				program,
				config,
				workspaceDir,
				logger
			});
			if (result && typeof result.then === "function") result.catch((err) => {
				log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
			});
			for (const command of entry.commands) existingCommands.add(command);
		} catch (err) {
			log.warn(`plugin CLI register failed (${entry.pluginId}): ${String(err)}`);
		}
	}
}

//#endregion
export { registerPluginCliCommands };