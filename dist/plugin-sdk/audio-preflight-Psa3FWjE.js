import "./accounts-C1td8VOK.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./config-BoilMlyN.js";
import { $ as logVerbose, nt as shouldLogVerbose } from "./subsystem-C2adF5U4.js";
import "./command-format-DgW0zcnY.js";
import "./agent-scope-CaSC-F0Q.js";
import "./dock-LzHW_NUi.js";
import "./message-channel-_8C-3P4l.js";
import "./sessions-CVjUfM8c.js";
import "./plugins-XdL_ypt5.js";
import "./accounts-BuAOy3Oo.js";
import "./accounts-JKASFmQu.js";
import "./bindings-tMDPI0GT.js";
import "./paths-DZWyiSKp.js";
import "./redact-C2izRKIZ.js";
import "./errors-Cp45HswL.js";
import "./path-alias-guards-YX1NmgDL.js";
import "./fs-safe-iLrigmbJ.js";
import "./image-ops-BFwv1Vgz.js";
import "./ssrf-BnbpZtKD.js";
import "./fetch-guard-DZV5mtWx.js";
import "./local-roots-C7o2D03h.js";
import "./tool-images-BfzZwop2.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-DjOBBqY4.js";
import "./skills-CzL77Q-C.js";
import "./chrome-DpIO-lTH.js";
import "./store-CbJtVMcX.js";
import "./pi-embedded-helpers-DHnXlCW-.js";
import "./thinking-BubZBaau.js";
import "./image-BeO3wcN6.js";
import "./pi-model-discovery-Ccb_1W-1.js";
import "./api-key-rotation-CpEJhfrp.js";

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