import { s as resolveStateDir } from "../../paths-DT-163rP.js";
import { t as createSubsystemLogger } from "../../subsystem-CMcdOpPO.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-BR4maq1j.js";
import { s as resolveAgentWorkspaceDir } from "../../agent-scope-BQNab8SK.js";
import "../../workspace-CHmqKFRC.js";
import "../../model-selection-BePWPcm7.js";
import "../../github-copilot-token-CPyffhi6.js";
import "../../env-Dt2Dn7RT.js";
import "../../boolean-B8-BqKGQ.js";
import "../../dock-DFL5XiTL.js";
import "../../tokens-usb4el5x.js";
import "../../pi-embedded-u5HNQ2Hm.js";
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
import { O as hasInterSessionUserProvenance } from "../../sessions-DkLqAtd0.js";
import "../../accounts-NKIG2Jmd.js";
import "../../paths-BWEsRo1s.js";
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
import { generateSlugViaLLM } from "../../llm-slug-generator.js";
import { t as resolveHookConfig } from "../../config-C0WeyxCF.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/bundled/session-memory/handler.ts
/**
* Session memory hook handler
*
* Saves session context to memory when /new or /reset command is triggered
* Creates a new dated memory file with LLM-generated slug
*/
const log = createSubsystemLogger("hooks/session-memory");
/**
* Read recent messages from session file for slug generation
*/
async function getRecentSessionContent(sessionFilePath, messageCount = 15) {
	try {
		const lines = (await fs.readFile(sessionFilePath, "utf-8")).trim().split("\n");
		const allMessages = [];
		for (const line of lines) try {
			const entry = JSON.parse(line);
			if (entry.type === "message" && entry.message) {
				const msg = entry.message;
				const role = msg.role;
				if ((role === "user" || role === "assistant") && msg.content) {
					if (role === "user" && hasInterSessionUserProvenance(msg)) continue;
					const text = Array.isArray(msg.content) ? msg.content.find((c) => c.type === "text")?.text : msg.content;
					if (text && !text.startsWith("/")) allMessages.push(`${role}: ${text}`);
				}
			}
		} catch {}
		return allMessages.slice(-messageCount).join("\n");
	} catch {
		return null;
	}
}
/**
* Try the active transcript first; if /new already rotated it,
* fallback to the latest .jsonl.reset.* sibling.
*/
async function getRecentSessionContentWithResetFallback(sessionFilePath, messageCount = 15) {
	const primary = await getRecentSessionContent(sessionFilePath, messageCount);
	if (primary) return primary;
	try {
		const dir = path.dirname(sessionFilePath);
		const resetPrefix = `${path.basename(sessionFilePath)}.reset.`;
		const resetCandidates = (await fs.readdir(dir)).filter((name) => name.startsWith(resetPrefix)).toSorted();
		if (resetCandidates.length === 0) return primary;
		const latestResetPath = path.join(dir, resetCandidates[resetCandidates.length - 1]);
		const fallback = await getRecentSessionContent(latestResetPath, messageCount);
		if (fallback) log.debug("Loaded session content from reset fallback", {
			sessionFilePath,
			latestResetPath
		});
		return fallback || primary;
	} catch {
		return primary;
	}
}
function stripResetSuffix(fileName) {
	const resetIndex = fileName.indexOf(".reset.");
	return resetIndex === -1 ? fileName : fileName.slice(0, resetIndex);
}
async function findPreviousSessionFile(params) {
	try {
		const files = await fs.readdir(params.sessionsDir);
		const fileSet = new Set(files);
		const baseFromReset = params.currentSessionFile ? stripResetSuffix(path.basename(params.currentSessionFile)) : void 0;
		if (baseFromReset && fileSet.has(baseFromReset)) return path.join(params.sessionsDir, baseFromReset);
		const trimmedSessionId = params.sessionId?.trim();
		if (trimmedSessionId) {
			const canonicalFile = `${trimmedSessionId}.jsonl`;
			if (fileSet.has(canonicalFile)) return path.join(params.sessionsDir, canonicalFile);
			const topicVariants = files.filter((name) => name.startsWith(`${trimmedSessionId}-topic-`) && name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
			if (topicVariants.length > 0) return path.join(params.sessionsDir, topicVariants[0]);
		}
		if (!params.currentSessionFile) return;
		const nonResetJsonl = files.filter((name) => name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
		if (nonResetJsonl.length > 0) return path.join(params.sessionsDir, nonResetJsonl[0]);
	} catch {}
}
/**
* Save session context to memory when /new or /reset command is triggered
*/
const saveSessionToMemory = async (event) => {
	const isResetCommand = event.action === "new" || event.action === "reset";
	if (event.type !== "command" || !isResetCommand) return;
	try {
		log.debug("Hook triggered for reset/new command", { action: event.action });
		const context = event.context || {};
		const cfg = context.cfg;
		const agentId = resolveAgentIdFromSessionKey(event.sessionKey);
		const workspaceDir = cfg ? resolveAgentWorkspaceDir(cfg, agentId) : path.join(resolveStateDir(process.env, os.homedir), "workspace");
		const memoryDir = path.join(workspaceDir, "memory");
		await fs.mkdir(memoryDir, { recursive: true });
		const now = new Date(event.timestamp);
		const dateStr = now.toISOString().split("T")[0];
		const sessionEntry = context.previousSessionEntry || context.sessionEntry || {};
		const currentSessionId = sessionEntry.sessionId;
		let currentSessionFile = sessionEntry.sessionFile || void 0;
		if (!currentSessionFile || currentSessionFile.includes(".reset.")) {
			const sessionsDirs = /* @__PURE__ */ new Set();
			if (currentSessionFile) sessionsDirs.add(path.dirname(currentSessionFile));
			sessionsDirs.add(path.join(workspaceDir, "sessions"));
			for (const sessionsDir of sessionsDirs) {
				const recoveredSessionFile = await findPreviousSessionFile({
					sessionsDir,
					currentSessionFile,
					sessionId: currentSessionId
				});
				if (!recoveredSessionFile) continue;
				currentSessionFile = recoveredSessionFile;
				log.debug("Found previous session file", { file: currentSessionFile });
				break;
			}
		}
		log.debug("Session context resolved", {
			sessionId: currentSessionId,
			sessionFile: currentSessionFile,
			hasCfg: Boolean(cfg)
		});
		const sessionFile = currentSessionFile || void 0;
		const hookConfig = resolveHookConfig(cfg, "session-memory");
		const messageCount = typeof hookConfig?.messages === "number" && hookConfig.messages > 0 ? hookConfig.messages : 15;
		let slug = null;
		let sessionContent = null;
		if (sessionFile) {
			sessionContent = await getRecentSessionContentWithResetFallback(sessionFile, messageCount);
			log.debug("Session content loaded", {
				length: sessionContent?.length ?? 0,
				messageCount
			});
			const allowLlmSlug = !(process.env.OPENCLAW_TEST_FAST === "1" || process.env.VITEST === "true" || process.env.VITEST === "1" || false) && hookConfig?.llmSlug !== false;
			if (sessionContent && cfg && allowLlmSlug) {
				log.debug("Calling generateSlugViaLLM...");
				slug = await generateSlugViaLLM({
					sessionContent,
					cfg
				});
				log.debug("Generated slug", { slug });
			}
		}
		if (!slug) {
			slug = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "").slice(0, 4);
			log.debug("Using fallback timestamp slug", { slug });
		}
		const filename = `${dateStr}-${slug}.md`;
		const memoryFilePath = path.join(memoryDir, filename);
		log.debug("Memory file path resolved", {
			filename,
			path: memoryFilePath.replace(os.homedir(), "~")
		});
		const timeStr = now.toISOString().split("T")[1].split(".")[0];
		const sessionId = sessionEntry.sessionId || "unknown";
		const source = context.commandSource || "unknown";
		const entryParts = [
			`# Session: ${dateStr} ${timeStr} UTC`,
			"",
			`- **Session Key**: ${event.sessionKey}`,
			`- **Session ID**: ${sessionId}`,
			`- **Source**: ${source}`,
			""
		];
		if (sessionContent) entryParts.push("## Conversation Summary", "", sessionContent, "");
		const entry = entryParts.join("\n");
		await fs.writeFile(memoryFilePath, entry, "utf-8");
		log.debug("Memory file written successfully");
		const relPath = memoryFilePath.replace(os.homedir(), "~");
		log.info(`Session context saved to ${relPath}`);
	} catch (err) {
		if (err instanceof Error) log.error("Failed to save session memory", {
			errorName: err.name,
			errorMessage: err.message,
			stack: err.stack
		});
		else log.error("Failed to save session memory", { error: String(err) });
	}
};

//#endregion
export { saveSessionToMemory as default };