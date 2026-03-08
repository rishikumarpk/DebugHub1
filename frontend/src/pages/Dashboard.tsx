import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { GlassButton } from '../components/ui/liquid-glass';
import Card from '../components/ui/Card';
import { API_URL, getAuthHeaders } from '../config';

interface Activity {
    id: string;
    user: string;
    action: string;
    time: string;
    type: string;
}

interface LeaderboardItem {
    rank: number;
    name: string;
    score: number;
    barW: string;
    isYou?: boolean;
}

export function Dashboard() {
    const { user } = useAuthStore();
    const streak = user?.streak || { currentStreak: 0, longestStreak: 0, rhythmScore: 0 };

    const [activities, setActivities] = useState<Activity[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);

    useEffect(() => {
        // Fetch Activities
        fetch(`${API_URL}/api/challenges/activity`, {
            credentials: 'include',
            headers: getAuthHeaders()
        })
            .then(r => r.json())
            .then(d => { if (d.success) setActivities(d.data); })
            .catch(e => console.error('Activity fetch failed', e));

        // Fetch Leaderboard
        fetch(`${API_URL}/api/challenges/leaderboard`, {
            credentials: 'include',
            headers: getAuthHeaders()
        })
            .then(r => r.json())
            .then(d => { if (d.success) setLeaderboard(d.data); })
            .catch(e => console.error('Leaderboard fetch failed', e));
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    return (
        <div className="w-full min-h-[calc(100vh-48px)] overflow-y-auto bg-[#030303] custom-scrollbar">

            {/* HERO SECTION - Dynamic height */}
            <div className="w-full min-h-[600px] h-[calc(100vh-48px)] flex items-center justify-center relative snap-start overflow-hidden">
                {/* Background Video */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none mix-blend-screen"
                >
                    <source src="/newbg.mp4" />
                </video>

                {/* Hero Content Overlay */}
                <div className="relative z-10 w-full max-w-[800px] px-6 flex flex-col items-center text-center animate-[fade-up_0.8s_ease-out]">


                    <h1 className="font-display text-[40px] md:text-[72px] font-bold text-[#E0E0E0] leading-[1.1] mb-12 drop-shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                        Ready to Debug?
                    </h1>

                    <Link to="/daily-bug">
                        <GlassButton className="text-[16px] px-10 py-4 font-bold text-white uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            Start Debugging
                        </GlassButton>
                    </Link>

                    {/* Subtle scroll indicator */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                        <div className="w-[1px] h-12 bg-gradient-to-b from-[#E0E0E080] to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* REST OF DASHBOARD */}
            <div className="w-full max-w-[1200px] mx-auto p-8 flex flex-col gap-12 snap-start pt-16 pb-24 relative z-10 bg-[#030303]">

                {/* STATS ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="flex flex-col items-center justify-center text-center p-8 bg-[#03030380] hover:-translate-y-2 transition-transform duration-300">
                        <span className="font-display text-5xl text-[#E0E0E0] font-bold mb-3">{streak.rhythmScore}</span>
                        <span className="text-[13px] text-[#E0E0E073] uppercase tracking-[0.1em] font-semibold">RHYTHM SCORE</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-8 bg-[#03030380] hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#E0E0E026] rounded-bl-[100%] transition-transform group-hover:scale-150"></div>
                        <span className="font-display text-5xl text-[#E0E0E0] font-bold mb-3 relative z-10">{user?.streak?.avgReasoningScore || 0}%</span>
                        <span className="text-[13px] text-[#E0E0E073] text-[#E0E0E0] uppercase tracking-[0.1em] font-semibold relative z-10">REASONING MATCH</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-8 bg-[#03030380] hover:-translate-y-2 transition-transform duration-300">
                        <span className="font-display text-5xl text-[#E0E0E0] font-bold mb-3">{streak.currentStreak}</span>
                        <span className="text-[13px] text-[#E0E0E073] uppercase tracking-[0.1em] font-semibold">STREAK</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center text-center p-8 bg-[#03030380] hover:-translate-y-2 transition-transform duration-300">
                        <span className="font-display text-5xl text-[#E0E0E0] font-bold mb-3">{streak.longestStreak}</span>
                        <span className="text-[13px] text-[#E0E0E073] uppercase tracking-[0.1em] font-semibold">LONGEST</span>
                    </Card>
                </div>

                {/* BOTTOM PANELS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full mb-12">
                    {/* Activity Feed */}
                    <div className="flex flex-col w-full bg-[#030303F2] p-6 rounded-[16px] border border-[#E0E0E033]">
                        <h3 className="font-body font-semibold text-[16px] text-[#E0E0E0] mb-6 uppercase tracking-widest pl-2 border-l-[3px] border-[#E0E0E0]">Recent Activity</h3>
                        <div className="flex flex-col gap-4">
                            {activities.map((act: Activity) => {
                                let dotColor = 'bg-[#E0E0E0]';
                                if (act.type === 'live') dotColor = 'bg-[#E0E0E0] shadow-[0_0_8px_#E0E0E0]';
                                if (act.type === 'solved' || act.type === 'special') dotColor = 'bg-[#E0E0E0]';

                                return (
                                    <div key={act.id} className="flex items-center gap-4 py-3 border-b border-[#E0E0E026] last:border-0 hover:bg-[#0303031A] px-2 rounded-lg transition-colors">
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`}></div>
                                        <div className="font-body text-[14px] text-[#E0E0E0] flex-1">
                                            <span className="text-[#E0E0E0] font-semibold mr-1.5">{act.user}</span>
                                            <span className="opacity-80">{act.action}</span>
                                        </div>
                                        <div className="text-[12px] font-code text-[#E0E0E066] shrink-0">{formatTime(act.time)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="flex flex-col w-full bg-[#030303F2] p-6 rounded-[16px] border border-[#E0E0E033]">
                        <h3 className="font-body font-semibold text-[16px] text-[#E0E0E0] mb-6 uppercase tracking-widest pl-2 border-l-[3px] border-[#E0E0E0]">Rhythm Leaderboard</h3>
                        <div className="flex flex-col gap-5">
                            {leaderboard.map((item: LeaderboardItem) => (
                                <div key={item.rank} className="flex flex-col gap-1.5 group cursor-pointer">
                                    <div className="flex justify-between items-center text-[14px]">
                                        <div className={`font-semibold font-body ${item.isYou ? 'text-[#E0E0E0]' : 'text-[#E0E0E0] group-hover:text-[#E0E0E0] transition-colors'}`}>
                                            <span className="opacity-50 mr-2">#{item.rank}</span>{item.name}
                                        </div>
                                        <div className="font-display font-bold text-[#E0E0E0] text-[16px]">
                                            {item.score}
                                        </div>
                                    </div>
                                    <div className="w-full h-[6px] bg-[#030303] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${item.isYou ? 'bg-[#E0E0E0] shadow-[0_0_10px_#E0E0E0]' : 'bg-[#E0E0E0] opacity-80'
                                            } ${item.barW}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
