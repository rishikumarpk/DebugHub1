import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Check, RotateCcw, Zap, Loader2 } from 'lucide-react';
import Badge from '../components/ui/Badge';
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
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [solved, setSolved] = useState(0);
    const [difficulty, setDifficulty] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showSplitView, setShowSplitView] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Timer
    useEffect(() => {
        if (challenge && success === null && !loading) {
            const t = setInterval(() => setTimeElapsed(p => p + 1), 1000);
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
                setError(data.error || 'Failed to generate challenge. Please try again.');
            }
        } catch (e) {
            console.error('Failed to fetch practice challenge', e);
            setError('Connection error. Please check your internet or API_URL configuration.');
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
                body: JSON.stringify({ code }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(data.data.isSolved);
                setOutput(data.data.actual || '');
                if (data.data.isSolved) {
                    setSolved(p => p + 1);
                    // Generate a fake attemptId for the Practice View to render SplitPathView
                    setAttemptId(`practice-attempt-${Date.now()}`);
                }
            }
        } catch (e: any) {
            setOutput('Submit error: ' + e.message);
        }
        setRunning(false);
    };

    const hints = challenge ? [challenge.hint1, challenge.hint2, challenge.hint3] : [];

    // Initial empty state
    if (!challenge && !loading) {
        return (
            <div className="w-full h-[calc(100vh-48px)] flex items-center justify-center relative bg-[#030303]">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-screen pointer-events-none">
                    <source src="/practice-bg.mp4" />
                </video>
                <div className="relative z-10 flex flex-col items-center gap-8 animate-[fade-up_0.5s_ease-out]">
                    <div className="w-20 h-20 rounded-[16px] bg-[#E0E0E01A] flex items-center justify-center">
                        <Zap size={36} className="text-[#E0E0E0]" />
                    </div>
                    <div className="text-center">
                        <h1 className="font-display text-[36px] font-bold text-[#E0E0E0] mb-3">Practice Mode</h1>
                        <p className="font-body text-[15px] text-[#E0E0E073] max-w-[400px]">
                            Unlimited challenges in your preferred language. No streak pressure — just pure debugging practice.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full max-w-[300px]">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-400 text-[13px] text-center mb-2">
                                {error}
                            </div>
                        )}
                        <Button type="button" variant="cta" onClick={() => fetchChallenge()} className="w-full py-3 text-[15px]">
                            <Zap size={18} className="mr-2" /> Start Random Challenge
                        </Button>
                        <div className="flex flex-col gap-2 w-full">
                            <select
                                className="w-full bg-[#03030333] border border-[#E0E0E040] rounded-[8px] py-2 px-3 text-[13px] text-[#E0E0E0] focus:outline-none focus:border-[#E0E0E0] mb-2"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                <option value="">Any Language</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="go">Go</option>
                            </select>

                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => fetchChallenge('EASY')} className="flex-1 text-[12px] py-2">Easy</Button>
                                <Button type="button" variant="outline" onClick={() => fetchChallenge('MEDIUM')} className="flex-1 text-[12px] py-2">Medium</Button>
                                <Button type="button" variant="outline" onClick={() => fetchChallenge('HARD')} className="flex-1 text-[12px] py-2">Hard</Button>
                            </div>
                        </div>
                    </div>
                    <p className="font-body text-[11px] text-[#E0E0E040] mt-4">
                        ⓘ Practice challenges do not affect your streak or rhythm score.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-[calc(100vh-48px)] flex items-center justify-center relative bg-[#030303]">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-screen pointer-events-none">
                    <source src="/practice-bg.mp4" />
                </video>
                <div className="relative z-10 flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 size={32} className="text-[#E0E0E0] animate-spin" />
                    <span className="font-body text-[#E0E0E073]">Generating challenge...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-48px)] flex flex-col relative bg-[#030303]">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen pointer-events-none">
                <source src="/practice-bg.mp4" />
            </video>
            <div className="relative z-10 flex flex-1 overflow-hidden">
                {/* Left Panel */}
                <div className="w-[280px] shrink-0 bg-[#030303F2] border-r border-[#E0E0E026] p-6 overflow-y-auto flex flex-col gap-6">
                    {/* Practice Mode Badge */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#E0E0E01A] border border-[#E0E0E033]">
                        <Zap size={14} className="text-[#E0E0E0]" />
                        <span className="font-body text-[12px] font-bold text-[#E0E0E0] uppercase tracking-wider">Practice Mode</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <Badge color={challenge!.language as any}>{challenge!.language.toUpperCase()}</Badge>
                            <Badge color={challenge!.difficulty as any}>{challenge!.difficulty.toUpperCase()}</Badge>
                        </div>
                        <p className="italic text-[13px] text-[#E0E0E073]">"{challenge!.context}"</p>
                    </div>

                    <div className="divider my-0"></div>

                    <div className="flex flex-col gap-2">
                        <span className="font-body text-[13px] font-semibold text-[#E0E0E0]">Expected Output</span>
                        <div className="font-code text-[13px] text-[#E0E0E0] bg-[#030303] border border-[#E0E0E01A] p-3 rounded-[6px]">
                            {challenge!.expectedOutput}
                        </div>
                    </div>

                    <div className="divider my-0"></div>

                    <div className="flex flex-col gap-3">
                        <span className="font-body text-[13px] font-semibold text-[#E0E0E0]">Hints</span>
                        <div className="flex flex-col gap-2">
                            {[0, 1, 2].map(idx => (
                                <div key={idx}>
                                    {hintsRevealed > idx ? (
                                        <div className="bg-[#E0E0E026] border-l-[3px] border-l-[#E0E0E0] p-3 rounded-r-[6px] font-body text-[13px] text-[#E0E0E0]">
                                            <span className="font-semibold text-[#E0E0E0] block mb-1">Hint {idx + 1}</span>
                                            {hints[idx]}
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
                        {hintsRevealed >= 3 && !success && (
                            <button
                                onClick={async () => {
                                    if (!challenge) return;
                                    try {
                                        const res = await fetch(`${API_URL}/api/challenges/${challenge.id}/answer`, {
                                            credentials: 'include',
                                            headers: getAuthHeaders()
                                        });
                                        const data = await res.json();
                                        if (data.success) setCode(data.data.correctCode);
                                    } catch (e) {
                                        console.error('Failed to fetch answer', e);
                                    }
                                }}
                                className="mt-3 w-full py-3 rounded-[8px] bg-[#E0E0E01A] border border-[#E0E0E04D] text-[#E0E0E0] font-body font-semibold text-[13px] hover:bg-[#E0E0E033] hover:border-[#E0E0E0] transition-all"
                            >
                                🔓 Show Correct Answer
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-auto pt-4 border-t border-[#E0E0E01A]">
                        <div className="flex justify-between text-[12px] font-body">
                            <span className="text-[#E0E0E073]">Solved this session</span>
                            <span className="text-[#E0E0E0] font-bold">{solved}</span>
                        </div>
                        <p className="text-[10px] text-[#E0E0E040] mt-2">Practice doesn't affect streak or rhythm.</p>
                    </div>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 w-full relative editor-container">
                        <Editor theme="vs-dark"
                            height="100%"
                            language={challenge!.language === 'cpp' ? 'cpp' : challenge!.language === 'java' ? 'java' : 'python'}
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
                            beforeMount={(monaco) => {
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
                                        'editorLineNumber.foreground': '#E0E0E0',
                                        'editor.lineHighlightBackground': '#030303',
                                    }
                                });
                            }}
                            onMount={(_editor, monaco) => monaco.editor.setTheme('debughub-dark')}
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="h-[60px] action-bar shrink-0 w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="cta" onClick={handleRun} disabled={running} className="flex items-center gap-2 px-4 py-2">
                                <Play size={16} fill="currentColor" /> Run
                            </Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={running} className="flex items-center gap-2 px-4 py-2">
                                <Check size={16} /> Submit
                            </Button>
                            {success !== null && (
                                <Button variant="outline" onClick={() => fetchChallenge(difficulty)} className="flex items-center gap-2 px-4 py-2">
                                    <RotateCcw size={16} /> Next Challenge
                                </Button>
                            )}
                        </div>
                        <div className="font-display text-[15px] font-bold text-[#E0E0E0]">
                            {formatTime(timeElapsed)}
                        </div>
                    </div>

                    <div className="console w-full shrink-0">
                        {success === true && (
                            <div className="console-info flex justify-between items-center text-[#E0E0E0] font-semibold">
                                <span>✓ Correct! Challenge solved in {formatTime(timeElapsed)}.</span>
                                <Button
                                    variant="outline"
                                    className="py-1 px-3 text-[12px] border-[#E0E0E0] text-[#E0E0E0] hover:bg-[#E0E0E01A]"
                                    onClick={() => setShowSplitView(true)}
                                >
                                    Compare Your Diagnostic Path
                                </Button>
                            </div>
                        )}
                        {success === false && (
                            <div className="console-error">✗ Not quite right. Expected: {challenge!.expectedOutput}</div>
                        )}
                        {success === null && output ? (
                            <div className={output.toLowerCase().includes('error') ? 'console-error' : 'console-info'}>
                                {">"} {output}
                            </div>
                        ) : success === null ? (
                            <div className="text-[#E0E0E0]">{">"} Ready to run...</div>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Split View Modal */}
            {showSplitView && attemptId && challenge && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-[#030303E6] backdrop-blur-[12px]"></div>
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
