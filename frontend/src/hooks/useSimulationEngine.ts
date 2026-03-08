import { useState, useEffect, useCallback } from 'react';
import { getScenarioById } from '../data/incidents';
import type { ActionSeverity, IncidentScenario, IncidentState, IncidentAlert } from '../data/incidents/types';

export interface SimulationState {
    scenario: IncidentScenario | null;
    currentState: IncidentState | null;
    revenueLost: number;
    timeElapsedSeconds: number;
    timeInCurrentState: number;
    logs: string[];
    activeAlerts: IncidentAlert[];
    isGameOver: boolean;
    gameOverReason: 'STABILIZED' | 'BANKRUPT' | null;
    lastActionId?: string;
    lastActionSeverity?: ActionSeverity;
}

export const useSimulationEngine = () => {
    const [simState, setSimState] = useState<SimulationState>({
        scenario: null,
        currentState: null,
        revenueLost: 0,
        timeElapsedSeconds: 0,
        timeInCurrentState: 0,
        logs: [],
        activeAlerts: [],
        isGameOver: false,
        gameOverReason: null,
        lastActionId: undefined,
        lastActionSeverity: undefined
    });

    const [loading, setLoading] = useState(true);

    const loadScenario = useCallback(async (scenarioId: string) => {
        setLoading(true);
        try {
            // In a real app we might fetch this. Here we import from our local data map
            const scenario = getScenarioById(scenarioId);
            if (!scenario) throw new Error("Scenario not found");

            const initialState = scenario.states[scenario.initialStateId];

            setSimState({
                scenario,
                currentState: initialState,
                revenueLost: 0,
                timeElapsedSeconds: 0,
                timeInCurrentState: 0,
                logs: initialState.logs ? [...initialState.logs] : [],
                activeAlerts: [],
                isGameOver: false,
                gameOverReason: null,
                lastActionId: undefined,
                lastActionSeverity: undefined
            });
        } catch (e: any) {
            console.error("Failed to load scenario", e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Timer tick for metrics
    useEffect(() => {
        if (loading || simState.isGameOver || !simState.currentState || !simState.scenario) return;

        const timer = setInterval(() => {
            setSimState((prev: SimulationState) => {
                if (prev.isGameOver || !prev.currentState || !prev.scenario) return prev;

                const burnRate = prev.currentState.metrics.burnRatePerSec;
                const newLoss = prev.revenueLost + burnRate;

                let nextGameOver: boolean = prev.isGameOver;
                let nextReason = prev.gameOverReason;

                if (newLoss >= prev.scenario.thresholdLoss) {
                    nextGameOver = true;
                    nextReason = 'BANKRUPT';
                }

                const newTimeInState = prev.timeInCurrentState + 1;

                if (prev.currentState.autoTransition && newTimeInState >= prev.currentState.autoTransition.durationSeconds) {
                    const nextStateId = prev.currentState.autoTransition.stateId;
                    const nextState = prev.scenario.states[nextStateId];
                    if (nextState) {
                        return {
                            ...prev,
                            revenueLost: newLoss,
                            currentState: nextState,
                            timeElapsedSeconds: prev.timeElapsedSeconds + 1,
                            timeInCurrentState: 0,
                            logs: [...prev.logs, ...(nextState.logs || [])],
                            activeAlerts: [], // clear alerts on transition
                            isGameOver: nextState.isTerminal ? true : nextGameOver,
                            gameOverReason: nextState.isTerminal ? (nextState.visualMode === 'crash' ? 'BANKRUPT' : 'STABILIZED') : nextReason
                        };
                    }
                }

                const newAlerts = prev.currentState.alerts?.filter(a => a.triggerAfterSeconds === newTimeInState) || [];

                return {
                    ...prev,
                    revenueLost: newLoss,
                    timeElapsedSeconds: prev.timeElapsedSeconds + 1,
                    timeInCurrentState: newTimeInState,
                    activeAlerts: [...prev.activeAlerts, ...newAlerts],
                    isGameOver: nextGameOver,
                    gameOverReason: nextReason
                };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, simState.isGameOver, simState.currentState, simState.scenario]);

    const takeAction = useCallback((actionId: string) => {
        setSimState((prev: SimulationState) => {
            if (prev.isGameOver || !prev.scenario || !prev.currentState) return prev;

            const actionDef = prev.scenario.actions[actionId];
            if (!actionDef) return prev;

            const nextStateId = actionDef.nextStateId;
            const nextState = prev.scenario.states[nextStateId];

            if (!nextState) return prev;

            const newLogs = [...prev.logs, `> User Action: ${actionDef.label}`];
            if (nextState.logs) {
                newLogs.push(...nextState.logs);
            }

            let nextGameOver: boolean = prev.isGameOver;
            let nextReason = prev.gameOverReason;
            let newLoss = prev.revenueLost;

            let extraLogs = [];
            if (actionDef.severity === 'BLUNDER') {
                const blunderPenalty = prev.scenario.thresholdLoss * 0.15; // 15% chunk for a blunder
                newLoss += blunderPenalty;
                extraLogs.push(`[BLUNDER DETECTED] Severe penalty applied: +$${blunderPenalty.toLocaleString()}`);
                if (actionDef.blastDescription) {
                    extraLogs.push(`[BLAST RADIUS] ${actionDef.blastDescription}`);
                }
                if (newLoss >= prev.scenario.thresholdLoss) {
                    nextGameOver = true;
                    nextReason = 'BANKRUPT';
                }
            } else if (actionDef.severity === 'RISKY') {
                const riskyPenalty = prev.scenario.thresholdLoss * 0.05;
                newLoss += riskyPenalty;
                extraLogs.push(`[RISKY ACTION WARNING] Penalty applied: +$${riskyPenalty.toLocaleString()}`);
            }

            if (nextState.isTerminal && !nextGameOver) {
                nextGameOver = true;
                nextReason = nextState.visualMode === 'crash' ? 'BANKRUPT' : 'STABILIZED';
            }

            return {
                ...prev,
                revenueLost: newLoss,
                currentState: nextState,
                logs: [...newLogs, ...extraLogs],
                timeInCurrentState: 0,
                activeAlerts: [], // We clear active alerts when moving state to make room for new ones? Actually the original code does this. Let's keep it.
                isGameOver: nextGameOver,
                gameOverReason: nextReason,
                lastActionId: actionId,
                lastActionSeverity: actionDef.severity || 'SAFE'
            };
        });
    }, []);

    const dismissAlert = useCallback((alertId: string) => {
        setSimState((prev: SimulationState) => ({
            ...prev,
            activeAlerts: prev.activeAlerts.filter(a => a.id !== alertId)
        }));
    }, []);

    return {
        ...simState,
        loading,
        loadScenario,
        takeAction,
        dismissAlert
    };
};
