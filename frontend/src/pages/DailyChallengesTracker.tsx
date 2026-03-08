import { useState, useEffect, useRef } from 'react';
import { Calendar, Trophy, Zap, Code, ShieldCheck, Play, Check, Bug } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { toPng } from 'html-to-image';
import Card from '../components/ui/Card';
import Badge, { type BadgeColor } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import SplitPathView from '../components/ui/SplitPathView';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { API_URL, getAuthHeaders } from '../config';

interface Challenge {
    id: string;
    date: string;
    language: string;
    bugType: string;
    difficulty: string;
    context: string;
    buggyCode: string;
    correctCode?: string;
    expectedOutput: string;
    hint1: string;
    hint2: string;
    hint3: string;
    isSolved?: boolean;
}

interface HistoryItem {
    id: string;
    date: string;
    language: string;
    difficulty: string;
    solved: boolean;
    score: number;
}

export default function DailyChallengesTracker() {
    const { user } = useAuthStore();
    const { editorFontSize } = useSettingsStore();
    const cardRef = useRef<HTMLDivElement>(null);

    // Tracker States
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loadingTracker, setLoadingTracker] = useState(true);

    // Challenge States
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [code, setCode] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [hintsRevealed, setHintsRevealed] = useState<number>(0);
    const [loadingChallenge, setLoadingChallenge] = useState<boolean>(true);
    const [running, setRunning] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [timeElapsed, setTimeElapsed] = useState<number>(0);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showSplitView, setShowSplitView] = useState(false);
    const [isAlreadySolved, setIsAlreadySolved] = useState<boolean>(false);

    // Stats derived from user store
    const streak = user?.streak || { currentStreak: 0, rhythmScore: 0, avgReasoningScore: 0 };
    const stats = {
        totalChallenges: 30,
        solvedChallenges: user?.stats?.bugsFixed || 0,
        currentStreak: streak.currentStreak,
        avgReasoningScore: streak.avgReasoningScore || 0
    };

    useEffect(() => {
        // Fetch History
        fetch(`${API_URL}/api/challenges/history`, {
            credentials: 'include',
            headers: getAuthHeaders()
        })
            .then(r => r.json())
            .then(d => {
                if (d.success) setHistory(d.data);
            })
            .catch(e => console.error(e))
            .finally(() => setLoadingTracker(false));

        // Fetch Today's Challenge
        fetch(`${API_URL}/api/challenges/today`, {
            credentials: 'include',
            headers: getAuthHeaders()
        })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setChallenge(d.data);
                    setCode(d.data.buggyCode);
                    if (d.data.isSolved) {
                        setIsAlreadySolved(true);
                    }
                }
            })
            .catch(e => console.error(e))
            .finally(() => setLoadingChallenge(false));
    }, []);

    // Timer logic
    useEffect(() => {
        if (!success && !loadingChallenge && challenge && !isAlreadySolved) {
            const timer = setInterval(() => {
                setTimeElapsed((prev: number) => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [success, loadingChallenge, challenge, isAlreadySolved]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleRun = async () => {
        if (!challenge) return;
        setRunning(true);
        setOutput('Running...');
        try {
            const res = await fetch(`${API_URL}/api/challenges/${challenge.id}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
            setOutput('Execution error: ' + (e.message || 'Connection lost'));
        }
        setRunning(false);
    };

    const handleSubmit = async () => {
        if (!challenge) return;
        setRunning(true);
        try {
            const res = await fetch(`${API_URL}/api/challenges/${challenge.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ code, hintsUsed: hintsRevealed, timeTakenMs: timeElapsed * 1000 }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(data.data.isSolved);
                setOutput(data.data.actual);
                if (data.data.attemptId) setAttemptId(data.data.attemptId);

                // Refresh user data & history
                const meRes = await fetch(`${API_URL}/auth/me`, { credentials: 'include', headers: getAuthHeaders() });
                const meData = await meRes.json();
                if (meData.success) useAuthStore.getState().setUser(meData.data);

                const histRes = await fetch(`${API_URL}/api/challenges/history`, { credentials: 'include', headers: getAuthHeaders() });
                const histData = await histRes.json();
                if (histData.success) setHistory(histData.data);
            }
        } catch (e) {
            console.error('Submission failed', e);
            setOutput('Error: Connection lost. Please try again.');
        } finally {
            setRunning(false);
        }
    };

    const handleDownloadCard = () => {
        if (cardRef.current) {
            toPng(cardRef.current, { cacheBust: true, backgroundColor: '#030303', pixelRatio: 2 })
                .then((dataUrl: string) => {
                    const link = document.createElement('a');
                    link.download = `debughub-streak-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = dataUrl;
                    link.click();
                });
        }
    };

    interface StatCardProps {
        title: string;
        value: string | number;
        icon: any;
        color: string;
    }
    const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
        <Card className="flex flex-col p-6 bg-[#0303034D] border-[#E0E0E033] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-10`} style={{ backgroundColor: color }}></div>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[#E0E0E073] text-[12px] font-bold uppercase tracking-wider">{title}</span>
                <Icon size={18} color={color} />
            </div>
            <div className="font-display text-3xl font-bold text-[#E0E0E0] mb-1">{value}</div>
        </Card>
    );

    if (loadingChallenge || loadingTracker) return <div className="p-12 text-center text-[#E0E0E073]">Initializing war room...</div>;

    const showEditor = challenge && !isAlreadySolved && !success;
    const hints = challenge ? [challenge.hint1, challenge.hint2, challenge.hint3] : [];

    return (
        <div className="w-full max-w-[1200px] mx-auto p-8 animate-[fade-up_0.5s_ease-out]">
            {/* Header */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-display text-[40px] font-bold text-[#E0E0E0] mb-2">Daily Challenges</h1>
                    <p className="font-body text-[#E0E0E073]">
                        {showEditor ? "Today's transmission received. Stabilize the codebase." : "Track your consistency and sharpen your diagnostic skills."}
                    </p>
                </div>
                {!showEditor && (
                    <button
                        onClick={() => setIsAlreadySolved(false)}
                        className="px-8 py-3 bg-[#E0E0E0] text-[#030303] font-bold rounded-[8px] hover:scale-105 transition-all shadow-[0_0_20px_rgba(114,203,215,0.3)]"
                    >
                        {isAlreadySolved ? "REVIEW TODAY'S BUG" : "SOLVE TODAY'S BUG"}
                    </button>
                )}
            </div>

            {showEditor ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[600px] animate-[fade-in_0.3s_ease-out]">
                    {/* Left: Editor & Console */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="flex-1 bg-[#030303F2] border border-[#E0E0E026] rounded-[12px] overflow-hidden flex flex-col min-h-[500px]">
                            <div className="flex-1 min-h-[400px]">
                                <Editor
                                    theme="vs-dark"
                                    height="100%"
                                    language={challenge?.language === 'javascript' || challenge?.language === 'python' ? challenge.language : "javascript"}
                                    value={code}
                                    onChange={(val: string | undefined) => setCode(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: editorFontSize,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        padding: { top: 20 },
                                        renderLineHighlight: 'all',
                                        scrollBeyondLastLine: false,
                                        wordWrap: "on"
                                    }}
                                    beforeMount={(monaco) => {
                                        const m = monaco as any;
                                        m.editor.defineTheme('debughub-dark', {
                                            base: 'vs-dark', inherit: true,
                                            rules: [
                                                { token: 'comment', foreground: '5C5A8A', fontStyle: 'italic' },
                                                { token: 'keyword', foreground: '8474B7' },
                                                { token: 'string', foreground: '72CBD7' },
                                                { token: 'identifier', foreground: 'DEDEDD' },
                                            ],
                                            colors: {
                                                'editor.background': '#030303',
                                                'editorLineNumber.foreground': '#E0E0E066',
                                                'editor.lineHighlightBackground': '#030303',
                                            }
                                        });
                                    }}
                                    onMount={(_editor, monaco) => monaco.editor.setTheme('debughub-dark')}
                                />
                            </div>

                            {/* Action Bar */}
                            <div className="h-[60px] bg-[#030303F2] border-t border-[#E0E0E01A] flex items-center justify-between px-6">
                                <div className="flex items-center gap-3">
                                    <Button variant="cta" onClick={handleRun} disabled={running} className="flex items-center gap-2 px-4 py-2">
                                        <Play size={16} fill="currentColor" /> Run
                                    </Button>
                                    <Button variant="primary" onClick={handleSubmit} disabled={running} className="flex items-center gap-2 px-4 py-2">
                                        <Check size={16} /> Submit
                                    </Button>
                                </div>
                                <div className="font-display text-[15px] font-bold text-[#E0E0E0]">
                                    {formatTime(timeElapsed)}
                                </div>
                            </div>
                        </div>

                        {/* Console */}
                        <div className="bg-[#030303] border border-[#E0E0E01A] p-4 rounded-[8px] font-code text-[13px] text-[#E0E0E073]">
                            {output ? (
                                <div className={output.toLowerCase().includes('error') ? 'text-red-400' : 'text-[#E0E0E0]'}>
                                    {">"} {output}
                                </div>
                            ) : (
                                <div>{">"} Ready to run...</div>
                            )}
                        </div>
                    </div>

                    {/* Right: Context & Hints */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <Card className="p-6 bg-[#0303034D] border-[#E0E0E033]">
                            <h3 className="font-body font-bold text-[12px] text-[#E0E0E073] uppercase tracking-wider mb-4">BUG CONTEXT</h3>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-2">
                                    <Badge color={challenge?.language?.toLowerCase() as BadgeColor}>{challenge?.language.toUpperCase()}</Badge>
                                    <Badge color={challenge?.difficulty?.toLowerCase() as BadgeColor}>{challenge?.difficulty.toUpperCase()}</Badge>
                                </div>
                                <p className="italic text-[13px] text-[#E0E0E073]">"{challenge?.context}"</p>
                                <div className="divider opacity-20 my-0"></div>
                                <div>
                                    <span className="text-[12px] font-bold text-[#E0E0E0]">EXPECTED OUTPUT</span>
                                    <div className="mt-2 bg-[#030303] border border-[#E0E0E01A] p-3 rounded-[6px] font-code text-[12px] text-[#E0E0E0]">
                                        {challenge?.expectedOutput}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-[#0303034D] border-[#E0E0E033]">
                            <h3 className="font-body font-bold text-[12px] text-[#E0E0E073] uppercase tracking-wider mb-4">HINTS</h3>
                            <div className="flex flex-col gap-3">
                                {[0, 1, 2].map(idx => (
                                    <div key={idx}>
                                        {hintsRevealed > idx ? (
                                            <div className="bg-[#E0E0E01A] border-l-[3px] border-l-[#E0E0E0] p-3 rounded-r-[6px] font-body text-[13px] text-[#E0E0E0]">
                                                {hints[idx]}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setHintsRevealed(idx + 1)}
                                                disabled={hintsRevealed !== idx}
                                                className="w-full py-2 bg-[#03030333] border border-[#E0E0E01A] text-[12px] text-[#E0E0E073] hover:text-[#E0E0E0] transition-colors disabled:opacity-30"
                                            >
                                                Reveal Hint {idx + 1}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <StatCard title="Total Solved" value={stats.solvedChallenges} icon={Trophy} color="#E0E0E0" />
                        <StatCard title="Current Streak" value={`${stats.currentStreak}d`} icon={Zap} color="#E0E0E0" />
                        <StatCard title="Avg Reasoning" value={`${stats.avgReasoningScore}%`} icon={ShieldCheck} color="#E0E0E0" />
                        <StatCard title="Completion" value={`${Math.round((stats.solvedChallenges / stats.totalChallenges) * 100)}%`} icon={Calendar} color="#E0E0E0" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* History */}
                        <div className="lg:col-span-2">
                            <h3 className="font-body font-semibold text-[18px] text-[#E0E0E0] mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-[#E0E0E0]" />
                                Recent History
                            </h3>
                            <div className="flex flex-col gap-4">
                                {history.map((c: HistoryItem) => (
                                    <div key={c.id} className="p-5 bg-[#030303F2] border border-[#E0E0E033] rounded-[12px] flex items-center justify-between group hover:border-[#E0E0E080] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-[8px] bg-[#E0E0E01A] flex items-center justify-center">
                                                <Code size={24} className="text-[#E0E0E0]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="font-body font-bold text-[#E0E0E0] text-[15px]">{new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    <Badge color={c.language.toLowerCase() as BadgeColor}>{c.language.toUpperCase()}</Badge>
                                                    <Badge color={c.difficulty.toLowerCase() as BadgeColor}>{c.difficulty.toUpperCase()}</Badge>
                                                </div>
                                                <div className="text-[13px] text-[#E0E0E073] font-body">Status: {c.solved ? 'Successful' : 'Skipped'}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {c.solved ? (
                                                <div className="text-[#E0E0E0] font-bold font-display text-[18px]">{c.score}% Match</div>
                                            ) : (
                                                <span className="text-[13px] text-[#E0E0E080] font-bold uppercase">MISSING</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Leaderboard Sidebar */}
                        <div>
                            <h3 className="font-body font-semibold text-[18px] text-[#E0E0E0] mb-6 flex items-center gap-2">
                                <Trophy size={20} className="text-[#E0E0E0]" />
                                Top Performers
                            </h3>
                            <div className="bg-[#030303F2] border border-[#E0E0E033] rounded-[16px] overflow-hidden">
                                {[
                                    { name: 'v0_pilot', score: 981, avatar: 'VP' },
                                    { name: 'byte_ninja', score: 914, avatar: 'BN' },
                                    { name: 'debug_master', score: 887, avatar: 'DM' },
                                    { name: 'you', score: streak.rhythmScore, avatar: 'U', isYou: true },
                                    { name: 'pixel_doc', score: 792, avatar: 'PD' },
                                ].map((u, i) => (
                                    <div key={i} className={`p-4 flex items-center justify-between border-b border-[#E0E0E01A] last:border-0 ${u.isYou ? 'bg-[#E0E0E019]' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[12px] font-code text-[#E0E0E040] w-4">#{i + 1}</span>
                                            <div className="w-8 h-8 rounded-full bg-[#E0E0E01A] flex items-center justify-center text-[11px] font-bold text-[#E0E0E0]">{u.avatar}</div>
                                            <span className="text-[14px] font-medium text-[#E0E0E0]">{u.name === 'you' ? user?.username : u.name}</span>
                                        </div>
                                        <div className="text-[14px] font-bold text-[#E0E0E0] opacity-80">{u.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Completion Modals */}
            {success && !showSplitView && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[#030303F2] backdrop-blur-[8px]">
                    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 py-20">
                        <div className="w-full max-w-[500px] flex flex-col items-center relative">
                            <div className="w-16 h-16 rounded-full bg-[#E0E0E026] text-[#E0E0E0] flex items-center justify-center mb-6">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h2 className="font-display text-[40px] font-bold text-[#E0E0E0] mb-8">Bug Fixed!</h2>

                            <div ref={cardRef} className="w-full bg-[#030303] border border-[#E0E0E0] rounded-[12px] p-6 mb-8 relative">
                                <div className="font-display font-bold text-[18px] text-[#E0E0E0] flex items-center gap-2 mb-6">
                                    DEBUGHUB <Bug size={18} />
                                </div>
                                <div className="flex flex-col gap-1 mb-8">
                                    <span className="text-[16px] text-[#E0E0E0]">Fixed today's bug</span>
                                    <span className="text-[16px] text-[#E0E0E0]">in <strong className="text-[#E0E0E0]">{formatTime(timeElapsed)}</strong></span>
                                </div>
                                <div className="font-display text-[24px] font-bold text-[#E0E0E0]">🔥 {stats.currentStreak + 1} day streak</div>
                            </div>

                            {attemptId && (
                                <button onClick={() => setShowSplitView(true)} className="w-full mb-6 p-5 rounded-[12px] bg-[#E0E0E01A] border border-[#E0E0E033] hover:border-[#E0E0E0] transition-all">
                                    <span className="font-bold text-[#E0E0E0] block">Compare Your Diagnostic Path</span>
                                    <span className="text-[13px] text-[#E0E0E073]">See how you stack up against AI and Expert solutions</span>
                                </button>
                            )}

                            <div className="flex gap-4 w-full">
                                <Button variant="cta" onClick={handleDownloadCard} className="flex-1">Download Card</Button>
                                <Button variant="outline" onClick={() => setSuccess(null)} className="flex-1">Close</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSplitView && attemptId && challenge && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-[#030303E6] backdrop-blur-[12px]" onClick={() => setShowSplitView(false)}></div>
                    <div className="w-full max-w-[1200px] h-full relative z-10">
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
