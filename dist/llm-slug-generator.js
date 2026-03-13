import "./paths-DT-163rP.js";
import { t as createSubsystemLogger } from "./subsystem-CMcdOpPO.js";
import { a as resolveAgentEffectiveModelPrimary, c as resolveDefaultAgentId, i as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-BQNab8SK.js";
import "./workspace-CHmqKFRC.js";
import { bn as DEFAULT_PROVIDER, l as parseModelRef, yn as DEFAULT_MODEL } from "./model-selection-BePWPcm7.js";
import "./github-copilot-token-CPyffhi6.js";
import "./env-Dt2Dn7RT.js";
import "./boolean-B8-BqKGQ.js";
import "./dock-DFL5XiTL.js";
import "./tokens-usb4el5x.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-u5HNQ2Hm.js";
import "./plugins-j4J-TqKL.js";
import "./accounts-BoIFYQrc.js";
import "./bindings-DtW2SjVE.js";
import "./send-C0mzIVbY.js";
import "./send-HCjwCS4v.js";
import "./deliver-CHUlvThm.js";
import "./diagnostic-BZYI2Sqe.js";
import "./diagnostic-session-state-DUn6VCV7.js";
import "./accounts-B8BQuZyT.js";
import "./send-Mv_ibioR.js";
import "./image-ops-Q_cU51BF.js";
import "./pi-model-discovery-CfcQmiIR.js";
import "./message-channel-CiG3G8su.js";
import "./pi-embedded-helpers-BkH8-lTB.js";
import "./chrome-DSFFOhwW.js";
import "./ssrf-BxZxJnIQ.js";
import "./frontmatter-B5AvVwkM.js";
import "./skills-cRDIHh65.js";
import "./path-alias-guards-_9Mly35h.js";
import "./redact-B_5AbrxJ.js";
import "./errors-DIKV1Hxy.js";
import "./fs-safe-D0kKN72T.js";
import "./store-Dp6JbUV_.js";
import "./sessions-DkLqAtd0.js";
import "./accounts-NKIG2Jmd.js";
import "./paths-BWEsRo1s.js";
import "./tool-images-D37kJbRl.js";
import "./thinking-CjSkALRq.js";
import "./image-Bbkg75Vi.js";
import "./reply-prefix-D8VypbLg.js";
import "./manager-DmPHR39K.js";
import "./gemini-auth-BntG65N2.js";
import "./fetch-guard-BegZ34Sq.js";
import "./query-expansion-CbnwL7Zr.js";
import "./retry-JIBgIh1D.js";
import "./target-errors-DJD0gKJ1.js";
import "./chunk-BS0ILAET.js";
import "./markdown-tables-B6CF3Qb6.js";
import "./local-roots-fEwjVBS1.js";
import "./ir-Cd_MDDrA.js";
import "./render-D7n7kmbn.js";
import "./commands-registry-dP7t3kvk.js";
import "./skill-commands-AM2dwsy_.js";
import "./runner-B-3BrZH-.js";
import "./fetch-Ch7M-Dwm.js";
import "./channel-activity-CvnXZzPW.js";
import "./tables-BMhT6t0g.js";
import "./send-Df2AHcVo.js";
import "./outbound-attachment-DVA1lNII.js";
import "./send-CK4IZ3mB.js";
import "./resolve-route-C4_56mR0.js";
import "./proxy-moRaHw9F.js";
import "./replies-B1KbzRTC.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
const log = createSubsystemLogger("llm-slug-generator");
/**
* Generate a short 1-2 word filename slug from session content using LLM
*/
async function generateSlugViaLLM(params) {
	let tempSessionFile = null;
	try {
		const agentId = resolveDefaultAgentId(params.cfg);
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		const agentDir = resolveAgentDir(params.cfg, agentId);
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-slug-"));
		tempSessionFile = path.join(tempDir, "session.jsonl");
		const prompt = `Based on this conversation, generate a short 1-2 word filename slug (lowercase, hyphen-separated, no file extension).

Conversation summary:
${params.sessionContent.slice(0, 2e3)}

Reply with ONLY the slug, nothing else. Examples: "vendor-pitch", "api-design", "bug-fix"`;
		const modelRef = resolveAgentEffectiveModelPrimary(params.cfg, agentId);
		const parsed = modelRef ? parseModelRef(modelRef, DEFAULT_PROVIDER) : null;
		const provider = parsed?.provider ?? DEFAULT_PROVIDER;
		const model = parsed?.model ?? DEFAULT_MODEL;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			provider,
			model,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		const message = err instanceof Error ? err.stack ?? err.message : String(err);
		log.error(`Failed to generate slug: ${message}`);
		return null;
	} finally {
		if (tempSessionFile) try {
			await fs.rm(path.dirname(tempSessionFile), {
				recursive: true,
				force: true
			});
		} catch {}
	}
}

//#endregion
export { generateSlugViaLLM };