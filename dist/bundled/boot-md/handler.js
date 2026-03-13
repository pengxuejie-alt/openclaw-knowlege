import "../../paths-DT-163rP.js";
import { pt as isGatewayStartupEvent, r as defaultRuntime, t as createSubsystemLogger } from "../../subsystem-CMcdOpPO.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-BR4maq1j.js";
import { n as listAgentIds, s as resolveAgentWorkspaceDir } from "../../agent-scope-BQNab8SK.js";
import "../../workspace-CHmqKFRC.js";
import "../../model-selection-BePWPcm7.js";
import "../../github-copilot-token-CPyffhi6.js";
import "../../env-Dt2Dn7RT.js";
import "../../boolean-B8-BqKGQ.js";
import "../../dock-DFL5XiTL.js";
import { n as SILENT_REPLY_TOKEN } from "../../tokens-usb4el5x.js";
import { a as createDefaultDeps, i as agentCommand } from "../../pi-embedded-u5HNQ2Hm.js";
import "../../plugins-j4J-TqKL.js";
import "../../accounts-BoIFYQrc.js";
import "../../bindings-DtW2SjVE.js";
import "../../send-C0mzIVbY.js";
import "../../send-HCjwCS4v.js";
import "../../deliver-CHUlvThm.js";
import "../../diagnostic-BZYI2Sqe.js";
import "../../diagnostic-session-state-DUn6VCV7.js";
import "../../accounts-B8BQuZyT.js";
import "../../send-Mv_ibioR.js";
import "../../image-ops-Q_cU51BF.js";
import "../../pi-model-discovery-CfcQmiIR.js";
import "../../message-channel-CiG3G8su.js";
import "../../pi-embedded-helpers-BkH8-lTB.js";
import "../../chrome-DSFFOhwW.js";
import "../../ssrf-BxZxJnIQ.js";
import "../../frontmatter-B5AvVwkM.js";
import "../../skills-cRDIHh65.js";
import "../../path-alias-guards-_9Mly35h.js";
import "../../redact-B_5AbrxJ.js";
import "../../errors-DIKV1Hxy.js";
import "../../fs-safe-D0kKN72T.js";
import "../../store-Dp6JbUV_.js";
import { U as resolveMainSessionKey, V as resolveAgentMainSessionKey, d as updateSessionStore, s as loadSessionStore } from "../../sessions-DkLqAtd0.js";
import "../../accounts-NKIG2Jmd.js";
import { l as resolveStorePath } from "../../paths-BWEsRo1s.js";
import "../../tool-images-D37kJbRl.js";
import "../../thinking-CjSkALRq.js";
import "../../image-Bbkg75Vi.js";
import "../../reply-prefix-D8VypbLg.js";
import "../../manager-DmPHR39K.js";
import "../../gemini-auth-BntG65N2.js";
import "../../fetch-guard-BegZ34Sq.js";
import "../../query-expansion-CbnwL7Zr.js";
import "../../retry-JIBgIh1D.js";
import "../../target-errors-DJD0gKJ1.js";
import "../../chunk-BS0ILAET.js";
import "../../markdown-tables-B6CF3Qb6.js";
import "../../local-roots-fEwjVBS1.js";
import "../../ir-Cd_MDDrA.js";
import "../../render-D7n7kmbn.js";
import "../../commands-registry-dP7t3kvk.js";
import "../../skill-commands-AM2dwsy_.js";
import "../../runner-B-3BrZH-.js";
import "../../fetch-Ch7M-Dwm.js";
import "../../channel-activity-CvnXZzPW.js";
import "../../tables-BMhT6t0g.js";
import "../../send-Df2AHcVo.js";
import "../../outbound-attachment-DVA1lNII.js";
import "../../send-CK4IZ3mB.js";
import "../../resolve-route-C4_56mR0.js";
import "../../proxy-moRaHw9F.js";
import "../../replies-B1KbzRTC.js";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

//#region src/gateway/boot.ts
function generateBootSessionId() {
	return `boot-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "")}-${crypto.randomUUID().slice(0, 8)}`;
}
const log$1 = createSubsystemLogger("gateway/boot");
const BOOT_FILENAME = "BOOT.md";
function buildBootPrompt(content) {
	return [
		"You are running a boot check. Follow BOOT.md instructions exactly.",
		"",
		"BOOT.md:",
		content,
		"",
		"If BOOT.md asks you to send a message, use the message tool (action=send with channel + target).",
		"Use the `target` field (not `to`) for message tool destinations.",
		`After sending with the message tool, reply with ONLY: ${SILENT_REPLY_TOKEN}.`,
		`If nothing needs attention, reply with ONLY: ${SILENT_REPLY_TOKEN}.`
	].join("\n");
}
async function loadBootFile(workspaceDir) {
	const bootPath = path.join(workspaceDir, BOOT_FILENAME);
	try {
		const trimmed = (await fs.readFile(bootPath, "utf-8")).trim();
		if (!trimmed) return { status: "empty" };
		return {
			status: "ok",
			content: trimmed
		};
	} catch (err) {
		if (err.code === "ENOENT") return { status: "missing" };
		throw err;
	}
}
function snapshotMainSessionMapping(params) {
	const agentId = resolveAgentIdFromSessionKey(params.sessionKey);
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId });
	try {
		const entry = loadSessionStore(storePath, { skipCache: true })[params.sessionKey];
		if (!entry) return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: true,
			hadEntry: false
		};
		return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: true,
			hadEntry: true,
			entry: structuredClone(entry)
		};
	} catch (err) {
		log$1.debug("boot: could not snapshot main session mapping", {
			sessionKey: params.sessionKey,
			error: String(err)
		});
		return {
			storePath,
			sessionKey: params.sessionKey,
			canRestore: false,
			hadEntry: false
		};
	}
}
async function restoreMainSessionMapping(snapshot) {
	if (!snapshot.canRestore) return;
	try {
		await updateSessionStore(snapshot.storePath, (store) => {
			if (snapshot.hadEntry && snapshot.entry) {
				store[snapshot.sessionKey] = snapshot.entry;
				return;
			}
			delete store[snapshot.sessionKey];
		}, { activeSessionKey: snapshot.sessionKey });
		return;
	} catch (err) {
		return err instanceof Error ? err.message : String(err);
	}
}
async function runBootOnce(params) {
	const bootRuntime = {
		log: () => {},
		error: (message) => log$1.error(String(message)),
		exit: defaultRuntime.exit
	};
	let result;
	try {
		result = await loadBootFile(params.workspaceDir);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log$1.error(`boot: failed to read ${BOOT_FILENAME}: ${message}`);
		return {
			status: "failed",
			reason: message
		};
	}
	if (result.status === "missing" || result.status === "empty") return {
		status: "skipped",
		reason: result.status
	};
	const sessionKey = params.agentId ? resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	}) : resolveMainSessionKey(params.cfg);
	const message = buildBootPrompt(result.content ?? "");
	const sessionId = generateBootSessionId();
	const mappingSnapshot = snapshotMainSessionMapping({
		cfg: params.cfg,
		sessionKey
	});
	let agentFailure;
	try {
		await agentCommand({
			message,
			sessionKey,
			sessionId,
			deliver: false
		}, bootRuntime, params.deps);
	} catch (err) {
		agentFailure = err instanceof Error ? err.message : String(err);
		log$1.error(`boot: agent run failed: ${agentFailure}`);
	}
	const mappingRestoreFailure = await restoreMainSessionMapping(mappingSnapshot);
	if (mappingRestoreFailure) log$1.error(`boot: failed to restore main session mapping: ${mappingRestoreFailure}`);
	if (!agentFailure && !mappingRestoreFailure) return { status: "ran" };
	return {
		status: "failed",
		reason: [agentFailure ? `agent run failed: ${agentFailure}` : void 0, mappingRestoreFailure ? `mapping restore failed: ${mappingRestoreFailure}` : void 0].filter((part) => Boolean(part)).join("; ")
	};
}

//#endregion
//#region src/hooks/bundled/boot-md/handler.ts
const log = createSubsystemLogger("hooks/boot-md");
const runBootChecklist = async (event) => {
	if (!isGatewayStartupEvent(event)) return;
	if (!event.context.cfg) return;
	const cfg = event.context.cfg;
	const deps = event.context.deps ?? createDefaultDeps();
	const agentIds = listAgentIds(cfg);
	for (const agentId of agentIds) {
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const result = await runBootOnce({
			cfg,
			deps,
			workspaceDir,
			agentId
		});
		if (result.status === "failed") {
			log.warn("boot-md failed for agent startup run", {
				agentId,
				workspaceDir,
				reason: result.reason
			});
			continue;
		}
		if (result.status === "skipped") log.debug("boot-md skipped for agent startup run", {
			agentId,
			workspaceDir,
			reason: result.reason
		});
	}
};

//#endregion
export { runBootChecklist as default };