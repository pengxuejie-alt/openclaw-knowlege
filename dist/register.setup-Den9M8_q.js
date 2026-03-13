import { Ot as theme, ut as shortenHomePath, v as defaultRuntime } from "./entry.js";
import { A as createConfigIO, L as writeConfigFile } from "./auth-profiles-0NafhXwT.js";
import "./openclaw-root-jpxkdOqd.js";
import "./exec-DanmqEBd.js";
import { E as ensureAgentWorkspace, _ as DEFAULT_AGENT_WORKSPACE_DIR } from "./agent-scope-DIyeRIwV.js";
import "./github-copilot-token-q57TYcbJ.js";
import "./host-env-security-VbAkcANc.js";
import "./env-vars-DuCByIOF.js";
import "./manifest-registry-HCsle6hF.js";
import "./dock-BQCVKcZL.js";
import "./message-channel-CxHKaTgX.js";
import "./sessions-Bp3qR6Tw.js";
import "./plugins-m9MqVmdr.js";
import "./accounts-B2kIp6qA.js";
import "./accounts-DUsGdKnq.js";
import "./accounts-BNLQbNiM.js";
import "./bindings-ByCIQwuN.js";
import "./logging-Bgrm4o7g.js";
import { s as resolveSessionTranscriptsDir } from "./paths-BvPCP-jf.js";
import "./chat-envelope-BbjUfSpL.js";
import "./client-BqUbcbV8.js";
import "./call-BP9ziIDj.js";
import "./pairing-token-SouSrG_r.js";
import "./net-gZV4PaxN.js";
import "./ip-DZF2tb1n.js";
import "./tailnet-DlV_mHNG.js";
import "./redact-6vvLhMiY.js";
import "./errors-27FEsju9.js";
import { t as formatDocsLink } from "./links-BXWkrGr8.js";
import { n as runCommandWithRuntime } from "./cli-utils-BlFG2Sa_.js";
import "./progress-CrCu56Pm.js";
import "./onboard-helpers-B0Dw__Bi.js";
import "./prompt-style-BIi-Kp_L.js";
import { t as hasExplicitOptions } from "./command-options-BkTXKWlb.js";
import "./note-D1bhXJGh.js";
import "./clack-prompter-CUBsIOfB.js";
import "./runtime-guard-Bxkrgx8-.js";
import "./onboarding-DhmdQSxU.js";
import { n as logConfigUpdated, t as formatConfigPath } from "./logging-DEdvCpbB.js";
import { t as onboardCommand } from "./onboard-DVfFSigY.js";
import JSON5 from "json5";
import fs from "node:fs/promises";

//#region src/commands/setup.ts
async function readConfigFileRaw(configPath) {
	try {
		const raw = await fs.readFile(configPath, "utf-8");
		const parsed = JSON5.parse(raw);
		if (parsed && typeof parsed === "object") return {
			exists: true,
			parsed
		};
		return {
			exists: true,
			parsed: {}
		};
	} catch {
		return {
			exists: false,
			parsed: {}
		};
	}
}
async function setupCommand(opts, runtime = defaultRuntime) {
	const desiredWorkspace = typeof opts?.workspace === "string" && opts.workspace.trim() ? opts.workspace.trim() : void 0;
	const configPath = createConfigIO().configPath;
	const existingRaw = await readConfigFileRaw(configPath);
	const cfg = existingRaw.parsed;
	const defaults = cfg.agents?.defaults ?? {};
	const workspace = desiredWorkspace ?? defaults.workspace ?? DEFAULT_AGENT_WORKSPACE_DIR;
	const next = {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				workspace
			}
		}
	};
	if (!existingRaw.exists || defaults.workspace !== workspace) {
		await writeConfigFile(next);
		if (!existingRaw.exists) runtime.log(`Wrote ${formatConfigPath(configPath)}`);
		else logConfigUpdated(runtime, {
			path: configPath,
			suffix: "(set agents.defaults.workspace)"
		});
	} else runtime.log(`Config OK: ${formatConfigPath(configPath)}`);
	const ws = await ensureAgentWorkspace({
		dir: workspace,
		ensureBootstrapFiles: !next.agents?.defaults?.skipBootstrap
	});
	runtime.log(`Workspace OK: ${shortenHomePath(ws.dir)}`);
	const sessionsDir = resolveSessionTranscriptsDir();
	await fs.mkdir(sessionsDir, { recursive: true });
	runtime.log(`Sessions OK: ${shortenHomePath(sessionsDir)}`);
}

//#endregion
//#region src/cli/program/register.setup.ts
function registerSetupCommand(program) {
	program.command("setup").description("Initialize ~/.openclaw/openclaw.json and the agent workspace").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/setup", "docs.openclaw.ai/cli/setup")}\n`).option("--workspace <dir>", "Agent workspace directory (default: ~/.openclaw/workspace; stored as agents.defaults.workspace)").option("--wizard", "Run the interactive onboarding wizard", false).option("--non-interactive", "Run the wizard without prompts", false).option("--mode <mode>", "Wizard mode: local|remote").option("--remote-url <url>", "Remote Gateway WebSocket URL").option("--remote-token <token>", "Remote Gateway token (optional)").action(async (opts, command) => {
		await runCommandWithRuntime(defaultRuntime, async () => {
			const hasWizardFlags = hasExplicitOptions(command, [
				"wizard",
				"nonInteractive",
				"mode",
				"remoteUrl",
				"remoteToken"
			]);
			if (opts.wizard || hasWizardFlags) {
				await onboardCommand({
					workspace: opts.workspace,
					nonInteractive: Boolean(opts.nonInteractive),
					mode: opts.mode,
					remoteUrl: opts.remoteUrl,
					remoteToken: opts.remoteToken
				}, defaultRuntime);
				return;
			}
			await setupCommand({ workspace: opts.workspace }, defaultRuntime);
		});
	});
}

//#endregion
export { registerSetupCommand };