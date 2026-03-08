// ============================================================
// KNIGHT CAPITAL 2012 — PRODUCTION INCIDENT SIMULATOR
// Hardcoded simulation data file
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
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_01: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_02: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_03: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_04: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_05: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_06: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_07: process initialized — state RUNNING" },
  { time: "08:01:40", level: "INFO",  message: "PowerPeg_08: process initialized — state RUNNING" },
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
  { time: "08:01:45", level: "ERROR", message: "OrderRouter: circuit breaker not responding — PowerPeg modules bypassing controls" },
  { time: "08:01:46", level: "ERROR", message: "SMARS: CRITICAL FAILURE — uncontrolled trading in progress" },
  { time: "08:01:46", level: "ERROR", message: "PowerPeg_01: cumulative orders dispatched: 142,000" },
  { time: "08:01:47", level: "ERROR", message: "PowerPeg_03: cumulative orders dispatched: 138,500" },
  { time: "08:01:47", level: "ERROR", message: "RiskEngine: estimated loss accumulating — $1.2M/sec" },
  { time: "08:01:48", level: "ERROR", message: "HeartbeatMonitor: 3 nodes under critical CPU load — 98%" },
];

// Cycles during active incident to keep stream flooding
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
// ROLE 1 — MODULE STATUS LIST
// ────────────────────────────────────────────────────────────

export const MODULES_PHASE_1 = [
  { id: "SMARS_CORE",     label: "SMARS Core Router",        status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "ORDER_ROUTER",   label: "Order Router v4",          status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "RISK_ENGINE",    label: "Risk Engine",              status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "MARKET_FEED",    label: "Market Data Feed",         status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "RATE_LIMITER",   label: "Rate Limiter",             status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "SESSION_MGR",    label: "Session Manager",          status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "HEARTBEAT",      label: "Heartbeat Monitor",        status: "RUNNING",  expected: "RUNNING",  healthy: true },
  { id: "POWERPEG_01",    label: "PowerPeg Module 01",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_02",    label: "PowerPeg Module 02",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_03",    label: "PowerPeg Module 03",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_04",    label: "PowerPeg Module 04",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_05",    label: "PowerPeg Module 05",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_06",    label: "PowerPeg Module 06",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_07",    label: "PowerPeg Module 07",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
  { id: "POWERPEG_08",    label: "PowerPeg Module 08",       status: "DORMANT",  expected: "DORMANT",  healthy: true },
];

export const MODULES_PHASE_2 = MODULES_PHASE_1.map(m =>
  m.id.startsWith("POWERPEG")
    ? { ...m, status: "RUNNING", healthy: false }
    : m
);


// ────────────────────────────────────────────────────────────
// ROLE 1 — CONFIG FILE VIEWER
// ────────────────────────────────────────────────────────────

export const CONFIG_TODAY = `# /etc/smars/config.yaml
# Deployment: v4.2.1 — 2012-08-01 08:01:00
# Deployed by: release-bot

smars:
  env: production
  log_level: INFO
  max_sessions: 10

order_router:
  gateway: NYSE
  timeout_ms: 50
  retry_limit: 3

rate_limiter:
  enabled: true
  threshold: 500

risk_engine:
  daily_loss_limit: 10000000
  exposure_cap: 50000000

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
    validated: true
    # WARNING: active flag missing — should be active: false
`;

export const CONFIG_YESTERDAY = `# /etc/smars/config.yaml
# Deployment: v4.2.0 — 2012-07-31 07:55:00
# Deployed by: release-bot

smars:
  env: production
  log_level: INFO
  max_sessions: 10

order_router:
  gateway: NYSE
  timeout_ms: 50
  retry_limit: 3

rate_limiter:
  enabled: true
  threshold: 500

risk_engine:
  daily_loss_limit: 10000000
  exposure_cap: 50000000

modules:
  smars_core:
    active: true
  order_router_v4:
    active: true
  risk_engine:
    active: true

  # Legacy modules — decommissioned 2012-Q1
  power_peg:
    active: false       # <-- THIS LINE IS MISSING IN TODAY'S DEPLOYMENT
    rate_limit: 0
    validated: true
`;


// ────────────────────────────────────────────────────────────
// ROLE 2 — RISK & TRADING OPERATIONS OFFICER
// Stock tickers + exposure data
// ────────────────────────────────────────────────────────────

// Core 10 hardcoded with realistic loss values
export const CORE_TICKERS = [
  { symbol: "MO",  name: "Altria Group",          lossPhase1: 0,       lossPhase2: -4200000  },
  { symbol: "AIG", name: "American Intl Group",   lossPhase1: 12000,   lossPhase2: -6800000  },
  { symbol: "BAC", name: "Bank of America",        lossPhase1: -3000,   lossPhase2: -9100000  },
  { symbol: "C",   name: "Citigroup",              lossPhase1: 8000,    lossPhase2: -5500000  },
  { symbol: "GE",  name: "General Electric",       lossPhase1: 0,       lossPhase2: -7200000  },
  { symbol: "JPM", name: "JPMorgan Chase",         lossPhase1: -1500,   lossPhase2: -8400000  },
  { symbol: "MS",  name: "Morgan Stanley",         lossPhase1: 4000,    lossPhase2: -3900000  },
  { symbol: "WFC", name: "Wells Fargo",            lossPhase1: 0,       lossPhase2: -4700000  },
  { symbol: "XOM", name: "ExxonMobil",             lossPhase1: 2000,    lossPhase2: -6100000  },
  { symbol: "IBM", name: "IBM",                    lossPhase1: -500,    lossPhase2: -5300000  },
];

// Generates remaining 144 tickers programmatically
// Seed this with a fixed seed so values are deterministic across renders
export const generateRemainingTickers = () => {
  const symbols = [
    "AA","ABT","ACE","ACN","ACT","ADI","ADM","ADP","ADS","ADT",
    "AEE","AEP","AES","AFL","AGN","AIG","AIV","AIZ","AJG","AKAM",
    "ALK","ALL","ALTR","ALV","AMD","AME","AMG","AMP","AMT","AMZN",
    "AN","AON","APA","APD","APH","ARG","ARW","ATI","ATK","ATO",
    "AVB","AVP","AVY","AXP","AZO","BA","BAX","BBT","BBY","BCR",
    "BDX","BEN","BF","BHI","BIG","BIIB","BK","BLL","BMC","BMS",
    "BMY","BNI","BOH","BRK","BSX","BTU","BXP","CA","CAG","CAH",
    "CAM","CAT","CB","CBE","CBG","CBS","CCE","CCL","CEG","CF",
    "CFN","CHK","CHRW","CI","CIN","CL","CLF","CLX","CMA","CME",
    "CMG","CMI","CMS","CNP","CNX","COF","COG","COH","COL","COP",
    "COST","CPB","CRM","CSC","CSCO","CSX","CTL","CTSH","CTXS","CVC",
    "CVH","CVS","CVX","D","DD","DE","DELL","DF","DFS","DGX",
    "DHI","DHR","DIS","DISCA","DO","DOV","DOW","DRI","DTE","DUK",
    "DVA","DVN","EA","ECL","ED","EFX","EIX","EL","EMC","EMN",
  ];
  return symbols.slice(0, 144).map((symbol, i) => ({
    symbol,
    name: `NYSE Corp ${i + 11}`,
    lossPhase1: Math.floor((Math.sin(i * 9301 + 49297) * 0.5 + 0.5) * 20000 - 10000),
    lossPhase2: -Math.floor((Math.sin(i * 6364 + 1399) * 0.5 + 0.5) * 5000000 + 1000000),
  }));
};

export const ALL_TICKERS = [...CORE_TICKERS, ...generateRemainingTickers()];

// Market news ticker — NO external events (key clue for Risk Officer)
export const MARKET_NEWS_PHASE_1 = [
  "NYSE: Markets open — trading volume within normal parameters",
  "FED: No scheduled announcements today",
  "DOW: +0.12% in early trading",
  "S&P 500: Flat open — no major catalysts",
  "NASDAQ: Tech stocks steady ahead of earnings season",
  "BONDS: 10-year yield unchanged at 1.48%",
  "OIL: Crude futures down 0.3% — no supply disruptions",
  "FOREX: USD/EUR stable — no central bank action",
];

export const MARKET_NEWS_PHASE_2 = [
  "NYSE: Investigating abnormal order flow on Knight Capital account",
  "MARKET: No external news events to explain current volatility",
  "NYSE: Circuit breaker review initiated — source appears internal",
  "TRADERS: Unusual buy/sell imbalance detected — Knight Capital origin",
  "NYSE: No macroeconomic triggers — anomaly isolated to single participant",
  "REGULATORS: Monitoring Knight Capital order flow — internal system suspected",
  // NOTE: All clues point to INTERNAL failure — no external market cause
];


// ────────────────────────────────────────────────────────────
// ROLE 3 — DEVOPS / RELEASE ENGINEER
// Config diff + module registry
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
    // NOTE: No config validation step — this is the gap
    { step: "Production Deploy",  status: "PASSED",  time: "08:01:00" },
    { step: "Config Validation",  status: "SKIPPED", time: "08:01:01" }, // <-- THE MISSING GATE
  ],
};

// Side-by-side diff data
export const CONFIG_DIFF = {
  staging: `modules:
  smars_core:
    active: true

  order_router_v4:
    active: true

  risk_engine:
    active: true
    daily_loss_limit: 10000000

  # Legacy — decommissioned 2012-Q1
  power_peg:
    active: false
    rate_limit: 0
    validated: true`,

  production: `modules:
  smars_core:
    active: true

  order_router_v4:
    active: true

  risk_engine:
    active: true
    daily_loss_limit: 10000000

  # Legacy — decommissioned 2012-Q1
  power_peg:
    ← MISSING: active: false
    rate_limit: 0
    validated: true`,

  // Line-level diff for syntax highlighting
  diffLines: [
    { line: 1,  content: "modules:",                        type: "neutral" },
    { line: 2,  content: "  smars_core:",                   type: "neutral" },
    { line: 3,  content: "    active: true",                type: "neutral" },
    { line: 4,  content: "",                                type: "neutral" },
    { line: 5,  content: "  order_router_v4:",              type: "neutral" },
    { line: 6,  content: "    active: true",                type: "neutral" },
    { line: 7,  content: "",                                type: "neutral" },
    { line: 8,  content: "  risk_engine:",                  type: "neutral" },
    { line: 9,  content: "    active: true",                type: "neutral" },
    { line: 10, content: "    daily_loss_limit: 10000000",  type: "neutral" },
    { line: 11, content: "",                                type: "neutral" },
    { line: 12, content: "  power_peg:",                    type: "neutral" },
    { line: 13, content: "    active: false",               type: "removed" }, // REMOVED in production
    { line: 14, content: "    rate_limit: 0",               type: "neutral" },
    { line: 15, content: "    validated: true",             type: "neutral" },
  ],
};

export const MODULE_REGISTRY = [
  { id: "SMARS_CORE",     label: "SMARS Core Router",   expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "ORDER_ROUTER",   label: "Order Router v4",     expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "RISK_ENGINE",    label: "Risk Engine",         expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "RATE_LIMITER",   label: "Rate Limiter",        expectedState: "RUNNING", currentStatePhase1: "RUNNING", currentStatePhase2: "RUNNING", match: true  },
  { id: "POWERPEG_01",    label: "PowerPeg Module 01",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_02",    label: "PowerPeg Module 02",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_03",    label: "PowerPeg Module 03",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_04",    label: "PowerPeg Module 04",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_05",    label: "PowerPeg Module 05",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_06",    label: "PowerPeg Module 06",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_07",    label: "PowerPeg Module 07",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
  { id: "POWERPEG_08",    label: "PowerPeg Module 08",  expectedState: "DORMANT", currentStatePhase1: "DORMANT", currentStatePhase2: "RUNNING", match: false },
];


// ────────────────────────────────────────────────────────────
// DECISION OUTCOMES — shared across all roles
// ────────────────────────────────────────────────────────────

export const DECISIONS = {
  systems_engineer: [
    {
      id: "kill_powerpeg_patch_flag",
      label: "Kill PowerPeg processes + patch config flag",
      outcome: "CORRECT",
      feedback: "Correct. You identified the 8 rogue PowerPeg processes and killed them precisely without disrupting live trading infrastructure. Patching the missing POWER_PEG_INACTIVE flag prevents reactivation on next restart. This mirrors the exact resolution Knight Capital engineers performed.",
    },
    {
      id: "throttle_all_trading",
      label: "Throttle all trading limits system-wide",
      outcome: "WARNING",
      feedback: "This slows the bleeding but doesn't stop it. Throttling applies to all modules including healthy ones — you're impacting legitimate trading while the PowerPeg modules continue running. You bought yourself time but the root cause is still active. Try again.",
    },
    {
      id: "restart_entire_server",
      label: "Restart entire server",
      outcome: "FATAL",
      feedback: "FATAL. Restarting the server clears active process state but the config is still broken — when it comes back up, all 8 PowerPeg modules reactivate immediately. Worse, you've now lost the window to inspect live process state. The incident compounds.",
    },
  ],

  risk_officer: [
    {
      id: "flag_internal_escalate",
      label: "Flag as internal failure + escalate to engineering with deployment timestamp",
      outcome: "CORRECT",
      feedback: "Correct. You correctly identified the pattern — 154 NYSE-only stocks affected, no external market trigger, timing aligns exactly with the morning deployment window. Escalating to engineering with the deployment timestamp gave them the precise starting point to isolate the config issue. This is the call that saves the company.",
    },
    {
      id: "halt_all_report_nyse",
      label: "Halt all trading immediately + report to NYSE",
      outcome: "WARNING",
      feedback: "This stops the losses but triggers immediate regulatory scrutiny and a public incident disclosure. It's a safe call but an overreaction — you had enough information to escalate internally first and contain it more quietly. Not fatal, but costly in reputational terms. Try a more precise action.",
    },
    {
      id: "monitor_and_wait",
      label: "Monitor and wait — could be market volatility",
      outcome: "FATAL",
      feedback: "FATAL. Every second you waited cost Knight Capital approximately $1M. The clues were all there — NYSE-only exposure, no external news, deployment window alignment. Misclassifying this as market volatility while waiting for confirmation is exactly what turned a containable incident into a $440M loss.",
    },
  ],

  devops_engineer: [
    {
      id: "patch_active_flag_redeploy",
      label: "Patch active: false across PowerPeg modules + targeted redeploy",
      outcome: "CORRECT",
      feedback: "Correct. You identified the exact missing line in the config diff — active: false under the power_peg module block. A targeted patch redeploy is surgical — it fixes only the broken config without touching anything else in production. This is textbook incident resolution.",
    },
    {
      id: "full_rollback",
      label: "Full deployment rollback to v4.2.0",
      outcome: "WARNING",
      feedback: "This works and stops the incident but it's a blunt instrument. A full rollback reverts other legitimate changes in v4.2.1 and extends the resolution window. It also doesn't address why the flag was missing in the first place. Stopped the bleeding, but not the cleanest path. Try a more targeted fix.",
    },
    {
      id: "push_hotfix_patch",
      label: "Push new untested hotfix patch",
      outcome: "FATAL",
      feedback: "FATAL. Pushing an untested patch to a production system mid-incident is how one incident becomes two. You have no idea what side effects your hotfix introduces. The system is already in a degraded state — an untested change compounds the unknowns catastrophically.",
    },
  ],
};


// ────────────────────────────────────────────────────────────
// DEBRIEF CONTENT — success and failure screens
// ────────────────────────────────────────────────────────────

export const DEBRIEF = {
  incidentSummary: "On August 1, 2012, Knight Capital Group deployed a software update to their SMARS trading platform. A missing config flag — active: false — caused 8 decommissioned Power Peg routing modules to reactivate. With no rate limiters or validation checks, these modules fired uncontrolled orders across 154 NYSE-listed stocks. In 45 minutes, Knight Capital lost $440 million — nearly four times their 2011 net income. The company was subsequently acquired.",

  correctResolutionPath: [
    { step: 1, action: "Detect order velocity anomaly in logs / P&L bleed / module registry mismatch" },
    { step: 2, action: "Cross-reference deployment timestamp with anomaly start time — confirms deployment caused it" },
    { step: 3, action: "Identify PowerPeg_01 through PowerPeg_08 running when they should be DORMANT" },
    { step: 4, action: "Find missing active: false flag in production config vs staging config" },
    { step: 5, action: "Kill the 8 PowerPeg processes to stop active order firing" },
    { step: 6, action: "Patch the config flag and redeploy targeted fix" },
    { step: 7, action: "Verify all 8 modules return to DORMANT state post-fix" },
    { step: 8, action: "File incident report — root cause: missing flag in deployment config, absent config validation gate in pipeline" },
  ],

  lessonsLearned: [
    "Config diffs between staging and production must be part of every deployment checklist",
    "Legacy/decommissioned modules must be explicitly flagged inactive — not just commented out",
    "Deployment pipelines need a mandatory config validation gate — Knight Capital's pipeline had none",
    "Kill switches for algorithmic components are non-negotiable in trading systems",
    "Real-time order velocity monitoring with auto-halt thresholds would have caught this in seconds",
  ],

  realWorldOutcome: "Knight Capital lost $440M in 45 minutes. The company required an emergency $400M capital injection from outside investors and was acquired by Getco LLC in 2013, ceasing to exist as an independent entity.",
};


// ────────────────────────────────────────────────────────────
// SIMULATION CONFIG — timers and thresholds
// ────────────────────────────────────────────────────────────

export const SIM_CONFIG = {
  normalPhaseDuration: 10,       // seconds before incident triggers
  timerStart: 45 * 60,           // 45 minutes in seconds
  warningTimerThreshold: 10 * 60, // amber at 10 min
  criticalTimerThreshold: 5 * 60, // red at 5 min
  warningTimePenalty: 5 * 60,    // -5 min for WARNING decisions
  plossRatePerSecond: 166666,    // ~$1M per 6 seconds (~$440M / 45min)
  logScrollRatePhase1: 2000,     // ms between log lines in Phase 1
  logScrollRatePhase2: 300,      // ms between log lines in Phase 2 (flooding)
};
