import "./paths-B4BZAPZh.js";
import "./utils-BKDT474X.js";
import "./subsystem-DFF5bJzM.js";
import "./diagnostic-session-state-3TH9GUxo.js";
import { a as logMessageQueued, c as logToolLoopAction, d as logWebhookReceived, f as startDiagnosticHeartbeat, i as logMessageProcessed, l as logWebhookError, n as logLaneDequeue, o as logSessionStateChange, p as stopDiagnosticHeartbeat, r as logLaneEnqueue, s as logSessionStuck, t as diag, u as logWebhookProcessed } from "./diagnostic-ChAW0VNc.js";

//#region src/browser/pw-ai-state.ts
let pwAiLoaded = false;
function markPwAiLoaded() {
	pwAiLoaded = true;
}
function isPwAiLoaded() {
	return pwAiLoaded;
}

//#endregion
export { logToolLoopAction, markPwAiLoaded as n, isPwAiLoaded as t };