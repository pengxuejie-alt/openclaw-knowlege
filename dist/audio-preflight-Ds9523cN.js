import { Ct as shouldLogVerbose, bt as logVerbose } from "./entry.js";
import "./auth-profiles-0NafhXwT.js";
import "./openclaw-root-jpxkdOqd.js";
import "./exec-DanmqEBd.js";
import "./agent-scope-DIyeRIwV.js";
import "./github-copilot-token-q57TYcbJ.js";
import "./host-env-security-VbAkcANc.js";
import "./env-vars-DuCByIOF.js";
import "./manifest-registry-HCsle6hF.js";
import "./dock-BQCVKcZL.js";
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
import "./paths-BvPCP-jf.js";
import "./chat-envelope-BbjUfSpL.js";
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
import "./models-config-ChKtmyem.js";
import "./gemini-auth-CIslOHue.js";
import "./fetch-guard-DHsIRI5K.js";
import "./local-roots-DE_WZCbt.js";
import "./image-CeDDzVBN.js";
import "./tool-display-BoRynF3H.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-Ifho-pOe.js";
import "./model-catalog-DdcLYAX5.js";

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