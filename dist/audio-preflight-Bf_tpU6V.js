import "./paths-B4BZAPZh.js";
import { F as shouldLogVerbose, M as logVerbose } from "./utils-BKDT474X.js";
import "./thinking-EAliFiVK.js";
import "./subsystem-DFF5bJzM.js";
import "./openclaw-root-CiXMCkaN.js";
import "./exec-D3xDF_CZ.js";
import "./agent-scope-BTkaxOmC.js";
import "./model-selection-CTrlAwmO.js";
import "./github-copilot-token-DaPBqE1w.js";
import "./boolean-BsqeuxE6.js";
import "./env-BIrAaG_2.js";
import "./host-env-security-DkAVVuaw.js";
import "./env-vars-CgBIXgEO.js";
import "./manifest-registry-Mi9bZrvb.js";
import "./dock-DZMW4XtF.js";
import "./message-channel-AiWnTVRO.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-BZJafbVt.js";
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
import "./paths-ypkxllDe.js";
import "./chat-envelope-84JC1yYX.js";
import "./tool-images-B-kGIr6q.js";
import "./tool-display-NVXMsqfs.js";
import "./fetch-guard-CJUaobd5.js";
import "./api-key-rotation-BvlVQC-S.js";
import "./local-roots-CDDI4IF2.js";
import "./model-catalog-Dlasm57b.js";

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