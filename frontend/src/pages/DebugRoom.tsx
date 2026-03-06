import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { Editor } from '@monaco-editor/react';
import { Check, ShieldCheck, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export function DebugRoom() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [suggestedCode, setSuggestedCode] = useState('');
    const [explanation, setExplanation] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCurrentUser();
        fetchRoom();
    }, [id]);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) setCurrentUser(data.data);
        } catch (e) {
            console.error('Failed to get user');
        }
    };

    const fetchRoom = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/rooms/${id}`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setRoom(data.data);
                setSuggestedCode(data.data.buggyCode);
            }
        } catch (e) {
            console.error('Failed to fetch room');
        }
        setLoading(false);
    };

    const handleSuggestFix = async () => {
        if (!suggestedCode || !explanation) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/rooms/${id}/fixes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fixedCode: suggestedCode, explanation }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setExplanation('');
                fetchRoom();
            }
        } catch (e) {
            console.error(e);
        }
        setSubmitting(false);
    };

    const handleApplyFix = async (fixId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/rooms/${id}/fixes/${fixId}/apply`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                fetchRoom();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-[#E0E0E073]">Loading room...</div>;
    }

    if (!room) {
        return <div className="p-12 text-center text-[#E0E0E073]">Room not found!</div>;
    }

    const isCreator = currentUser?.id === room.creatorId;

    return (
        <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-8 flex gap-8 h-[calc(100vh-64px)]">
            <div className="w-[350px] flex flex-col gap-4 border-r border-[#E0E0E026] pr-8 h-full shrink-0">
                <button
                    onClick={() => navigate('/community')}
                    className="flex items-center gap-2 text-[13px] text-[#E0E0E073] hover:text-[#E0E0E0] transition-colors mb-2"
                >
                    <ArrowLeft size={16} /> Back to Community
                </button>
                <div>
                    <h1 className="font-display text-[20px] font-bold text-[#E0E0E0] leading-tight mb-2">
                        {room.title}
                    </h1>
                    <div className="flex gap-2 mb-4">
                        <Badge color={room.language as any}>{room.language.toUpperCase()}</Badge>
                        <Badge color={room.difficulty as any}>{room.difficulty.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#E0E0E073]">
                        <img src={room.creator.avatarUrl || `https://ui-avatars.com/api/?name=${room.creator.username}`} className="w-5 h-5 rounded-full" />
                        <span>Posted by {room.creator.username}</span>
                    </div>
                </div>
                <div className="bg-[#03030333] border border-[#E0E0E040] rounded-[12px] p-4 text-[13px] text-[#E0E0E0] font-body leading-relaxed">
                    {room.summary}
                </div>
                <div className="flex-1 flex flex-col mt-4 min-h-0">
                    <h3 className="text-[14px] font-bold text-[#E0E0E0] mb-3">Community Suggestions</h3>
                    <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                        {room.fixes.length === 0 ? (
                            <div className="text-[12px] text-[#E0E0E073] text-center p-4 border border-dashed border-[#E0E0E040] rounded-lg">
                                No suggestions yet. Be the first to help!
                            </div>
                        ) : (
                            room.fixes.map((fix: any) => (
                                <div key={fix.id} className={`p-4 rounded-[12px] border ${fix.isAccepted ? 'bg-[#E0E0E01A] border-[#E0E0E040]' : 'bg-[#030303] border-[#E0E0E040]'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-[12px] text-[#E0E0E073]">
                                            <UserIcon size={12} /> {fix.user.username}
                                        </div>
                                        {fix.isAccepted && (
                                            <span className="flex items-center gap-1 text-[11px] text-[#E0E0E0] font-bold">
                                                <ShieldCheck size={12} /> ACCEPTED FIX
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[13px] text-[#E0E0E0] mb-3">{fix.explanation}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <Button variant="outline" className="text-[11px] py-1 px-3" onClick={() => setSuggestedCode(fix.fixedCode)}>
                                            View Code
                                        </Button>
                                        {isCreator && room.status === 'open' && (
                                            <Button variant="outline" className="text-[11px] py-1 px-3 border-[#E0E0E0] text-[#E0E0E0]" onClick={() => handleApplyFix(fix.id)}>
                                                Apply This Fix
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col h-full bg-[#030303] border border-[#E0E0E040] rounded-[16px] overflow-hidden">
                <div className="h-[48px] bg-[#030303] border-b border-[#E0E0E040] flex items-center px-4 justify-between">
                    <span className="font-display text-[14px] font-bold text-[#E0E0E0]">
                        {isCreator ? "Reviewing Suggestions" : "Suggest a Fix"}
                    </span>
                    {room.status === 'solved' && (
                        <span className="text-[12px] text-[#E0E0E0] font-bold flex items-center gap-1">
                            <Check size={14} /> Solved
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <Editor theme="vs-dark"
                        height="100%"
                        language={room.language === 'cpp' || room.language === 'c' ? 'c' : room.language}
                        value={suggestedCode}
                        onChange={(val) => setSuggestedCode(val || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineHeight: 24,
                            padding: { top: 16 },
                            readOnly: room.status === 'solved'
                        }}
                    />
                </div>
                {room.status === 'open' && !isCreator && (
                    <div className="p-4 border-t border-[#E0E0E040] bg-[#030303] flex gap-3">
                        <input
                            type="text"
                            className="flex-1 bg-[#030303] border border-[#E0E0E040] rounded-[8px] py-2 px-3 text-[13px] text-[#E0E0E0] focus:outline-none focus:border-[#E0E0E0]"
                            placeholder="Explain what you changed and why..."
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                        />
                        <Button variant="cta" onClick={handleSuggestFix} disabled={submitting || !explanation}>
                            {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit Fix'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
