import "./paths-B4BZAPZh.js";
import { B as theme, R as colorize, S as shortenHomePath, z as isRich } from "./utils-BKDT474X.js";
import "./subsystem-DFF5bJzM.js";
import "./openclaw-root-CiXMCkaN.js";
import "./exec-D3xDF_CZ.js";
import "./agent-scope-BTkaxOmC.js";
import { Bt as readConfigFileSnapshot } from "./model-selection-CTrlAwmO.js";
import "./github-copilot-token-DaPBqE1w.js";
import { t as formatCliCommand } from "./command-format-Gp1OUMPH.js";
import "./boolean-BsqeuxE6.js";
import "./env-BIrAaG_2.js";
import "./host-env-security-DkAVVuaw.js";
import "./env-vars-CgBIXgEO.js";
import "./manifest-registry-Mi9bZrvb.js";
import "./dock-DZMW4XtF.js";
import "./message-channel-AiWnTVRO.js";
import "./sessions-B4xDFQR-.js";
import "./plugins-D6GIpFVm.js";
import "./accounts-_D91lwNC.js";
import "./accounts-JI0F4PVp.js";
import "./accounts-Ck1_o2aD.js";
import "./bindings-BHOprCZK.js";
import "./logging-q4KyMmY-.js";
import "./paths-ypkxllDe.js";
import "./chat-envelope-84JC1yYX.js";
import "./pairing-store-BCqWk39d.js";
import "./exec-approvals-allowlist-Kryolpu6.js";
import "./exec-safe-bin-runtime-policy-7XHAxdLu.js";
import "./plugin-auto-enable-xHF0-t-L.js";
import "./prompt-style-CWQwG24s.js";
import { c as shouldMigrateStateFromPath } from "./argv-DE3XSBsB.js";
import "./note-D7xXLVwQ.js";
import { t as loadAndMaybeMigrateDoctorConfig } from "./doctor-config-flow-Dcfhdlar.js";

//#region src/cli/program/config-guard.ts
const ALLOWED_INVALID_COMMANDS = new Set([
	"doctor",
	"logs",
	"health",
	"help",
	"status"
]);
const ALLOWED_INVALID_GATEWAY_SUBCOMMANDS = new Set([
	"status",
	"probe",
	"health",
	"discover",
	"call",
	"install",
	"uninstall",
	"start",
	"stop",
	"restart"
]);
let didRunDoctorConfigFlow = false;
let configSnapshotPromise = null;
function formatConfigIssues(issues) {
	return issues.map((issue) => `- ${issue.path || "<root>"}: ${issue.message}`);
}
async function getConfigSnapshot() {
	if (process.env.VITEST === "true") return readConfigFileSnapshot();
	configSnapshotPromise ??= readConfigFileSnapshot();
	return configSnapshotPromise;
}
async function ensureConfigReady(params) {
	const commandPath = params.commandPath ?? [];
	if (!didRunDoctorConfigFlow && shouldMigrateStateFromPath(commandPath)) {
		didRunDoctorConfigFlow = true;
		await loadAndMaybeMigrateDoctorConfig({
			options: { nonInteractive: true },
			confirm: async () => false
		});
	}
	const snapshot = await getConfigSnapshot();
	const commandName = commandPath[0];
	const subcommandName = commandPath[1];
	const allowInvalid = commandName ? ALLOWED_INVALID_COMMANDS.has(commandName) || commandName === "gateway" && subcommandName && ALLOWED_INVALID_GATEWAY_SUBCOMMANDS.has(subcommandName) : false;
	const issues = snapshot.exists && !snapshot.valid ? formatConfigIssues(snapshot.issues) : [];
	const legacyIssues = snapshot.legacyIssues.length > 0 ? snapshot.legacyIssues.map((issue) => `- ${issue.path}: ${issue.message}`) : [];
	if (!(snapshot.exists && !snapshot.valid)) return;
	const rich = isRich();
	const muted = (value) => colorize(rich, theme.muted, value);
	const error = (value) => colorize(rich, theme.error, value);
	const heading = (value) => colorize(rich, theme.heading, value);
	const commandText = (value) => colorize(rich, theme.command, value);
	params.runtime.error(heading("Config invalid"));
	params.runtime.error(`${muted("File:")} ${muted(shortenHomePath(snapshot.path))}`);
	if (issues.length > 0) {
		params.runtime.error(muted("Problem:"));
		params.runtime.error(issues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	if (legacyIssues.length > 0) {
		params.runtime.error(muted("Legacy config keys detected:"));
		params.runtime.error(legacyIssues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	params.runtime.error("");
	params.runtime.error(`${muted("Run:")} ${commandText(formatCliCommand("openclaw doctor --fix"))}`);
	if (!allowInvalid) params.runtime.exit(1);
}

//#endregion
export { ensureConfigReady };