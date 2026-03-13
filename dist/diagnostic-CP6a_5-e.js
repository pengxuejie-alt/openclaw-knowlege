import { a as logMessageQueued, c as logToolLoopAction, d as logWebhookReceived, f as startDiagnosticHeartbeat, i as logMessageProcessed, l as logWebhookError, n as logLaneDequeue, o as logSessionStateChange, p as stopDiagnosticHeartbeat, r as logLaneEnqueue, s as logSessionStuck, t as diag, u as logWebhookProcessed } from "./diagnostic-3R7EyDo2.js";
import "./diagnostic-session-state-cwjDplnM.js";

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