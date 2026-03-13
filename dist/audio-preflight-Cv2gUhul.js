import "./paths-CooyrpXL.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-BXVThTnS.js";
import "./agent-scope-BWYUfj03.js";
import "./model-selection-D_iCxsDp.js";
import "./github-copilot-token-CNv9TgIm.js";
import "./env-7gvr9XcN.js";
import "./dock-C83ncPCw.js";
import "./plugins-Ckr1zdmx.js";
import "./accounts-T0CjuSdA.js";
import "./bindings-Bd1O9Rge.js";
import "./accounts-BwyoMSca.js";
import "./image-ops-wCrItz9h.js";
import "./pi-model-discovery-DsQpLIUL.js";
import "./message-channel-CEUWPYmj.js";
import "./pi-embedded-helpers-otx4TRmT.js";
import "./chrome-Dqo4SJAC.js";
import "./ssrf-GR1wTjsC.js";
import "./skills-DPQbg2ES.js";
import "./path-alias-guards-Cgk53A10.js";
import "./redact-BtsNHABI.js";
import "./errors-BNFMVSQh.js";
import "./fs-safe-Dq_gxeht.js";
import "./store-Ba77BlnR.js";
import "./sessions-BW7zDpIh.js";
import "./accounts-dN0FFL_4.js";
import "./paths-B5vK0uTL.js";
import "./tool-images-By6DFC0G.js";
import "./thinking-Ds6fxj9u.js";
import "./image-Mf8OdLzj.js";
import "./gemini-auth-BQbEXW01.js";
import "./fetch-guard-CrO49ReY.js";
import "./local-roots-DsNqUKbE.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-CJM0t9q4.js";

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