import "./paths-Dg6SzpoG.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-BzGKk21R.js";
import "./agent-scope-D-SAXtW_.js";
import "./workspace-DjEQdnLR.js";
import "./model-selection-DidWO7pj.js";
import "./github-copilot-token-Bjf9aOff.js";
import "./env-CArf5gzS.js";
import "./boolean-B8-BqKGQ.js";
import "./dock-DZJSwfqZ.js";
import "./plugins-D0usDiyn.js";
import "./accounts-DXuDcELE.js";
import "./bindings-5wQ3Fjkb.js";
import "./accounts-JSCHvIBq.js";
import "./image-ops-BXPPe9uL.js";
import "./pi-model-discovery-CohNYLo2.js";
import "./message-channel-UyfQl7vz.js";
import "./pi-embedded-helpers-D282kGUH.js";
import "./chrome-DtJEjkZI.js";
import "./ssrf-BxZxJnIQ.js";
import "./frontmatter-CLmvXLpu.js";
import "./skills-BVBswPZz.js";
import "./path-alias-guards-W6i8bfXf.js";
import "./redact-ClQ9Ntq0.js";
import "./errors-3BnVEQLQ.js";
import "./fs-safe-D8QNAkA-.js";
import "./store-CdHggK1c.js";
import "./sessions-CxxQBjtn.js";
import "./accounts-DAt1wJPl.js";
import "./paths-gCriChjX.js";
import "./tool-images-DVszX7z8.js";
import "./thinking-CjSkALRq.js";
import "./image-CHwLnfr0.js";
import "./gemini-auth-Cs6h6SAc.js";
import "./fetch-guard-BgDpYrkb.js";
import "./local-roots-cDZoiWl_.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-B_kCQBgR.js";

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