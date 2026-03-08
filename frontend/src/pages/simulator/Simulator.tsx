import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import { AlertTriangle, Loader2, BellRing, MessageSquare, Terminal, Users, X } from 'lucide-react';
import { API_URL } from '../../config';
import type { SimulationRole } from '../../data/incidents/types';
import { BlastRadius } from '../../components/simulator/BlastRadius';
import { RevenueGraph } from '../../components/simulator/RevenueGraph';
import { LogViewer } from '../../components/simulator/LogViewer';
import { RunbookPanel } from '../../components/simulator/RunbookPanel';
import { ExternalComms } from '../../components/simulator/ExternalComms';
import { PostMortemReview } from '../../components/simulator/PostMortemReview';

export default function Simulator() {
    const { scenarioId } = useParams();
    const navigate = useNavigate();

    const [pendingActionId, setPendingActionId] = useState<string | null>(null);
    const [actionInput, setActionInput] = useState('');
    const [inputError, setInputError] = useState(false);

    // Multiplayer Role State
    const [selectedRole, setSelectedRole] = useState<SimulationRole | null>(null);
    const [engineerTab, setEngineerTab] = useState<'LOGS' | 'RUNBOOK'>('LOGS');
    const [showPostmortem, setShowPostmortem] = useState(false);
    const [dynamicHint, setDynamicHint] = useState<string | null>(null);

    const {
        loading,
        scenario,
        currentState,
        revenueLost,
        timeElapsedSeconds,
        logs,
        activeAlerts,
        isGameOver,
        gameOverReason,
        lastActionId,
        lastActionSeverity,
        timeInCurrentState,
        loadScenario,
        takeAction,
        dismissAlert
    } = useSimulationEngine();

    useEffect(() => {
        if (scenarioId) {
            loadScenario(scenarioId);
            setPendingActionId(null);
            setActionInput('');
            setInputError(false);
            setShowPostmortem(false);
        }
    }, [scenarioId, loadScenario]);


    useEffect(() => {
        if (isGameOver && gameOverReason !== 'BANKRUPT') {
            setShowPostmortem(true);
        }
    }, [isGameOver, gameOverReason]);

    useEffect(() => {
        if (timeInCurrentState === 15 && !isGameOver && currentState) {
            const fetchHint = async () => {
                setDynamicHint("Consulting senior engineers for advice...");
                try {
                    const res = await fetch(`${API_URL}/api/ai/incident-hint`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            scenarioContext: `${scenario?.title} - ${scenario?.impactSummary}`,
                            currentStateDesc: currentState.description,
                            recentLogs: logs.slice(-10)
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.hint) {
                        setDynamicHint(data.hint);
                    } else {
                        setDynamicHint(currentState.hint || "Check logs and metrics to identify the anomaly.");
                    }
                } catch (e) {
                    setDynamicHint(currentState.hint || "Check logs and metrics to identify the anomaly.");
                }
            };
            fetchHint();
        } else if (timeInCurrentState === 0) {
            setDynamicHint(null);
        }
    }, [timeInCurrentState, currentState, logs, isGameOver, scenario]);

    if (loading) {
        return (
            <div className="w-full h-[calc(100vh-48px)] flex items-center justify-center bg-[#DFFFDB]">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 size={32} className="text-[#9D0A36] animate-spin" />
                    <span className="font-body text-[#9D0A3673] font-bold tracking-widest uppercase text-[12px]">Booting Simulation Core...</span>
                </div>
            </div>
        );
    }

    if (!scenario || !currentState) {
        return (
            <div className="w-full h-[calc(100vh-48px)] flex items-center justify-center bg-[#DFFFDB]">
                <div className="text-center">
                    <AlertTriangle size={48} className="mx-auto text-[#9D0A36] mb-4" />
                    <h2 className="text-[#9D0A36] font-display text-[24px] mb-2">Scenario Corrupted</h2>
                    <p className="text-[#9D0A3673] font-body mb-6">The requested incident simulation data could not be parsed.</p>
                    <button onClick={() => navigate('/incidents')} className="text-[#9D0A36] hover:underline">Return to Incidents</button>
                </div>
            </div>
        );
    }

    const isCritical = currentState.metrics.burnRatePerSec > 100000;
    const isCrash = (isGameOver && gameOverReason === 'BANKRUPT') || currentState.visualMode === 'crash';

    const formatTime = (totalSeconds: number) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `-${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleActionClick = (actionId: string) => {
        const action = scenario.actions[actionId];
        if (action.requiresInput) {
            setPendingActionId(actionId);
        } else {
            takeAction(actionId);
        }
    };

    const submitActionInput = () => {
        if (!pendingActionId) return;
        const action = scenario.actions[pendingActionId];
        if (actionInput.toLowerCase().trim() === action.requiresInput?.toLowerCase().trim()) {
            takeAction(pendingActionId);
            setPendingActionId(null);
            setActionInput('');
            setInputError(false);
        } else {
            setInputError(true);
        }
    };

    // Role Selection Pre-flight Guard
    if (!selectedRole) {
        return (
            <div className="w-full h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-[#DFFFDB] p-4 font-mono overflow-y-auto">
                <div className="max-w-[800px] w-full border-2 border-[#9D0A36] bg-[#DFFFDB] p-8 shadow-[10px_10px_0_#9D0A36] animate-[fade-up_0.5s_ease-out] my-8 shrink-0">

                    {/* Beginner Guide & Instructions */}
                    <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500 animate-[fade-in_1s_ease-out]">
                        <h2 className="text-yellow-600 font-bold text-[18px] uppercase tracking-widest mb-2 flex items-center gap-2"><AlertTriangle size={18} /> INSTRUCTIONS & BEGINNER GUIDE</h2>
                        <ul className="list-disc list-inside text-[13px] text-yellow-700/80 space-y-1 mb-4">
                            <li><strong>Your Goal:</strong> Stabilize the system and stop the revenue bleeding before you hit bankruptcy.</li>
                            <li>You are taking on roles in an incident response. Switch roles via the assignment screen if you need different views.</li>
                            <li><strong>Commander:</strong> Sees the timeline and metrics. Executes commands.</li>
                            <li><strong>Engineer:</strong> Has shell access to read raw logs and system outputs.</li>
                        </ul>
                        <div className="bg-[#9D0A36]/10 p-3 text-[12px] text-[#9D0A36] border border-[#9D0A36]/30">
                            <strong className="text-[14px]">SPOILER / SOLUTION:</strong> If you are stuck, the underlying bug for the "Knight Capital" scenario is a repurposed feature flag in the routing engine.<br /><br />
                            1. Select <strong>Incident Commander</strong>.<br />
                            2. Once the incident starts (after 10s), click <strong>Inspect Routing Logs</strong>.<br />
                            3. The logs indicate millions of duplicate orders. The hint mentions the algorithm's name in the code snippet is the key.<br />
                            4. Click <strong>Disconnect From Exchanges</strong> and type exactly <strong>"power peg"</strong> when prompted to shutdown the broken component and stabilize the system.<br /><br />
                            <em>Note: Rolling back or restarting are "Risky" or "Blunder" actions that will bankrupt you faster!</em>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 border-b-2 border-[#9D0A36] pb-4 mb-8">
                        <Users size={32} className="text-[#9D0A36]" />
                        <div>
                            <h1 className="text-[#9D0A36] text-[24px] font-bold uppercase tracking-widest">Select Assignment</h1>
                            <p className="text-[#9D0A36]/70 text-[12px] uppercase">Incident context heavily restricted based on clearance level.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setSelectedRole('COMMANDER')} className="text-left group border border-[#9D0A36]/30 p-4 hover:bg-[#9D0A36]/10 hover:border-[#9D0A36] transition-colors relative overflow-hidden">
                            <h3 className="text-[#9D0A36] font-bold text-[14px] mb-2 uppercase group-hover:text-red-600 transition-colors">Incident Commander</h3>
                            <p className="text-[#9D0A36]/70 text-[11px] leading-relaxed">Directs the response. Sees business impact, timeline, and decision consequences. NO RAW LOG ACCESS.</p>
                        </button>
                        <button onClick={() => setSelectedRole('ENGINEER')} className="text-left group border border-[#9D0A36]/30 p-4 hover:bg-[#9D0A36]/10 hover:border-[#9D0A36] transition-colors relative overflow-hidden">
                            <h3 className="text-[#9D0A36] font-bold text-[14px] mb-2 uppercase group-hover:text-cyan-600 transition-colors">On-Call Engineer</h3>
                            <p className="text-[#9D0A36]/70 text-[11px] leading-relaxed">Handles technical stabilization. Has shell access and raw logs. NO VISIBILITY ON REVENUE IMPACT.</p>
                        </button>
                        <button onClick={() => setSelectedRole('DBA')} className="text-left group border border-[#9D0A36]/30 p-4 hover:bg-[#9D0A36]/10 hover:border-[#9D0A36] transition-colors relative overflow-hidden">
                            <h3 className="text-[#9D0A36] font-bold text-[14px] mb-2 uppercase group-hover:text-yellow-600 transition-colors">Database Admin</h3>
                            <p className="text-[#9D0A36]/70 text-[11px] leading-relaxed">Monitors connection pools and query latency. Highly restricted app-level context.</p>
                        </button>
                        <button onClick={() => setSelectedRole('COMMS')} className="text-left group border border-[#9D0A36]/30 p-4 hover:bg-[#9D0A36]/10 hover:border-[#9D0A36] transition-colors relative overflow-hidden">
                            <h3 className="text-[#9D0A36] font-bold text-[14px] mb-2 uppercase group-hover:text-green-600 transition-colors">Comms Lead</h3>
                            <p className="text-[#9D0A36]/70 text-[11px] leading-relaxed">Manages external pressure tracks and Status Page updates. Cannot authorize technical commands.</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full h-[calc(100vh-48px)] flex flex-col overflow-hidden relative transition-colors duration-500 ${(isCritical || isCrash) && !isGameOver ? 'bg-[#1a0a0d]' : 'bg-[#DFFFDB]'} ${isCrash ? 'animate-[shake_0.5s_infinite]' : ''}`}>
            {/* Visual Urgency Overlay */}
            {isCritical && !isGameOver && !isCrash && (
                <div className="absolute inset-0 pointer-events-none border-[4px] border-[#9D0A3680] animate-[pulse_2s_ease-in-out_infinite] z-0" />
            )}

            {isCrash && !showPostmortem && (
                <div className="absolute inset-0 z-50 bg-[#9D0A36]/90 flex flex-col items-center justify-center backdrop-blur-sm pointer-events-auto">
                    <h1 className="text-white text-[64px] font-bold uppercase mb-4 animate-[pulse_1s_infinite]">PROD CRASHED</h1>
                    <h2 className="text-white text-[24px] font-bold uppercase mb-8 opacity-80">SYS HALT</h2>
                    {lastActionId && scenario.actions[lastActionId]?.severity === 'BLUNDER' && (
                        <div className="bg-black p-4 text-red-500 font-mono mb-8 border border-red-500 max-w-lg text-center shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                            <span className="font-bold tracking-widest uppercase">LAST FATAL ACTION:</span>
                            <br />
                            <span className="text-[14px]">{scenario.actions[lastActionId].label}</span>
                        </div>
                    )}
                    {isGameOver ? (
                        <button
                            onClick={() => setShowPostmortem(true)}
                            className="px-6 py-3 bg-white text-[#9D0A36] font-bold text-[18px] hover:bg-gray-200 transition-colors uppercase tracking-widest shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        >
                            View Postmortem
                        </button>
                    ) : (
                        <div className="text-white font-mono text-xl animate-pulse mt-4 bg-black/50 p-4 border border-white/20">
                            Attempting Recovery Protocols... Core Systems Locked
                        </div>
                    )}
                </div>
            )}

            {/* Active Alerts Overlay Container */}
            <div className="absolute top-24 right-8 z-40 flex flex-col gap-4 max-w-[400px]">
                {lastActionSeverity === 'RISKY' && (
                    <div className="bg-[#594214] border border-[#eab308] rounded-[8px] p-4 shadow-[0_10px_30px_rgba(234,179,8,0.2)] animate-[fade-left_0.3s_ease-out]">
                        <div className="flex items-center gap-2 mb-2 font-display font-bold text-[14px] uppercase tracking-wider text-[#eab308]">
                            <AlertTriangle size={16} /> RISKY ACTION EXECUTED
                        </div>
                        <p className="font-body text-[14px] text-[#fef08a]">Error budget bleeding, try a more standard approach.</p>
                    </div>
                )}
                {activeAlerts.map(alert => (
                    <div key={alert.id} className="relative bg-[#DFFFDB] border border-[#9D0A36] rounded-[8px] p-4 shadow-[0_10px_30px_rgba(224,92,122,0.3)] animate-[fade-left_0.3s_ease-out]">
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            className="absolute top-2 right-2 text-[#9D0A36]/50 hover:text-red-500 bg-transparent transition-colors p-1"
                            title="Dismiss Alert"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex items-center gap-2 mb-2 font-display font-bold text-[14px] uppercase tracking-wider pr-6">
                            {alert.type === 'pagerduty' ? <BellRing size={16} className="text-[#9D0A36] animate-[wiggle_1s_ease-in-out_infinite]" /> :
                                alert.type === 'slack' ? <MessageSquare size={16} className="text-[#9D0A36]" /> : <Terminal size={16} className="text-[#9D0A36]" />}
                            <span className={alert.type === 'pagerduty' ? 'text-[#9D0A36]' : 'text-[#9D0A36]'}>{alert.type} ALERT</span>
                        </div>
                        <p className="font-body text-[14px] text-[#9D0A36] pr-2">{alert.message}</p>
                    </div>
                ))}
            </div>
            {/* Header: War Room Multi-line Status Bar */}
            <header className="shrink-0 bg-[#DFFFDB] border-b border-[#DFFFDB] flex flex-col font-mono text-[12px] uppercase">
                {/* Top Row: Incident Status & Uptime */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#9D0A36]/20">
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-2 py-1 font-bold ${isGameOver ? 'bg-[#9D0A36] text-black' : 'bg-red-600 text-white'}`}>
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                            {isGameOver ? 'SYS_HALTED' : 'INCIDENT_ACTIVE'}
                        </div>
                        <span className="text-[#9D0A36] font-bold text-[14px]">{scenario.title}</span>
                    </div>
                    <div className="flex gap-4 items-center">
                        {currentState.progressIndicator === 'WARMER' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/50">
                                <span className="text-green-500 text-[10px] tracking-widest font-bold uppercase animate-pulse">Approaching Stabilization</span>
                            </div>
                        )}
                        {currentState.progressIndicator === 'COLDER' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#9D0A36]/10 border border-[#9D0A36]/50">
                                <span className="text-[#9D0A36] text-[10px] tracking-widest font-bold uppercase animate-pulse">System Degraded Further</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-900/10 border border-red-500/30">
                            <span className="text-red-500 text-[10px] tracking-widest font-bold uppercase animate-[pulse_2s_infinite]">NYSE_CIRCUIT_BREAKER_IN:</span>
                            <span className="text-red-500 font-bold tracking-widest text-[14px]">
                                {formatTime(Math.max(0, 300 - timeElapsedSeconds))}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Bottom Row: Metrics, Severity, Teams */}
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-6">
                        <span className="text-red-500 font-bold bg-red-500/10 px-2 py-1 border border-red-500/30 text-[14px]">
                            REVENUE LOSS: ${revenueLost.toLocaleString()} <span className="text-[10px] ml-2 opacity-80">↑${currentState.metrics.burnRatePerSec}/sec</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-[#9D0A36] font-bold">
                        <span>SEVERITY: <strong className="text-red-500">P0</strong></span>
                        <span>TEAMS: <strong>3/4</strong></span>
                    </div>
                </div>
            </header>

            {/* Dashboard Workspace - Four-Panel Grid */}
            <main className="flex-1 min-h-0 overflow-hidden p-2 grid grid-cols-2 grid-rows-2 gap-2">

                {/* PANEL 1: Incident Timeline (Commander View) */}
                <div className="flex flex-col border border-[#DFFFDB] bg-[#DFFFDB] min-h-0 relative">
                    <div className="p-2 border-b border-[#DFFFDB] bg-[#DFFFDB] text-[10px] text-[#9D0A36] uppercase tracking-widest flex items-center justify-between">
                        <div className="flex items-center gap-2"><Terminal size={12} /> INCIDENT_TIMELINE</div>
                        <span className="text-[#9D0A36] opacity-50">(COMMANDER_VIEW)</span>
                    </div>
                    {selectedRole === 'COMMANDER' ? (
                        <>
                            {/* Active Narrative Context */}
                            <div className="p-3 border-b border-red-900/30 bg-[#9D0A36]/5 relative shrink-0">
                                <span className="absolute top-2 right-2 text-[9px] text-green-500">STATE: {currentState.id}</span>
                                <p className="text-[12px] text-[#9D0A36] leading-relaxed italic">
                                    {currentState.description}
                                </p>
                                {dynamicHint && timeInCurrentState >= 15 && (
                                    <div className="mt-3 p-2 border border-yellow-500/40 bg-yellow-500/10 animate-[fade-in_1s_ease-out]">
                                        <span className="text-yellow-600 font-bold text-[10px] tracking-widest uppercase">ADVISORY:</span>
                                        <p className="text-[11px] text-yellow-700 font-mono mt-1">{dynamicHint}</p>
                                    </div>
                                )}
                            </div>
                            {/* Log Stream Placeholder (Commanders don't see raw logs, they see timeline narratives) */}
                            <div className="flex-1 overflow-y-auto p-3 text-[11px] flex flex-col gap-1 font-mono">
                                <div className="text-[#9D0A36]/50 italic text-center mt-10">INCIDENT NARRATIVE TIMELINE</div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <AlertTriangle size={24} className="text-red-500 mb-2 opacity-50" />
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">RESTRICTED_ACCESS</span>
                            <span className="text-[9px] text-[#9D0A36]/50 mt-1">INCIDENT_COMMANDER Clearance Required</span>
                        </div>
                    )}
                </div>

                {/* PANEL 2: Active Shell (Engineer View) */}
                <div className={`flex flex-col border border-[#DFFFDB] bg-[#DFFFDB] min-h-0 transition-colors ${isCritical && !isGameOver ? 'border-red-900/50' : ''}`}>
                    <div className="p-2 border-b border-[#DFFFDB] bg-[#DFFFDB] text-[10px] text-[#9D0A36] uppercase tracking-widest flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2"><Terminal size={12} /> ACTIVE_SHELL</div>
                            {(selectedRole === 'ENGINEER' || selectedRole === 'DBA') && (
                                <div className="flex gap-1 bg-black/5 p-0.5 rounded">
                                    <button onClick={() => setEngineerTab('LOGS')} className={`px-2 py-0.5 transition-colors ${engineerTab === 'LOGS' ? 'bg-[#9D0A36] text-[#DFFFDB]' : 'text-[#9D0A36] hover:bg-[#9D0A36]/10'}`}>RAW_LOGS</button>
                                    <button onClick={() => setEngineerTab('RUNBOOK')} className={`px-2 py-0.5 transition-colors ${engineerTab === 'RUNBOOK' ? 'bg-[#9D0A36] text-[#DFFFDB]' : 'text-[#9D0A36] hover:bg-[#9D0A36]/10'}`}>SOP_RUNBOOK</button>
                                </div>
                            )}
                        </div>
                        <span className="text-[#9D0A36] opacity-50">(ENGINEER_VIEW)</span>
                    </div>

                    {selectedRole === 'ENGINEER' || selectedRole === 'DBA' ? (
                        <>
                            {/* Engineer Tab Content */}
                            <div className="p-3 border-b border-[#DFFFDB] shrink-0 h-[180px] overflow-hidden relative">
                                {engineerTab === 'LOGS' ? (
                                    <LogViewer logs={logs} timeElapsedSeconds={timeElapsedSeconds} />
                                ) : (
                                    <RunbookPanel />
                                )}
                            </div>

                            {/* Terminal Input */}
                            <div className="flex-1 p-3 flex flex-col justify-end bg-black">
                                {pendingActionId ? (
                                    <div className="flex flex-col gap-2 font-mono">
                                        <span className={`text-[11px] ${inputError ? 'text-red-500' : 'text-yellow-500'}`}># {inputError ? 'CMD_NOT_FOUND' : scenario.actions[pendingActionId].inputPrompt}</span>
                                        <div className={`flex items-center gap-2 border-b pb-1 ${inputError ? 'border-red-600' : 'border-gray-700'}`}>
                                            <span className={inputError ? 'text-red-500' : 'text-green-500'}>$</span>
                                            <input
                                                type="text"
                                                value={actionInput}
                                                onChange={(e) => { setActionInput(e.target.value); if (inputError) setInputError(false); }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') submitActionInput();
                                                    if (e.key === 'Escape') { setPendingActionId(null); setActionInput(''); setInputError(false); }
                                                }}
                                                className={`flex-1 bg-transparent outline-none caret-white text-[12px] ${inputError ? 'text-red-500' : 'text-green-400'}`}
                                                autoFocus
                                                spellCheck="false"
                                                autoComplete="off"
                                            />
                                            <button onClick={submitActionInput} className={`text-[9px] px-2 py-1 uppercase font-bold ${inputError ? 'bg-red-500 text-black' : 'bg-green-500 text-black hover:bg-green-400'}`}>EXEC</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 font-mono text-[12px]">
                                        <span className="text-green-500">$</span>
                                        <span className="text-yellow-500 blink-cursor">AWAITING_COMMAND_AUTHORIZATION_</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <AlertTriangle size={24} className="text-red-500 mb-2 opacity-50" />
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">RESTRICTED_ACCESS</span>
                            <span className="text-[9px] text-[#9D0A36]/50 mt-1">ENGINEER Clearance Required for Direct System Access</span>
                        </div>
                    )}
                </div>

                {/* PANEL 3: Decision Tree & Metrics (Commander View) */}
                <div className="flex flex-col border border-[#DFFFDB] bg-[#DFFFDB] min-h-0 relative">
                    <div className="p-2 border-b border-[#DFFFDB] bg-[#DFFFDB] text-[10px] text-[#9D0A36] uppercase tracking-widest flex items-center justify-between">
                        <div className="flex items-center gap-2"><Terminal size={12} /> DECISION_TREE // METRICS</div>
                        <span className="text-[#9D0A36] opacity-50">(SHARED_DASHBOARD)</span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-4 overflow-y-auto">
                        {/* Blast Radius visualizer */}
                        <div className="w-full h-[160px] border border-[#9D0A36]/30 bg-[#DFFFDB]/5 flex items-center justify-center shrink-0">
                            <BlastRadius metrics={currentState.metrics} />
                        </div>

                        {selectedRole === 'COMMANDER' ? (
                            <div className="flex flex-col gap-4">
                                <RevenueGraph revenueLost={revenueLost} burnRatePerSec={currentState.metrics.burnRatePerSec} />

                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] text-[#9D0A36] uppercase">AVAILABLE_REMEDIATION_PROTOCOLS:</span>
                                    <div className="flex flex-col gap-2">
                                        {currentState.availableActionIds.map((actionId: string) => {
                                            const action = scenario.actions[actionId];
                                            return (
                                                <button
                                                    key={actionId}
                                                    onClick={() => handleActionClick(actionId)}
                                                    disabled={isGameOver}
                                                    className="px-3 py-2 border border-[#9D0A36]/40 text-[#9D0A36] text-[11px] hover:bg-[#9D0A36]/10 text-left transition-none disabled:opacity-30 disabled:cursor-not-allowed uppercase flex items-center justify-between group"
                                                >
                                                    <span className="font-mono">&gt; ./execute {action.label.replace(/\s+/g, '_').toLowerCase()}</span>
                                                    <span className="opacity-0 group-hover:opacity-100 text-green-500">[AUTH]</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 mt-4 border border-dashed border-[#9D0A36]/30">
                                <span className="text-[10px] text-[#9D0A36] font-bold uppercase tracking-widest">COMMAND PROTOCOLS LOCKED</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* PANEL 4: External Comms / Status Page (Comms Lead) */}
                <div className="flex flex-col border border-[#DFFFDB] bg-[#DFFFDB] min-h-0 relative">
                    <div className="p-2 border-b border-[#DFFFDB] bg-[#DFFFDB] text-[10px] text-[#9D0A36] uppercase tracking-widest flex items-center justify-between">
                        <div className="flex items-center gap-2"><Terminal size={12} /> STATUS_PAGE_DRAFT</div>
                        <div className="flex items-center gap-4">
                            {selectedRole === 'COMMS' && (
                                <div className="text-red-500 bg-red-500/10 px-2 py-0.5 border border-red-500/30 text-[9px] font-bold">
                                    PUBLIC_UPDATE_DUE: {formatTime(Math.max(0, 120 - (timeElapsedSeconds % 120)))}
                                </div>
                            )}
                            <span className="text-[#9D0A36] opacity-50">(COMMS_LEAD)</span>
                        </div>
                    </div>
                    {selectedRole === 'COMMS' ? (
                        <div className="flex-1 overflow-hidden p-3 bg-black">
                            <ExternalComms timeElapsedSeconds={timeElapsedSeconds} activeAlerts={activeAlerts} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <AlertTriangle size={24} className="text-red-500 mb-2 opacity-50" />
                            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">RESTRICTED_ACCESS</span>
                            <span className="text-[9px] text-[#9D0A36]/50 mt-1">COMMS_LEAD Clearance Required</span>
                        </div>
                    )}
                </div>

            </main>

            {/* Postmortem Modal Overlay (Terminal Style) */}
            {/* Postmortem Modal Overlay (Terminal Style) */}
            {showPostmortem && (
                <PostMortemReview
                    scenario={scenario!}
                    gameOverReason={gameOverReason}
                    revenueLost={revenueLost}
                    timeElapsedSeconds={timeElapsedSeconds}
                    logs={logs}
                    onExit={() => navigate('/incidents')}
                />
            )}
        </div>
    );
}
