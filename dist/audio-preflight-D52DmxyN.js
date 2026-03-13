import "./paths-DT-163rP.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-CMcdOpPO.js";
import "./agent-scope-BQNab8SK.js";
import "./workspace-CHmqKFRC.js";
import "./model-selection-BePWPcm7.js";
import "./github-copilot-token-CPyffhi6.js";
import "./env-Dt2Dn7RT.js";
import "./boolean-B8-BqKGQ.js";
import "./dock-DFL5XiTL.js";
import "./plugins-j4J-TqKL.js";
import "./accounts-BoIFYQrc.js";
import "./bindings-DtW2SjVE.js";
import "./accounts-B8BQuZyT.js";
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
import "./gemini-auth-BntG65N2.js";
import "./fetch-guard-BegZ34Sq.js";
import "./local-roots-fEwjVBS1.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-B-3BrZH-.js";

//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	const audioConfig = cfg.tools?.media?.audio;
	if (!audioConfig || audioConfig.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	const providerRegistry = buildProviderRegistry(params.providers);
	const cache = createMediaAttachmentCache(attachments, { localPathRoots: resolveMediaAttachmentLocalRoots({
		cfg,
		ctx
	}) });
	try {
		const result = await runCapability({
			capability: "audio",
			cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config: audioConfig,
			activeModel: params.activeModel
		});
		if (!result || result.outputs.length === 0) return;
		const audioOutput = result.outputs.find((output) => output.kind === "audio.transcription");
		if (!audioOutput || !audioOutput.text) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${audioOutput.text.length} chars from attachment ${firstAudio.index}`);
		return audioOutput.text;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	} finally {
		await cache.cleanup();
	}
}

//#endregion
export { transcribeFirstAudio };