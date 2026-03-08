import type { IncidentScenario } from './types';

export const knightCapitalScenario: IncidentScenario = {
    id: "knight-capital-2012",
    title: "Knight Capital Group 2012",
    company: "Knight Capital",
    date: "2012-08-01",
    impactSummary: "$440 Million lost in 45 minutes",
    difficulty: "HARD",
    tags: ["deployment_mismatch", "human_error"],
    thresholdLoss: 440000000,
    initialStateId: "S_NORMAL",
    states: {
        "S_NORMAL": {
            id: "S_NORMAL",
            description: "Market hasn't opened yet. Systems are green across the board.",
            metrics: {
                burnRatePerSec: 0,
                latencyMs: 15,
                errorRate: 0.01
            },
            logs: ["[INFO] All systems GO.", "[INFO] Standing by for market open."],
            availableActionIds: [],
            autoTransition: { stateId: "S0", durationSeconds: 3 }
        },
        "S0": {
            id: "S0",
            description: "Market just opened. Order volume is spiking 10,000%. Your SMARS router is exhibiting strange behavior.",
            metrics: {
                burnRatePerSec: 162962, // Roughly $440M / 45 mins
                latencyMs: 1200,
                errorRate: 85
            },
            codeSnippet: "/* \n * Routing Engine Execution Flag\n * Migrated: 2003-11-04\n */\nif (featureFlag == 1) {\n  init_power_peg_subroutine(&trade_context);\n  execute_trade_batch(); \n}",
            logs: ["[WARN] High volume limit violations detected on NYSE.", "[INFO] SMARS routing engine engaged."],
            alerts: [
                { id: "a1", type: "pagerduty", message: "CRITICAL: NYSE routing limits exceeded 15x normal volume.", triggerAfterSeconds: 5 },
                { id: "a2", type: "slack", message: "CEO: What the hell is going on with our capital reserves? Stop the bleeding!", triggerAfterSeconds: 15 }
            ],
            availableActionIds: ["A_INSPECT_LOGS", "A_ROLLBACK_LATEST", "A_RESTART_SMARS"],
            hint: "Don't guess. Check the logs before rolling anything back or restarting."
        },
        "S1_LOGS_CHECKED": {
            id: "S1_LOGS_CHECKED",
            description: "Logs show millions of duplicate orders being routed to the BATS exchange in a continuous loop.",
            metrics: {
                burnRatePerSec: 162962,
                latencyMs: 1500,
                errorRate: 90
            },
            codeSnippet: "/* \n * Routing Engine Execution Flag\n * Migrated: 2003-11-04\n */\nif (featureFlag == 1) {\n  init_power_peg_subroutine(&trade_context);\n  execute_trade_batch(); \n}",
            logs: [
                "[ERROR] BATS exchange reporting limit violations",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[ROUTER_TX] BUY 1000 WCS @ 22.50 -- FILLED",
                "[CRITICAL] OOM warning on server 8"
            ],
            alerts: [
                { id: "a3", type: "system", message: "Network saturation reached 99.8%. External trading venues are blacklisting our IP.", triggerAfterSeconds: 3 },
                { id: "a4", type: "slack", message: "DevOps: Server 8 is pegging 100% CPU. Logs are moving too fast to read.", triggerAfterSeconds: 10 }
            ],
            availableActionIds: ["A_ROLLBACK_LATEST", "A_SHUTDOWN_MANUAL"],
            progressIndicator: "WARMER",
            hint: "The problem seems to be an old algorithm. Can you find its name in the code snippet?"
        },
        "S2_ROLLED_BACK": {
            id: "S2_ROLLED_BACK",
            description: "You uninstalled the new SMARS code from the 7 servers. The bleeding intensified! The remaining 8th server is now taking all the bad load.",
            metrics: {
                burnRatePerSec: 320000,
                latencyMs: 2500,
                errorRate: 99
            },
            logs: ["[FATAL] Unprecedented trade volume from Server 8", "[ERROR] Limit checks failing instantly."],
            alerts: [
                { id: "a5", type: "pagerduty", message: "INCIDENT ESCALATION: SEC inquiry initiated.", triggerAfterSeconds: 6 },
                { id: "a6", type: "slack", message: "CEO: WE ARE DOWN 200 MILLION. PULL THE PIXIE DUST OR WE ARE BANKRUPT.", triggerAfterSeconds: 12 }
            ],
            availableActionIds: ["A_SHUTDOWN_MANUAL", "A_INSPECT_SERVER_BINS", "A_RETRY_DEPLOYMENT"],
            progressIndicator: "COLDER",
            visualMode: "crash",
            hint: "We are hemorrhaging money! Shut down the connections NOW!"
        },
        "S3_TOTAL_FAILURE": {
            id: "S3_TOTAL_FAILURE",
            description: "You mistakenly deployed the invalid code onto the ONE server that was correctly handling traffic. The NYSE cut the connection instantly. We are bankrupt.",
            metrics: {
                burnRatePerSec: 0,
                latencyMs: 5000,
                errorRate: 100
            },
            logs: ["[FATAL] NYSE CONNECTION SEVERED", "[FATAL] ZERO OUTBOUND TRAFFIC."],
            availableActionIds: [],
            isTerminal: true,
            visualMode: "crash",
            progressIndicator: "COLDER"
        },
        "S_STABLE": {
            id: "S_STABLE",
            description: "You physically halted trading on the servers. The bleeding has ceased.",
            metrics: { burnRatePerSec: 0, latencyMs: 50, errorRate: 0 },
            availableActionIds: [],
            isTerminal: true
        }
    },
    actions: {
        "A_INSPECT_LOGS": { id: "A_INSPECT_LOGS", label: "Inspect Routing Logs", nextStateId: "S1_LOGS_CHECKED" },
        "A_ROLLBACK_LATEST": {
            id: "A_ROLLBACK_LATEST",
            label: "Rollback SMARS Deployment",
            nextStateId: "S2_ROLLED_BACK",
            severity: "BLUNDER",
            blastDescription: "Removed new code from 7 servers. All traffic is now hitting the rogue 8th server!"
        },
        "A_RESTART_SMARS": {
            id: "A_RESTART_SMARS",
            label: "Restart SMARS Service",
            nextStateId: "S0",
            severity: "RISKY"
        },
        "A_SHUTDOWN_MANUAL": {
            id: "A_SHUTDOWN_MANUAL",
            label: "Disconnect From Exchanges",
            nextStateId: "S_STABLE",
            requiresInput: "power peg",
            inputPrompt: "Identify the rogue algorithm name from the code snippet to force shutdown:"
        },
        "A_INSPECT_SERVER_BINS": { id: "A_INSPECT_SERVER_BINS", label: "Inspect Server Binaries", nextStateId: "S_STABLE" },
        "A_RETRY_DEPLOYMENT": {
            id: "A_RETRY_DEPLOYMENT",
            label: "Force Retry Deployment",
            nextStateId: "S3_TOTAL_FAILURE",
            severity: "BLUNDER",
            blastDescription: "You overwrote the only functioning server. Trading is forcibly halted by the SEC."
        }
    },
    postmortemData: {
        realRootCause: "A technician forgot to copy the new SMARS code to the 8th server during manual deployment. The old Power Peg code was accidentally activated by a repurposed feature flag.",
        lessonsLearned: "Automate deployments. Never repurpose old feature flags for new features. Delete dead code!",
        historicalTimeline: [
            "August 1, 9:30 AM: Market opens. Power Peg activates on 8th server.",
            "9:31 AM: 4 million trades executed in seconds.",
            "9:45 AM: Engineers rollback the 7 good servers to match the bad one, worsening the loop.",
            "10:15 AM: Knight Capital manually removes themselves from the market to stop the bleeding. $440M lost."
        ]
    }
};
