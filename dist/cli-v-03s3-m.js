import "./paths-B4BZAPZh.js";
import "./utils-BKDT474X.js";
import "./thinking-EAliFiVK.js";
import { ht as loadOpenClawPlugins } from "./reply-B_KWSIdC.js";
import { t as createSubsystemLogger } from "./subsystem-DFF5bJzM.js";
import "./openclaw-root-CiXMCkaN.js";
import "./exec-D3xDF_CZ.js";
import { d as resolveDefaultAgentId, u as resolveAgentWorkspaceDir } from "./agent-scope-BTkaxOmC.js";
import { Rt as loadConfig } from "./model-selection-CTrlAwmO.js";
import "./github-copilot-token-DaPBqE1w.js";
import "./boolean-BsqeuxE6.js";
import "./env-BIrAaG_2.js";
import "./host-env-security-DkAVVuaw.js";
import "./env-vars-CgBIXgEO.js";
import "./manifest-registry-Mi9bZrvb.js";
import "./dock-DZMW4XtF.js";
import "./message-channel-AiWnTVRO.js";
import "./send-QCJ3W7Sb.js";
import "./runner-BZJafbVt.js";
import "./image-CcCK_3Zl.js";
import "./models-config-BCmOQwo3.js";
import "./pi-model-discovery-DR4RSBMd.js";
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
import "./send-DN55UoPJ.js";
import "./paths-ypkxllDe.js";
import "./chat-envelope-84JC1yYX.js";
import "./tool-images-B-kGIr6q.js";
import "./tool-display-NVXMsqfs.js";
import "./fetch-guard-CJUaobd5.js";
import "./api-key-rotation-BvlVQC-S.js";
import "./local-roots-CDDI4IF2.js";
import "./model-catalog-Dlasm57b.js";
import "./tokens-7Srf8ZX-.js";
import "./deliver-Cx82zCg8.js";
import "./commands-Jc67mbxZ.js";
import "./commands-registry-Bi9MU2TQ.js";
import "./client-BGHU1qbs.js";
import "./call-DyUJTy-M.js";
import "./pairing-token-DBSyAz0_.js";
import "./fetch-Cv0lBehb.js";
import "./retry-D3ur6-Wh.js";
import "./pairing-store-BCqWk39d.js";
import "./exec-approvals-Bm3cfiyd.js";
import "./exec-approvals-allowlist-Kryolpu6.js";
import "./exec-safe-bin-runtime-policy-7XHAxdLu.js";
import "./nodes-screen-Ba-MzN2m.js";
import "./target-errors-B0Khvcws.js";
import "./diagnostic-session-state-3TH9GUxo.js";
import "./with-timeout-yUQ91j4G.js";
import "./diagnostic-ChAW0VNc.js";
import "./send-DUWLsmQi.js";
import "./model-CW_UpJO9.js";
import "./reply-prefix-BDEV0I7I.js";
import "./memory-cli-I2UeV82T.js";
import "./manager-tZFlxZa1.js";
import "./query-expansion-Cn8_rJ0n.js";
import "./chunk-CTp076GR.js";
import "./markdown-tables--MRgxBIU.js";
import "./ir-DU7d0SFr.js";
import "./render-B-qitl3R.js";
import "./pi-tools.policy-C6lAJsuq.js";
import "./channel-activity-BZZWTMLZ.js";
import "./tables-B_QSZOWE.js";
import "./send-CSZXBpuU.js";
import "./proxy-CV7JWVxd.js";
import "./links-CJgAt-D6.js";
import "./cli-utils-DWSfnwCw.js";
import "./help-format-Cexq_Gvk.js";
import "./progress-C8EQAwBh.js";
import "./resolve-route-D_xmFof2.js";
import "./replies-C04z5cgw.js";
import "./skill-commands-QdB-dVam.js";
import "./workspace-dirs-Bqr7zZty.js";
import "./plugin-auto-enable-xHF0-t-L.js";
import "./channel-selection-COSOJ-m8.js";
import "./outbound-attachment-6ekDRC90.js";
import "./delivery-queue-DpYJG_C9.js";
import "./session-cost-usage-qSnGRm10.js";
import "./send-2H5DosW4.js";
import "./onboard-helpers-BBIZ51oD.js";
import "./prompt-style-CWQwG24s.js";
import "./pairing-labels-D4eakCg7.js";
import "./server-lifecycle-BLEuAX6M.js";
import "./stagger-D_CWLS7Z.js";
import "./system-run-command-JTkjPcui.js";

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