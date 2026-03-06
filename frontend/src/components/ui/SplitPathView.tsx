import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { User, Sparkles, Award } from 'lucide-react';
import Button from './Button';
import { API_URL, getAuthHeaders } from '../../config';

interface Step {
    action: string;
    reasoning: string;
    codeState?: string;
}

interface SplitPathViewProps {
    challengeId: string;
    attemptId: string;
    onClose: () => void;
}

export default function SplitPathView({ challengeId, attemptId, onClose }: SplitPathViewProps) {
    const [paths, setPaths] = useState<{
        humanPath: Step[];
        aiPath: Step[];
        expertPath: Step[];
        matchScore: number | null;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    // View toggles
    const [showHuman, setShowHuman] = useState(true);
    const [showAI, setShowAI] = useState(true);
    const [showExpert, setShowExpert] = useState(true);

    // Initial load
    useState(() => {
        fetch(`${API_URL}/api/ai/paths/${challengeId}/${attemptId}`, {
            credentials: 'include',
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPaths(data.data);
                }
            })
            .catch(err => console.error("Failed to fetch paths", err))
            .finally(() => setLoading(false));
    });

    if (loading) {
        return <div className="p-8 text-center text-[#E0E0E073] font-body bg-[#030303] rounded-[12px] border border-[#E0E0E080]">Loading analysis...</div>;
    }

    if (!paths) {
        return <div className="p-8 text-center text-[#E0E0E0] font-body bg-[#030303] rounded-[12px] border border-[#E0E0E080]">Failed to load path comparison.</div>;
    }

    const PathColumn = ({ title, steps, icon: Icon, color, isActive }: { title: string, steps: Step[], icon: any, color: string, isActive: boolean }) => {
        if (!isActive) return null;
        return (
            <div className="flex-1 flex flex-col border border-[#E0E0E04D] bg-[#030303] rounded-[8px] overflow-hidden min-w-[280px]">
                <div className={`p-3 flex items-center gap-2 border-b border-[#E0E0E04D] shrink-0`} style={{ backgroundColor: `${color}1A` }}>
                    <Icon size={16} color={color} />
                    <span className="font-body font-bold text-[13px] text-[#E0E0E0] tracking-wide uppercase">{title}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative pl-6">
                            <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border-2 border-[#030303] z-10" style={{ backgroundColor: color }}></div>
                            {idx !== steps.length - 1 && <div className="absolute left-1.5 top-3 w-px h-[calc(100%+16px)] bg-[#E0E0E033]"></div>}

                            <h4 className="font-body text-[14px] font-semibold text-[#E0E0E0] mb-1">{step.action}</h4>
                            <p className="font-body text-[13px] text-[#E0E0E073] leading-relaxed mb-3">{step.reasoning}</p>

                            {step.codeState && (
                                <div className="h-[120px] rounded-[6px] border border-[#E0E0E033] overflow-hidden">
                                    <Editor theme="vs-dark"
                                        height="100%"
                                        language="javascript"
                                        value={step.codeState}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 11,
                                            fontFamily: "'JetBrains Mono', monospace",
                                            readOnly: true,
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'off',
                                            padding: { top: 8, bottom: 8 }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full max-h-[85vh] bg-[#030303] border border-[#E0E0E080] rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-[fade-up_0.2s_ease-out]">
            {/* Header */}
            <div className="p-6 border-b border-[#E0E0E040] shrink-0 bg-[#030303E6] flex justify-between items-start">
                <div>
                    <h2 className="font-display text-[24px] font-bold text-[#E0E0E0] mb-2">Diagnostic Path Comparison</h2>
                    <p className="font-body text-[14px] text-[#E0E0E073]">Compare your debugging process with the AI and Expert solutions. You had a <strong className="text-[#E0E0E0]">{paths.matchScore}% reasoning match</strong>!</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowHuman(!showHuman)}
                        className={`px-3 py-1.5 rounded-[6px] font-code text-[12px] font-bold border transition-colors ${showHuman ? 'bg-[#E0E0E026] border-[#E0E0E0] text-[#E0E0E0]' : 'bg-transparent border-[#E0E0E040] text-[#E0E0E040]'}`}
                    >
                        👤 YOUR PATH
                    </button>
                    <button
                        onClick={() => setShowAI(!showAI)}
                        className={`px-3 py-1.5 rounded-[6px] font-code text-[12px] font-bold border transition-colors ${showAI ? 'bg-[#E0E0E026] border-[#E0E0E0] text-[#E0E0E0]' : 'bg-transparent border-[#E0E0E040] text-[#E0E0E040]'}`}
                    >
                        ✨ AI PATH
                    </button>
                    <button
                        onClick={() => setShowExpert(!showExpert)}
                        className={`px-3 py-1.5 rounded-[6px] font-code text-[12px] font-bold border transition-colors ${showExpert ? 'bg-[#E0E0E026] border-[#E0E0E0] text-[#E0E0E0]' : 'bg-transparent border-[#E0E0E040] text-[#E0E0E040]'}`}
                    >
                        🏆 EXPERT PATH
                    </button>
                </div>
            </div>

            {/* Split View Content */}
            <div className="flex-1 overflow-x-auto p-6 flex gap-6 mt-2 relative">
                {/* Check if none selected */}
                {!showHuman && !showAI && !showExpert && (
                    <div className="absolute inset-0 flex items-center justify-center text-[#E0E0E040] font-body text-[14px]">Select at least one path to view.</div>
                )}

                <PathColumn title="Your Path" steps={paths.humanPath || []} icon={User} color="#E0E0E0" isActive={showHuman} />
                <PathColumn title="AI Path" steps={paths.aiPath || []} icon={Sparkles} color="#E0E0E0" isActive={showAI} />
                <PathColumn title="Expert Path" steps={paths.expertPath || []} icon={Award} color="#E0E0E0" isActive={showExpert} />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E0E0E040] shrink-0 bg-[#030303] flex justify-between items-center">
                <Button variant="outline" className="text-[13px] py-1.5 px-4 h-auto">Share Comparison</Button>
                <Button variant="primary" onClick={onClose} className="text-[13px] py-1.5 px-6 h-auto">Close</Button>
            </div>
        </div>
    );
}
