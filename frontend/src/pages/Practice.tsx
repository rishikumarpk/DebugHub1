import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Check, RotateCcw, Zap, Loader2 } from 'lucide-react';
import Badge, { type BadgeColor } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SplitPathView from '../components/ui/SplitPathView';
import { API_URL, getAuthHeaders } from '../config';

interface PracticeChallenge {
    id: string;
    language: string;
    bugType: string;
    difficulty: string;
    context: string;
    buggyCode: string;
    expectedOutput: string;
    hint1: string;
    hint2: string;
    hint3: string;
}

export default function Practice() {
    const [challenge, setChallenge] = useState<PracticeChallenge | null>(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [hintsRevealed, setHintsRevealed] = useState(0);
    const [running, setRunning] = useState(false);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [solved, setSolved] = useState(0);
    const [difficulty, setDifficulty] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showSplitView, setShowSplitView] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Timer
    useEffect(() => {
        if (challenge && success === null && !loading) {
            const t = setInterval(() => setTimeElapsed((p: number) => p + 1), 1000);
            return () => clearInterval(t);
        }
    }, [challenge, success, loading]);

    const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    const fetchChallenge = async (diff?: string) => {
        setLoading(true);
        setSuccess(null);
        setOutput('');
        setHintsRevealed(0);
        setTimeElapsed(0);
        setAttemptId(null);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (diff) params.append('difficulty', diff);
            if (selectedLanguage) params.append('language', selectedLanguage);

            const url = `${API_URL}/api/challenges/practice/generate?${params.toString()}`;
            const res = await fetch(url, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Server returned ${res.status}: ${errText.substring(0, 100)}`);
            }
            const data = await res.json();
            if (data.success) {
                setChallenge(data.data);
                setCode(data.data.buggyCode);
                setDifficulty(data.data.difficulty);
            } else {
                setError(data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to generate challenge. Please try again.'));
            }
        } catch (e: any) {
            console.error('Failed to fetch practice challenge', e);
            setError(e.message || 'Connection error. Please check your internet.');
        }
        setLoading(false);
    };

    const handleRun = async () => {
        if (!challenge) return;
        setRunning(true);
        setOutput('Running...');
        try {
            const res = await fetch(`${API_URL}/api/challenges/practice/${challenge.id}/run`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ code }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setOutput(data.data.stdout || data.data.stderr || 'No output');
            } else {
                setOutput(data.error || 'Execution failed');
            }
        } catch (e: any) {
            setOutput('Execution error: ' + e.message);
        }
        setRunning(false);
    };

    const handleSubmit = async () => {
        if (!challenge) return;
        setRunning(true);
        try {
            const res = await fetch(`${API_URL}/api/challenges/practice/${challenge.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    code,
                    hintsUsed: hintsRevealed,
                    timeTakenMs: timeElapsed * 1000
                }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(data.data.isSolved);
                setOutput(data.data.actual || '');
                if (data.data.isSolved) {
                    setSolved((p: number) => p + 1);
                    setAttemptId(data.data.attemptId);
                }
            }
        } catch (e: any) {
            setOutput('Submit error: ' + e.message);
        }
        setRunning(false);
    };

    const hints = challenge ? [challenge.hint1, challenge.hint2, challenge.hint3] : [];

    // Unified layout with persistent selection
    return (
        <div className="w-full h-[calc(100vh-48px)] flex flex-col relative bg-[#030303]">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen pointer-events-none">
                <source src="/practice-bg.mp4" />
            </video>

            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#03030380] backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <Loader2 size={32} className="text-[#E0E0E0] animate-spin" />
                        <span className="font-body text-[#E0E0E073]">Generating challenge...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-500/90 text-white px-6 py-3 rounded-[8px] font-display font-medium shadow-[0_10px_30px_rgba(255,0,0,0.3)] animate-bounce">
                    {error}
                </div>
            )}

            <div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Left Panel */}
                <div className="w-full md:w-[280px] shrink-0 bg-[#030303F2] border-b md:border-b-0 md:border-r border-[#E0E0E026] p-6 overflow-y-auto flex flex-col gap-6 max-h-[40vh] md:max-h-full">
                    {/* Practice Mode Selection */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-body font-bold text-[12px] text-[#E0E0E0] uppercase tracking-wider mb-1">New Challenge</h3>
                        <div className="flex flex-col gap-2">
                            <select
                                className="w-full bg-[#03030333] border border-[#E0E0E040] rounded-[8px] py-1.5 px-3 text-[12px] text-[#E0E0E0] focus:outline-none focus:border-[#E0E0E0]"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                <option value="">Any Language</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="go">Go</option>
                            </select>
                            <div className="flex gap-1">
                                <button onClick={() => fetchChallenge('EASY')} className={`flex-1 py-1 rounded-[4px] border border-[#E0E0E020] text-[10px] uppercase font-bold transition-all ${difficulty === 'EASY' ? 'bg-[#E0E0E0] text-[#030303]' : 'text-[#E0E0E073] hover:bg-[#E0E0E01A]'}`}>Easy</button>
                                <button onClick={() => fetchChallenge('MEDIUM')} className={`flex-1 py-1 rounded-[4px] border border-[#E0E0E020] text-[10px] uppercase font-bold transition-all ${difficulty === 'MEDIUM' ? 'bg-[#E0E0E0] text-[#030303]' : 'text-[#E0E0E073] hover:bg-[#E0E0E01A]'}`}>Med</button>
                                <button onClick={() => fetchChallenge('HARD')} className={`flex-1 py-1 rounded-[4px] border border-[#E0E0E020] text-[10px] uppercase font-bold transition-all ${difficulty === 'HARD' ? 'bg-[#E0E0E0] text-[#030303]' : 'text-[#E0E0E073] hover:bg-[#E0E0E01A]'}`}>Hard</button>
                            </div>
                            <Button variant="cta" onClick={() => fetchChallenge()} className="w-full py-1.5 text-[11px] mt-1">
                                <RotateCcw size={12} className="mr-2" /> Random
                            </Button>
                        </div>
                    </div>

                    {challenge && (
                        <>
                            <div className="divider my-0 opacity-20"></div>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <Badge color={challenge.language.toLowerCase() as BadgeColor}>{challenge.language.toUpperCase()}</Badge>
                                    <Badge color={challenge.difficulty.toLowerCase() as BadgeColor}>{challenge.difficulty.toUpperCase()}</Badge>
                                </div>
                                <p className="italic text-[13px] text-[#E0E0E073]">"{challenge.context}"</p>
                            </div>

                            <div className="divider my-0 opacity-20"></div>

                            <div className="flex flex-col gap-2">
                                <span className="font-body text-[13px] font-semibold text-[#E0E0E0]">Expected Output</span>
                                <div className="font-code text-[13px] text-[#E0E0E0] bg-[#030303] border border-[#E0E0E01A] p-3 rounded-[6px]">
                                    {challenge.expectedOutput}
                                </div>
                            </div>

                            <div className="divider my-0 opacity-20"></div>

                            <div className="flex flex-col gap-3">
                                <span className="font-body text-[13px] font-semibold text-[#E0E0E0]">Hints</span>
                                <div className="flex flex-col gap-2">
                                    {hints.map((_, idx) => (
                                        <div key={idx}>
                                            {hintsRevealed > idx ? (
                                                <div className="bg-[#E0E0E026] border-l-[3px] border-l-[#E0E0E0] p-3 rounded-r-[6px] font-body text-[13px] text-[#E0E0E0]">
                                                    <span className="font-semibold text-[#E0E0E0] block mb-1">Hint {idx + 1}</span>
                                                    {idx === 0 ? challenge.hint1 : idx === 1 ? challenge.hint2 : challenge.hint3}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setHintsRevealed(idx + 1)}
                                                    disabled={hintsRevealed !== idx}
                                                    className="w-full text-left p-3 rounded-[6px] bg-[#03030333] hover:bg-[#03030366] border border-[#E0E0E01A] text-[#E0E0E073] text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                                                >
                                                    Reveal Hint {idx + 1}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {hintsRevealed > 0 && (
                                    <span className="text-[12px] text-[#E0E0E0] font-semibold mt-2">{hintsRevealed}/3 hints used</span>
                                )}
                            </div>
                        </>
                    )}

                    <div className="mt-auto pt-4 border-t border-[#E0E0E01A]">
                        <div className="flex justify-between text-[12px] font-body">
                            <span className="text-[#E0E0E073]">Solved this session</span>
                            <span className="text-[#E0E0E0] font-bold">{solved}</span>
                        </div>
                    </div>
                </div>

                {/* Editor / Main View */}
                <div className="flex-1 flex flex-col min-w-0">
                    {!challenge ? (
                        <div className="flex-1 flex items-center justify-center p-12 text-center relative overflow-hidden">
                            <div className="max-w-[400px] flex flex-col items-center gap-6 relative z-10 animate-[fade-up_0.8s_ease-out]">
                                <div className="w-16 h-16 rounded-[12px] bg-[#E0E0E00D] flex items-center justify-center">
                                    <Zap size={32} className="text-[#E0E0E040]" />
                                </div>
                                <h2 className="font-display text-[24px] font-bold text-[#E0E0E0]">Ready to Practice?</h2>
                                <p className="font-body text-[14px] text-[#E0E0E073]">
                                    Select a language and difficulty from the sidebar to generate a new debugging challenge.
                                </p>
                                <Button variant="cta" onClick={() => fetchChallenge()} className="px-8 mt-4">
                                    Generate Random Challenge
                                </Button>
                            </div>

                            {/* Subtle grid background for the empty editor space */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#E0E0E0 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 w-full relative editor-container">
                                <Editor theme="vs-dark"
                                    height="100%"
                                    language={challenge.language === 'cpp' ? 'cpp' : challenge.language === 'java' ? 'java' : 'python'}
                                    value={code}
                                    onChange={(val) => setCode(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        padding: { top: 20 },
                                        renderLineHighlight: 'all',
                                        scrollBeyondLastLine: false,
                                        wordWrap: "on"
                                    }}
                                    onMount={(_editor, monaco) => {
                                        monaco.editor.defineTheme('debughub-dark', {
                                            base: 'vs-dark', inherit: true,
                                            rules: [
                                                { token: 'comment', foreground: '5C5A8A', fontStyle: 'italic' },
                                                { token: 'keyword', foreground: '8474B7' },
                                                { token: 'string', foreground: '72CBD7' },
                                                { token: 'identifier', foreground: 'DEDEDD' },
                                            ],
                                            colors: {
                                                'editor.background': '#030303',
                                                'editor.lineHighlightBackground': '#E0E0E00D',
                                            }
                                        });
                                        monaco.editor.setTheme('debughub-dark');
                                    }}
                                />
                            </div>

                            {/* Action Bar */}
                            <div className="h-[60px] bg-[#030303F2] shrink-0 w-full flex items-center justify-between px-6 border-t border-[#E0E0E01A]">
                                <div className="flex items-center gap-3">
                                    <Button variant="cta" onClick={handleRun} disabled={running} className="flex items-center gap-2 px-4 py-2 text-[13px]">
                                        <Play size={14} fill="currentColor" /> Run
                                    </Button>
                                    <Button variant="primary" onClick={handleSubmit} disabled={running} className="flex items-center gap-2 px-4 py-2 text-[13px]">
                                        <Check size={14} /> Submit
                                    </Button>
                                    <div className="w-[1px] h-6 bg-[#E0E0E01A] mx-2"></div>
                                    <Button variant="outline" onClick={() => fetchChallenge()} className="flex items-center gap-2 px-4 py-2 text-[13px]">
                                        <RotateCcw size={14} /> New Bug
                                    </Button>
                                </div>
                                <div className="font-display text-[15px] font-bold text-[#E0E0E0]">
                                    {formatTime(timeElapsed)}
                                </div>
                            </div>

                            <div className="console w-full shrink-0">
                                {success === true && (
                                    <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/20 flex justify-between items-center text-emerald-400 font-semibold text-[13px]">
                                        <span>✓ Correct! Challenge solved in {formatTime(timeElapsed)}.</span>
                                        <Button
                                            variant="outline"
                                            className="py-1 px-3 text-[11px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                                            onClick={() => setShowSplitView(true)}
                                        >
                                            Compare Your Diagnostic Path
                                        </Button>
                                    </div>
                                )}
                                {success === false && (
                                    <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-red-400 text-[13px]">✗ Not quite right. Expected: {challenge.expectedOutput}</div>
                                )}
                                {success === null && output ? (
                                    <div className={`p-4 border-t border-[#E0E0E01A] text-[13px] font-code ${output.toLowerCase().includes('error') ? 'text-red-400' : 'text-[#E0E0E0]'}`}>
                                        {">"} {output}
                                    </div>
                                ) : success === null ? (
                                    <div className="p-4 border-t border-[#E0E0E01A] text-[#E0E0E040] text-[13px] font-code">{">"} Ready to run...</div>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Split View Modal */}
            {showSplitView && attemptId && challenge && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-[#030303E6] backdrop-blur-[12px]" onClick={() => setShowSplitView(false)}></div>
                    <div className="w-full max-w-[1200px] h-full relative z-10 flex items-center justify-center">
                        <SplitPathView
                            challengeId={challenge.id}
                            attemptId={attemptId}
                            onClose={() => setShowSplitView(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
