import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";

//#region src/config/model-input.ts
var model_input_exports = /* @__PURE__ */ __exportAll({
	resolveAgentModelFallbackValues: () => resolveAgentModelFallbackValues,
	resolveAgentModelPrimaryValue: () => resolveAgentModelPrimaryValue,
	toAgentModelListLike: () => toAgentModelListLike
});
function resolveAgentModelPrimaryValue(model) {
	if (typeof model === "string") return model.trim() || void 0;
	if (!model || typeof model !== "object") return;
	return model.primary?.trim() || void 0;
}
function resolveAgentModelFallbackValues(model) {
	if (!model || typeof model !== "object") return [];
	return Array.isArray(model.fallbacks) ? model.fallbacks : [];
}
function toAgentModelListLike(model) {
	if (typeof model === "string") {
		const primary = model.trim();
		return primary ? { primary } : void 0;
	}
	if (!model || typeof model !== "object") return;
	return model;
}

//#endregion
export { toAgentModelListLike as i, resolveAgentModelFallbackValues as n, resolveAgentModelPrimaryValue as r, model_input_exports as t };