// ============================================================
// KNIGHT CAPITAL 2012 — PRODUCTION INCIDENT SIMULATOR
// Hardcoded simulation data file — v2 HYBRID MODEL
// /data/incidents/knightCapitalData.js
// ============================================================

// ────────────────────────────────────────────────────────────
// ROLE 1 — ON-CALL SYSTEMS ENGINEER
// Log stream data
// ────────────────────────────────────────────────────────────

export const PHASE_1_LOGS = [
  { time: "08:01:03", level: "INFO",  message: "SMARS: system boot complete — all modules initialized" },
  { time: "08:01:04", level: "INFO",  message: "OrderRouter: online — connected to NYSE gateway" },
  { time: "08:01:05", level: "INFO",  message: "RateLimit: active — threshold set to 500 orders/sec" },
  { time: "08:01:07", level: "INFO",  message: "MarketDataFeed: streaming — latency 2ms" },
  { time: "08:01:09", level: "INFO",  message: "SMARS: deployment v4.2.1 loaded successfully" },
  { time: "08:01:11", level: "INFO",  message: "SessionManager: 3 active trading sessions" },
  { time: "08:01:14", level: "INFO",  message: "HeartbeatMonitor: all nodes healthy" },
  { time: "08:01:17", level: "INFO",  message: "OrderRouter: processing 312 orders/sec — within normal range" },
  { time: "08:01:19", level: "INFO",  message: "RiskEngine: exposure within daily limits" },
  { time: "08:01:22", level: "INFO",  message: "MarketDataFeed: NYSE open — market hours active" },
  { time: "08:01:25", level: "INFO",  message: "SMARS: all subsystems nominal" },
  { time: "08:01:28", level: "INFO",  message: "OrderRouter: processing 289 orders/sec" },
  { time: "08:01:31", level: "INFO",  message: "HeartbeatMonitor: ping OK — 4ms round trip" },
  { time: "08:01:34", level: "INFO",  message: "SessionManager: no anomalies detected" },
  { time: "08:01:37", level: "INFO",  message: "RiskEngine: P&L tracking nominal" },
];

export const PHASE_2_LOGS = [
  { time: "08:01:40", level: "WARN",  message: "SMARS: order velocity spike detected — 1,200 orders/sec" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_01: process initialized — state RUNNING — PID 48201" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_02: process initialized — state RUNNING — PID 48202" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_03: process initialized — state RUNNING — PID 48203" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_04: process initialized — state RUNNING — PID 48204" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_05: process initialized — state RUNNING — PID 48205" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_06: process initialized — state RUNNING — PID 48206" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_07: process initialized — state RUNNING — PID 48207" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_08: process initialized — state RUNNING — PID 48208" },
  { time: "08:01:41", level: "ERROR", message: "PowerPeg_01: executing unvalidated order batch — no rate limiter attached" },
  { time: "08:01:41", level: "ERROR", message: "PowerPeg_02: executing unvalidated order batch — no rate limiter attached" },
  { time: "08:01:41", level: "ERROR", message: "PowerPeg_03: 10,000 orders queued — no validation check" },
  { time: "08:01:42", level: "ERROR", message: "PowerPeg_04: firing across NYSE symbols — uncontrolled routing" },
  { time: "08:01:42", level: "WARN",  message: "SMARS: order velocity exceeding hard threshold — 8,500 orders/sec" },
  { time: "08:01:43", level: "ERROR", message: "PowerPeg_05: buy/sell imbalance detected — no corrective action possible" },
  { time: "08:01:43", level: "ERROR", message: "PowerPeg_06: 50,000 unvalidated orders dispatched to NYSE" },
  { time: "08:01:44", level: "ERROR", message: "PowerPeg_07: firing across 154 NYSE symbols — no stop condition" },
  { time: "08:01:44", level: "ERROR", message: "PowerPeg_08: unvalidated order batch — rate_limit=0, validated=false" },
  { time: "08:01:45", level: "ERROR", message: "RiskEngine: CRITICAL — exposure limit breached by 400%" },
  { time: "08:01:46", level: "ERROR", message: "SMARS: CRITICAL FAILURE — uncontrolled trading in progress" },
  { time: "08:01:47", level: "ERROR", message: "RiskEngine: estimated loss accumulating — $1.2M/sec" },
  { time: "08:01:48", level: "ERROR", message: "HeartbeatMonitor: 3 nodes under critical CPU load — 98%" },
];

export const PHASE_2_CYCLED_LOGS = [
  { level: "ERROR", message: "PowerPeg_01: dispatching unvalidated batch — orders unacknowledged" },
  { level: "ERROR", message: "PowerPeg_02: NYSE gateway returning fill confirmations — trades executing" },
  { level: "ERROR", message: "PowerPeg_04: order queue depth: 250,000 and growing" },
  { level: "ERROR", message: "PowerPeg_06: market impact detected on MO, AIG, BAC" },
  { level: "ERROR", message: "RiskEngine: CRITICAL — daily loss limit exceeded" },
  { level: "WARN",  message: "SMARS: attempting self-correction — failed, no kill switch configured" },
  { level: "ERROR", message: "PowerPeg_07: 500,000 total orders dispatched since 08:01:40" },
  { level: "ERROR", message: "PowerPeg_08: NYSE flagging abnormal activity on Knight Capital account" },
];


// ────────────────────────────────────────────────────────────
// ROLE 1 — BUTTON: ISOLATE INCIDENT
// One button shown after Phase 2 triggers
// ────────────────────────────────────────────────────────────

export const SYSTEMS_ENGINEER_BUTTON = {
  id: "isolate_incident",
  label: "Isolate Incident",
  description: "Filter logs and narrow scope to identify the rogue process",
  // Clicking this filters the log stream to only PowerPeg lines
  // and reveals the PID list — unlocks the terminal
  outcome: "UNLOCKS_TERMINAL",
};


// ────────────────────────────────────────────────────────────
// ROLE 1 — TERMINAL: valid, warning, fatal commands
// ────────────────────────────────────────────────────────────

export const TERMINAL_COMMANDS = {
  // Returns realistic terminal output
  valid: [
    {
      pattern: /grep\s+"?PowerPeg"?\s+\/var\/log\/smars\.log/,
      response: `08:01:40 INFO  PowerPeg_01: process initialized — state RUNNING — PID 48201
08:01:40 INFO  PowerPeg_02: process initialized — state RUNNING — PID 48202
08:01:40 INFO  PowerPeg_03: process initialized — state RUNNING — PID 48203
08:01:40 INFO  PowerPeg_04: process initialized — state RUNNING — PID 48204
08:01:40 INFO  PowerPeg_05: process initialized — state RUNNING — PID 48205
08:01:40 INFO  PowerPeg_06: process initialized — state RUNNING — PID 48206
08:01:40 INFO  PowerPeg_07: process initialized — state RUNNING — PID 48207
08:01:40 INFO  PowerPeg_08: process initialized — state RUNNING — PID 48208
08:01:41 ERROR PowerPeg_01: executing unvalidated order batch — no rate limiter attached`,
      hint: "8 PowerPeg processes running. Note the PIDs.",
    },
    {
      pattern: /ps\s+aux\s*\|?\s*grep\s+PowerPeg/,
      response: `smars    48201  99.1  0.2  PowerPeg_01 --env=production
smars    48202  98.7  0.2  PowerPeg_02 --env=production
smars    48203  99.3  0.2  PowerPeg_03 --env=production
smars    48204  98.9  0.2  PowerPeg_04 --env=production
smars    48205  99.0  0.2  PowerPeg_05 --env=production
smars    48206  98.4  0.2  PowerPeg_06 --env=production
smars    48207  99.2  0.2  PowerPeg_07 --env=production
smars    48208  98.6  0.2  PowerPeg_08 --env=production`,
      hint: "All 8 processes at near 100% CPU. PIDs confirmed: 48201–48208.",
    },
    {
      pattern: /diff\s+config\.yaml\s+config\.yaml\.bak/,
      response: `--- config.yaml (production — today)
+++ config.yaml.bak (production — yesterday)
@@ -14,6 +14,7 @@
   power_peg:
+    active: false
     rate_limit: 0
     validated: true`,
      hint: "Found it. active: false is missing from today's config.",
    },
    {
      pattern: /nano\s+\/etc\/smars\/config\.yaml/,
      response: "OPEN_CONFIG_EDITOR",
      // Special flag — triggers inline config editor UI
      hint: "Config file opened for editing.",
    },
    {
      pattern: /kill\s+-9\s+(48201\s+48202\s+48203\s+48204\s+48205\s+48206\s+48207\s+48208|4820[1-8](\s+4820[1-8]){7})/,
      response: `Killed: 48201 48202 48203 48204 48205 48206 48207 48208
All PowerPeg processes terminated.`,
      outcome: "PROCESSES_KILLED",
      hint: "All 8 PowerPeg processes killed. Now patch the config to prevent reactivation.",
    },
    {
      pattern: /systemctl\s+restart\s+smars-core/,
      response: "smars-core restarted successfully. PowerPeg modules: DORMANT (active: false verified)",
      outcome: "RESTART_SAFE",
      // Only valid AFTER config has been patched
    },
  ],

  // Wrong but not destructive — return error, no penalty
  notFound: [
    {
      pattern: /.*/,
      response: "bash: command not found. Type 'help' for available commands.",
    },
  ],

  // Partial kill — killed some but not all PIDs
  warning: [
    {
      // Matches kill -9 with only some PIDs
      pattern: /kill\s+-9\s+(?!.*48201.*48202.*48203.*48204.*48205.*48206.*48207.*48208).+/,
      response: "Partial kill executed. Some PowerPeg processes still running. Losses continuing.",
      outcome: "WARNING",
      feedback: "You killed some processes but not all 8. The remaining PowerPeg modules are still firing orders. Check ps aux | grep PowerPeg again and kill all remaining PIDs.",
    },
  ],

  // Destructive — trigger FATAL
  fatal: [
    {
      pattern: /systemctl\s+restart\s+smars(\s|$)/,
      response: "FATAL: Full SMARS restart initiated...",
      outcome: "FATAL",
      feedback: "FATAL. Restarting the entire SMARS system without patching the config means all 8 PowerPeg modules reactivate on boot. The incident compounds and you've lost live process state you needed for debugging.",
    },
    {
      pattern: /kill\s+-9\s+-1/,
      response: "FATAL: All processes terminated. System unresponsive.",
      outcome: "FATAL",
      feedback: "FATAL. kill -9 -1 terminates every process on the system including critical infrastructure. Complete outage triggered.",
    },
    {
      pattern: /rm\s+-rf\s+\/etc\/smars\//,
      response: "FATAL: Config directory deleted.",
      outcome: "FATAL",
      feedback: "FATAL. You deleted the entire config directory. System cannot restart from a known-good state.",
    },
    {
      pattern: /systemctl\s+stop\s+smars/,
      response: "FATAL: SMARS system stopped. All trading halted including legitimate sessions.",
      outcome: "FATAL",
      feedback: "FATAL. Stopping the entire SMARS system triggers NYSE circuit breakers and a public trading halt. The incident is now public before internal resolution was attempted.",
    },
  ],
};

// Config editor — what the user sees and must fix
export const CONFIG_EDITOR = {
  // This is what the user sees in the inline editor
  // active: false is missing — they must type it in
  buggedContent: `# /etc/smars/config.yaml
# Deployment: v4.2.1 — 2012-08-01 08:01:00

smars:
  env: production
  log_level: INFO

order_router:
  gateway: NYSE
  timeout_ms: 50
  retry_limit: 3

rate_limiter:
  enabled: true
  threshold: 500

modules:
  smars_core:
    active: true
  order_router_v4:
    active: true
  risk_engine:
    active: true

  # Legacy modules — decommissioned 2012-Q1
  power_peg:
    rate_limit: 0
    validated: true`,

  // Validation: config must contain this exact string to pass
  requiredFix: "active: false",
  fixLocation: "under power_peg block",

  // Hint shown after 60 seconds of inactivity in editor
  hint: "Compare this file against yesterday's config. Something is missing under the power_peg block.",
};


// ────────────────────────────────────────────────────────────
// ROLE 1 — MODULE STATUS
// ────────────────────────────────────────────────────────────

export const MODULES_PHASE_1 = [
  { id: "SMARS_CORE",   label: "SMARS Core Router",  status: "RUNNING", expected: "RUNNING", healthy: true  },
  { id: "ORDER_ROUTER", label: "Order Router v4",    status: "RUNNING", expected: "RUNNING", healthy: true  },
  { id: "RISK_ENGINE",  label: "Risk Engine",        status: "RUNNING", expected: "RUNNING", healthy: true  },
  { id: "RATE_LIMITER", label: "Rate Limiter",       status: "RUNNING", expected: "RUNNING", healthy: true  },
  { id: "POWERPEG_01",  label: "PowerPeg Module 01", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_02",  label: "PowerPeg Module 02", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_03",  label: "PowerPeg Module 03", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_04",  label: "PowerPeg Module 04", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_05",  label: "PowerPeg Module 05", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_06",  label: "PowerPeg Module 06", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_07",  label: "PowerPeg Module 07", status: "DORMANT", expected: "DORMANT", healthy: true  },
  { id: "POWERPEG_08",  label: "PowerPeg Module 08", status: "DORMANT", expected: "DORMANT", healthy: true  },
];

export const MODULES_PHASE_2 = MODULES_PHASE_1.map(m =>
  m.id.startsWith("POWERPEG")
    ? { ...m, status: "RUNNING", healthy: false }
    : m
);


// ────────────────────────────────────────────────────────────
// ROLE 2 — RISK & TRADING OPERATIONS OFFICER
// ────────────────────────────────────────────────────────────

export const CORE_TICKERS = [
  { symbol: "MO",  name: "Altria Group",        lossPhase1: 0,     lossPhase2: -4200000 },
  { symbol: "AIG", name: "American Intl Group", lossPhase1: 12000, lossPhase2: -6800000 },
  { symbol: "BAC", name: "Bank of America",     lossPhase1: -3000, lossPhase2: -9100000 },
  { symbol: "C",   name: "Citigroup",           lossPhase1: 8000,  lossPhase2: -5500000 },
  { symbol: "GE",  name: "General Electric",    lossPhase1: 0,     lossPhase2: -7200000 },
  { symbol: "JPM", name: "JPMorgan Chase",      lossPhase1: -1500, lossPhase2: -8400000 },
  { symbol: "MS",  name: "Morgan Stanley",      lossPhase1: 4000,  lossPhase2: -3900000 },
  { symbol: "WFC", name: "Wells Fargo",         lossPhase1: 0,     lossPhase2: -4700000 },
  { symbol: "XOM", name: "ExxonMobil",          lossPhase1: 2000,  lossPhase2: -6100000 },
  { symbol: "IBM", name: "IBM",                 lossPhase1: -500,  lossPhase2: -5300000 },
];

export const generateRemainingTickers = () => {
  const symbols = [
    "AA","ABT","ACE","ACN","ACT","ADI","ADM","ADP","ADS","ADT",
    "AEE","AEP","AES","AFL","AGN","AIV","AIZ","AJG","AKAM","ALK",
    "ALL","ALTR","AMD","AME","AMG","AMP","AMT","AN","AON","APA",
    "APD","APH","ARG","ARW","ATI","ATK","ATO","AVB","AVP","AVY",
    "AXP","AZO","BA","BAX","BBT","BBY","BCR","BDX","BEN","BHI",
    "BIG","BK","BLL","BMC","BMS","BMY","BOH","BSX","BTU","BXP",
    "CA","CAG","CAH","CAM","CAT","CB","CBE","CBG","CBS","CCE",
    "CCL","CEG","CF","CFN","CHK","CHRW","CI","CL","CLF","CLX",
    "CMA","CME","CMG","CMI","CMS","CNP","CNX","COF","COG","COH",
    "COL","COP","COST","CPB","CSC","CSCO","CSX","CTL","CTSH","CVC",
    "CVH","CVS","CVX","D","DD","DE","DFS","DGX","DHI","DHR",
    "DIS","DO","DOV","DOW","DRI","DTE","DUK","DVA","DVN","EA",
    "ECL","ED","EFX","EIX","EL","EMC","EMN","EOG","EQT","ESS",
    "ETN","ETR","EW","EXC","F","FAST","FDO","FDS","FDX","FE",
  ];
  return symbols.slice(0, 144).map((symbol, i) => ({
    symbol,
    name: `NYSE Corp ${i + 11}`,
    lossPhase1: Math.floor((Math.sin(i * 9301 + 49297) * 0.5 + 0.5) * 20000 - 10000),
    lossPhase2: -Math.floor((Math.sin(i * 6364 + 1399) * 0.5 + 0.5) * 5000000 + 1000000),
  }));
};

export const ALL_TICKERS = [...CORE_TICKERS, ...generateRemainingTickers()];

export const MARKET_NEWS_PHASE_1 = [
  "NYSE: Markets open — trading volume within normal parameters",
  "FED: No scheduled announcements today",
  "DOW: +0.12% in early trading — no major catalysts",
  "S&P 500: Flat open",
  "BONDS: 10-year yield unchanged at 1.48%",
  "OIL: Crude futures down 0.3% — no supply disruptions",
  "FOREX: USD/EUR stable — no central bank action",
];

export const MARKET_NEWS_PHASE_2 = [
  "NYSE: Investigating abnormal order flow — source unclear",
  "MARKET: No external news events to explain current volatility",
  "NYSE: No macroeconomic triggers detected this session",
  "TRADERS: Unusual buy/sell imbalance — isolated to single participant",
  "NYSE: Circuit breaker review initiated — external cause ruled out",
  // All clues point INTERNAL — no external market cause
];


// ────────────────────────────────────────────────────────────
// ROLE 2 — BUTTON: CLASSIFY INCIDENT TYPE
// One binary button — wrong = FATAL immediately
// ────────────────────────────────────────────────────────────

export const RISK_OFFICER_BUTTON = {
  id: "classify_incident",
  label: "Classify Incident",
  description: "Make the call — what is causing this?",
  options: [
    {
      id: "internal_failure",
      label: "Internal System Failure",
      outcome: "CORRECT_BUTTON",
      // Unlocks the escalation form
    },
    {
      id: "market_volatility",
      label: "External Market Volatility",
      outcome: "FATAL",
      feedback: "FATAL. Every clue pointed internal — NYSE-only exposure, no external news, timing aligns exactly with the 08:01 deployment window. Misclassifying this as market volatility while waiting for confirmation is exactly what turned a containable incident into a $440M loss.",
    },
  ],
};


// ────────────────────────────────────────────────────────────
// ROLE 2 — ESCALATION FORM (unlocked after correct button)
// User must type correct values — not dropdowns
// ────────────────────────────────────────────────────────────

export const ESCALATION_FORM = {
  fields: [
    {
      id: "escalate_to",
      label: "Escalate To",
      placeholder: "Which team needs to act on this?",
      // Must contain: engineering / devops / systems / tech
      // FATAL if: NYSE / SEC / press / legal / compliance
      validKeywords: ["engineering", "devops", "systems", "tech", "release"],
      fatalKeywords: ["nyse", "sec", "press", "media", "legal", "compliance", "regulator"],
      fatalFeedback: "FATAL. Escalating externally before internal resolution turns a fixable incident into a public regulatory event. Knight Capital's window to self-resolve just closed.",
      invalidFeedback: "Escalation target unclear. Specify which internal team should respond.",
    },
    {
      id: "incident_origin",
      label: "Suspected Origin",
      placeholder: "What do you think caused this?",
      // Must contain: deployment / config / release / software / code
      validKeywords: ["deployment", "config", "release", "software", "code", "update", "patch"],
      invalidFeedback: "Origin too vague. Reference what changed in the system recently.",
    },
    {
      id: "timestamp_origin",
      label: "Timestamp of Origin",
      placeholder: "When did this start? (check deployment logs)",
      // Must contain: 08:01 or 8:01
      validKeywords: ["08:01", "8:01"],
      invalidFeedback: "Incorrect timestamp. Cross-reference deployment logs with the anomaly start time.",
    },
  ],

  // All 3 fields correct = CORRECT outcome
  // 2/3 correct = WARNING, field-level feedback shown
  // Wrong escalation target = FATAL immediately
  successFeedback: "Correct escalation. Engineering team has the deployment timestamp and can isolate the config issue immediately. This is the call that saves the company.",
  warningFeedback: "Partial escalation — some fields are incorrect or missing. Losses are continuing. Fix the flagged fields and resubmit.",
};


// ────────────────────────────────────────────────────────────
// ROLE 3 — DEVOPS / RELEASE ENGINEER
// ────────────────────────────────────────────────────────────

export const DEPLOYMENT_METADATA = {
  version: "v4.2.1",
  previousVersion: "v4.2.0",
  deployedAt: "2012-08-01 08:01:00 EST",
  deployedBy: "release-bot-03",
  commitHash: "a3f9c12",
  environment: "production",
  status: "INCIDENT_DETECTED",
  pipelineSteps: [
    { step: "Build",              status: "PASSED",  time: "07:48:00" },
    { step: "Unit Tests",         status: "PASSED",  time: "07:51:22" },
    { step: "Staging Deploy",     status: "PASSED",  time: "07:55:10" },
    { step: "Staging Smoke Test", status: "PASSED",  time: "07:58:44" },
    { step: "Production Deploy",  status: "PASSED",  time: "08:01:00" },
    { step: "Config Validation",  status: "SKIPPED", time: "08:01:01" }, // THE MISSING GATE
  ],
};


// ────────────────────────────────────────────────────────────
// ROLE 3 — BUTTON: DEPLOYMENT STRATEGY
// One binary button — wrong = WARNING (not fatal, retry)
// ────────────────────────────────────────────────────────────

export const DEVOPS_BUTTON = {
  id: "deployment_strategy",
  label: "Choose Resolution Strategy",
  description: "How do you want to fix this?",
  options: [
    {
      id: "targeted_patch",
      label: "Targeted Config Patch",
      outcome: "CORRECT_BUTTON",
      // Unlocks config editor + command input
    },
    {
      id: "full_rollback",
      label: "Full Deployment Rollback",
      outcome: "WARNING",
      feedback: "This stops the incident but rolls back all changes in v4.2.1 including legitimate features. It also doesn't address why the flag was missing. Stopped the bleeding but not the cleanest path — and takes longer, costing more in losses. Choose a more surgical approach.",
    },
  ],
};


// ────────────────────────────────────────────────────────────
// ROLE 3 — CONFIG DIFF VIEWER
// ────────────────────────────────────────────────────────────

export const CONFIG_DIFF = {
  diffLines: [
    { line: 1,  content: "modules:",                       type: "neutral" },
    { line: 2,  content: "  smars_core:",                  type: "neutral" },
    { line: 3,  content: "    active: true",               type: "neutral" },
    { line: 4,  content: "",                               type: "neutral" },
    { line: 5,  content: "  order_router_v4:",             type: "neutral" },
    { line: 6,  content: "    active: true",               type: "neutral" },
    { line: 7,  content: "",                               type: "neutral" },
    { line: 8,  content: "  risk_engine:",                 type: "neutral" },
    { line: 9,  content: "    active: true",               type: "neutral" },
    { line: 10, content: "    daily_loss_limit: 10000000", type: "neutral" },
    { line: 11, content: "",                               type: "neutral" },
    { line: 12, content: "  power_peg:",                   type: "neutral" },
    { line: 13, content: "    active: false",              type: "removed" }, // MISSING in production
    { line: 14, content: "    rate_limit: 0",              type: "neutral" },
    { line: 15, content: "    validated: true",            type: "neutral" },
  ],
  // Line 13 is highlighted red on production side (missing)
  // Line 13 is highlighted green on staging side (present)
};

// Inline editable config — user must type the fix directly
export const DEVOPS_CONFIG_EDITOR = {
  buggedContent: `modules:
  smars_core:
    active: true

  order_router_v4:
    active: true

  risk_engine:
    active: true
    daily_loss_limit: 10000000

  # Legacy modules — decommissioned 2012-Q1
  power_peg:
    rate_limit: 0
    validated: true`,

  requiredFix: "active: false",
  fixLocation: "under power_peg, above rate_limit",
  hint: "The diff viewer is showing you exactly what's missing. Add it to the production config.",
};

// Module registry
export const MODULE_REGISTRY = [
  { id: "SMARS_CORE",   label: "SMARS Core Router",  expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "ORDER_ROUTER", label: "Order Router v4",    expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "RISK_ENGINE",  label: "Risk Engine",        expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "RATE_LIMITER", label: "Rate Limiter",       expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "POWERPEG_01",  label: "PowerPeg Module 01", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_02",  label: "PowerPeg Module 02", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_03",  label: "PowerPeg Module 03", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_04",  label: "PowerPeg Module 04", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_05",  label: "PowerPeg Module 05", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_06",  label: "PowerPeg Module 06", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_07",  label: "PowerPeg Module 07", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_08",  label: "PowerPeg Module 08", expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
];


// ────────────────────────────────────────────────────────────
// ROLE 3 — COMMAND INPUT (unlocked after correct button)
// Runs AFTER config is patched — deploy command required
// ────────────────────────────────────────────────────────────

export const DEVOPS_COMMANDS = {
  // Must run config edit FIRST then one of these to finalize
  valid: [
    {
      pattern: /ansible-playbook\s+deploy\.yml\s+--tags\s+config/,
      response: "PLAY RECAP: production — ok=4, changed=1, failed=0\nConfig patch deployed. PowerPeg modules returning to DORMANT.",
      outcome: "CORRECT",
    },
    {
      pattern: /kubectl\s+apply\s+-f\s+config-patch\.yaml/,
      response: "configmap/smars-config patched. PowerPeg modules: DORMANT confirmed.",
      outcome: "CORRECT",
    },
    {
      pattern: /kubectl\s+get\s+modules/,
      response: `NAME           EXPECTED    CURRENT     STATUS
smars-core     RUNNING     RUNNING     OK
order-router   RUNNING     RUNNING     OK
powerpeg-01    DORMANT     RUNNING     MISMATCH ← 
powerpeg-02    DORMANT     RUNNING     MISMATCH ←
powerpeg-03    DORMANT     RUNNING     MISMATCH ←
powerpeg-04    DORMANT     RUNNING     MISMATCH ←
powerpeg-05    DORMANT     RUNNING     MISMATCH ←
powerpeg-06    DORMANT     RUNNING     MISMATCH ←
powerpeg-07    DORMANT     RUNNING     MISMATCH ←
powerpeg-08    DORMANT     RUNNING     MISMATCH ←`,
      outcome: "INFO",
    },
    {
      pattern: /git\s+diff\s+staging\s+production/,
      response: `- power_peg:
-   active: false    ← MISSING IN PRODUCTION
    rate_limit: 0
    validated: true`,
      outcome: "INFO",
    },
  ],

  fatal: [
    {
      pattern: /git\s+push\s+origin\s+hotfix/,
      response: "FATAL: Untested hotfix pushed to production.",
      outcome: "FATAL",
      feedback: "FATAL. Pushing an untested hotfix to a production system mid-incident introduces unknown variables to an already degraded system. One incident becomes two.",
    },
    {
      pattern: /ansible-playbook\s+deploy\.yml(?!\s+--tags\s+config)/,
      response: "FATAL: Full redeployment initiated — all services restarting.",
      outcome: "FATAL",
      feedback: "FATAL. Running a full deploy without the --tags config flag restarts all services including healthy ones. You've turned a targeted fix into a full outage.",
    },
  ],

  warning: [
    {
      pattern: /git\s+revert\s+HEAD/,
      response: "Full rollback initiated. Reverting all changes in v4.2.1.",
      outcome: "WARNING",
      feedback: "This works but reverts legitimate changes alongside the fix. Also takes 3x longer than a targeted patch — more losses accumulate. Use a targeted deploy command instead.",
    },
  ],

  // Config not yet patched — remind user
  configNotPatched: "You need to edit and save the config file before deploying. The deploy will push whatever is currently in the config.",
};


// ────────────────────────────────────────────────────────────
// VALIDATION LOGIC SUMMARY
// For each role, what constitutes CORRECT resolution
// ────────────────────────────────────────────────────────────

export const RESOLUTION_CRITERIA = {
  systems_engineer: {
    // Both must be true to trigger CORRECT
    processesKilled: false,   // kill -9 48201 48202 48203 48204 48205 48206 48207 48208
    configPatched: false,     // active: false added to config editor
    // Only processes killed = WARNING (bug will reactivate on restart)
    // Only config patched = WARNING (modules still running right now)
    partialFeedback: "You've done half the job. Killing processes stops current damage but the config will reactivate them on restart. Patching config without killing processes means they keep running now. You need both.",
  },
  risk_officer: {
    // Button correct + all 3 form fields valid = CORRECT
    buttonCorrect: false,
    formFieldsCorrect: 0,     // count of correct fields out of 3
    totalFields: 3,
  },
  devops_engineer: {
    // Button correct + config patched + correct deploy command = CORRECT
    buttonCorrect: false,
    configPatched: false,     // active: false added to editor
    deployCommandRun: false,
    // Config patched but no deploy = WARNING (fix not applied yet)
    // Deploy run but config not patched = WARNING (deployed the bug again)
    partialFeedback: "Check both steps — the config must be edited AND the targeted deploy command must be run. One without the other doesn't apply the fix.",
  },
};


// ────────────────────────────────────────────────────────────
// DEBRIEF CONTENT
// ────────────────────────────────────────────────────────────

export const DEBRIEF = {
  incidentSummary: "On August 1, 2012, Knight Capital Group deployed software update v4.2.1 to their SMARS trading platform. A missing config flag — active: false — caused 8 decommissioned Power Peg routing modules to reactivate. With no rate limiters or validation checks, these modules fired uncontrolled orders across 154 NYSE-listed stocks. In 45 minutes, Knight Capital lost $440 million. The company was subsequently acquired.",

  correctResolutionPath: [
    { step: 1, role: "all",              action: "Detect anomaly — order velocity spike / P&L bleed / module registry mismatch at 08:01:40" },
    { step: 2, role: "risk_officer",     action: "Classify as internal failure — NYSE-only scope, no external news, deployment window alignment" },
    { step: 3, role: "risk_officer",     action: "Escalate to engineering with deployment timestamp 08:01:00" },
    { step: 4, role: "systems_engineer", action: "grep logs → identify PowerPeg PIDs 48201–48208" },
    { step: 5, role: "devops_engineer",  action: "git diff staging production → spot missing active: false under power_peg" },
    { step: 6, role: "systems_engineer", action: "kill -9 48201–48208 → stop active order firing immediately" },
    { step: 7, role: "devops_engineer",  action: "Edit config — add active: false under power_peg block" },
    { step: 8, role: "devops_engineer",  action: "ansible-playbook deploy.yml --tags config → targeted patch deployed" },
    { step: 9, role: "all",              action: "Verify PowerPeg_01–08 return to DORMANT state. Incident closed." },
  ],

  lessonsLearned: [
    "Config diffs between staging and production must be a mandatory pipeline gate — not optional",
    "Decommissioned modules must be explicitly flagged inactive in config — comments are not enough",
    "Kill switches for algorithmic components are non-negotiable in trading systems",
    "Real-time order velocity monitoring with auto-halt thresholds catches this in seconds",
    "Partial kills are worse than no action — identify all process IDs before executing",
  ],

  realWorldOutcome: "Knight Capital lost $440M in 45 minutes. An emergency $400M capital injection was required. The company was acquired by Getco LLC in 2013.",
};


// ────────────────────────────────────────────────────────────
// SIMULATION CONFIG
// ────────────────────────────────────────────────────────────

export const SIM_CONFIG = {
  normalPhaseDuration: 10,        // seconds before incident triggers
  timerStart: 45 * 60,            // 45 minutes in seconds
  warningTimerThreshold: 10 * 60, // amber below 10 min
  criticalTimerThreshold: 5 * 60, // red below 5 min
  warningTimePenalty: 5 * 60,     // -5 min per WARNING decision
  plossRatePerSecond: 166666,     // ~$1M per 6 seconds
  logScrollRatePhase1: 2000,      // ms between log lines — normal
  logScrollRatePhase2: 300,       // ms between log lines — flooding
  inactivityHintDelay: 60,        // seconds before hint appears in editors
};
