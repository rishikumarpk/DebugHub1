import { useState, useEffect, useRef } from 'react';
import { PHASE_1_LOGS, PHASE_2_LOGS, PHASE_2_CYCLED_LOGS, MODULES_PHASE_1, MODULES_PHASE_2, CONFIG_TODAY, CONFIG_YESTERDAY } from '../../../data/incidents/knightCapitalData';

export const SystemsEngineerView = ({ phase }: any) => {
    const [logs, setLogs] = useState<any[]>(PHASE_1_LOGS.slice(0, 5));
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        let logIndex = 5;

        if (phase === 'NORMAL') {
            interval = setInterval(() => {
                if (logIndex < PHASE_1_LOGS.length) {
                    setLogs(prev => [...prev.slice(-100), PHASE_1_LOGS[logIndex]]);
                    logIndex++;
                }
            }, 2000);
        } else if (phase === 'INCIDENT') {
            interval = setInterval(() => {
                if (logIndex < PHASE_2_LOGS.length) {
                    setLogs(prev => [...prev.slice(-100), PHASE_2_LOGS[logIndex]]);
                    logIndex++;
                } else {
                    const baseCycleLog = PHASE_2_CYCLED_LOGS[Math.floor(Math.random() * PHASE_2_CYCLED_LOGS.length)];
                    const cycleLog = { ...baseCycleLog, time: new Date().toLocaleTimeString('en-US', { hour12: false }) };
                    setLogs(prev => [...prev.slice(-100), cycleLog]);
                }
            }, 300);
        }

        return () => clearInterval(interval);
    }, [phase]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    const bgColors = {
        INFO: 'text-blue-400',
        WARN: 'text-amber-500',
        ERROR: 'text-red-500',
    };

    const modules = phase === 'NORMAL' ? MODULES_PHASE_1 : MODULES_PHASE_2;

    return (
        <div className="h-full flex flex-col pt-4 pb-4 px-4 overflow-hidden">
            <div className="flex-1 flex gap-4 overflow-hidden mb-4">
                <div className="w-1/3 flex flex-col bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-700 tracking-wider flex justify-between">
                        <span>System Logs Stream (/var/log/smars)</span>
                        <span className={phase === 'INCIDENT' ? 'text-red-500 animate-[pulse_1s_ease-in-out_infinite]' : 'text-green-500'}>
                            {phase === 'NORMAL' ? 'NORMAL TRAFFIC' : 'FLOOD DETECTED'}
                        </span>
                    </div>
                    <div ref={containerRef} className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1">
                        {logs.filter(Boolean).map((L, i) => (
                            <div key={i} className="flex space-x-3">
                                <span className="text-gray-500 shrink-0">{L?.time || '08:0X:XX'}</span>
                                <span className={`w-12 shrink-0 ${(bgColors as any)[L?.level] || 'text-gray-400'}`}>{L?.level || 'INFO'}</span>
                                <span className="text-gray-300 break-words">{L?.message || ''}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-1/3 flex flex-col gap-4">
                    <div className="h-[50%] flex flex-col bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-700 tracking-wider">
                            Deployment Config — v4.2.1
                        </div>
                        <div className="flex-1 p-4 font-mono text-[10px] overflow-auto text-gray-300 whitespace-pre">
                            {CONFIG_TODAY}
                        </div>
                    </div>
                    <div className="h-[50%] flex flex-col bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-700 tracking-wider">
                            Previous Config — v4.2.0 (Diff)
                        </div>
                        <div className="flex-1 p-4 font-mono text-[10px] overflow-auto text-gray-500 whitespace-pre bg-[#1e1e1e]">
                            {CONFIG_YESTERDAY}
                        </div>
                    </div>
                </div>

                <div className="w-1/3 flex flex-col bg-gray-900 border border-gray-700 rounded-md overflow-hidden">
                    <div className="bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-700 tracking-wider">
                        Module Process Registry
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="text-gray-500">
                                <tr>
                                    <th className="pb-2 font-bold uppercase">Module</th>
                                    <th className="pb-2 font-bold uppercase">Expected</th>
                                    <th className="pb-2 font-bold uppercase">Current</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 space-y-2">
                                {modules.map((m, i) => (
                                    <tr key={i} className="h-10">
                                        <td className="text-gray-300 font-medium">{m.label}</td>
                                        <td className="text-gray-500 font-mono">{m.expected}</td>
                                        <td className="font-mono">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${m.expected === m.status ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500 animate-pulse'}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
