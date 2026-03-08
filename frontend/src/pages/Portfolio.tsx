import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { API_URL, getAuthHeaders } from '../config';

const NumberCounter = ({ end, duration = 800 }: { end: number, duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easeOut = 1 - Math.pow(1 - percentage, 5);
            setCount(Math.floor(end * easeOut));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };
        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count}</>;
};

const RhythmRing = ({ score }: { score: number }) => {
    const size = 80;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-[80px] h-[80px] mx-auto mb-1">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                <defs>
                    <linearGradient id="rhythm-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E0E0E0" />
                        <stop offset="100%" stopColor="#E0E0E0" />
                    </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(46,46,46,0.9)" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    fill="none" stroke="url(#rhythm-gradient)" strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    style={{ animation: `drawRing 1.2s ease-out forwards 100ms` }}
                />
            </svg>
            <div className="absolute font-display text-[32px] font-bold text-[#E0E0E0]"><NumberCounter end={score} duration={1200} /></div>
            <style>{`@keyframes drawRing { to { stroke-dashoffset: ${offset}; } }`}</style>
        </div>
    );
};

const RadarChart = ({ data }: { data: Record<string, number> }) => {
    const size = 220;
    const center = size / 2;
    const radius = 85;
    const axes = [
        { label: 'Syntax', key: 'Syntax' },
        { label: 'Logical', key: 'Logical' },
        { label: 'Edge Case', key: 'EdgeCase' },
        { label: 'Performance', key: 'Performance' },
        { label: 'Real World', key: 'RealWorld' }
    ];

    const getPoint = (angle: number, value: number) => {
        const r = (value / 100) * radius;
        // -PI/2 to start at top (12 o'clock)
        const x = center + r * Math.cos(angle - Math.PI / 2);
        const y = center + r * Math.sin(angle - Math.PI / 2);
        return { x, y };
    };

    const points = axes.map((axis, i) => {
        const angle = (Math.PI * 2 * i) / 5;
        return getPoint(angle, data[axis.key]);
    });

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="relative w-[220px] h-[220px] mx-auto group shrink-0">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    <style>{`
                        @keyframes scaleInPoly {
                            from { transform: scale(0); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </defs>

                {/* Background grids */}
                {[0.33, 0.66, 1].map((scale, idx) => {
                    const pts = axes.map((_, i) => {
                        const angle = (Math.PI * 2 * i) / 5;
                        const p = getPoint(angle, scale * 100);
                        return `${p.x},${p.y}`;
                    }).join(' ');
                    return <polygon key={idx} points={pts} fill="none" stroke="rgba(224, 224, 224,0.15)" strokeWidth="1" />
                })}

                {/* Axis lines */}
                {axes.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / 5;
                    const p = getPoint(angle, 100);
                    return <line key={`line-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(224, 224, 224,0.2)" strokeWidth="1" />
                })}

                {/* Labels */}
                {axes.map((axis, i) => {
                    const angle = (Math.PI * 2 * i) / 5;
                    const p = getPoint(angle, 125);
                    return (
                        <text key={`label-${i}`} x={p.x} y={p.y} fill="rgba(222,222,221,0.45)" fontSize="11" fontFamily="DM Sans" textAnchor="middle" alignmentBaseline="middle">
                            {axis.label}
                        </text>
                    )
                })}

                {/* Data Polygon */}
                <polygon
                    points={polygonPoints}
                    fill="rgba(224, 224, 224,0.2)"
                    stroke="#E0E0E0"
                    strokeWidth="2"
                    style={{ transformOrigin: '50% 50%', animation: 'scaleInPoly 0.8s ease-out 300ms both' }}
                />

                {/* Data Dots */}
                {points.map((p, i) => (
                    <circle
                        key={`dot-${i}`}
                        cx={p.x} cy={p.y} r="4"
                        fill="#E0E0E0"
                        style={{ transformOrigin: `${p.x}px ${p.y}px`, transition: 'all 0.2s ease', animation: 'scaleInPoly 0.8s ease-out 300ms both' }}
                        className="hover:r-[6px] cursor-pointer"
                    >
                        <title>{axes[i].label}: {data[axes[i].key]}</title>
                    </circle>
                ))}
            </svg>

            {/* Legend Component */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 text-[11px] text-[#E0E0E073]">
                {axes.map(axis => (
                    <div key={axis.key} className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#E0E0E0]"></div>{axis.label}</div>
                ))}
            </div>
        </div>
    );
};

interface UserProfile {
    username: string;
    badge: string;
    specialty: string;
    joinDate: string;
    streak: number;
    longestStreak: number;
    rhythmScore: number;
    bugsFixed: number;
    reposHelped: number;
    trustScore: number;
    trustPercentile: number;
    solutionsAccepted: number;
    upvotesReceived: number;
    bugsWentDaily: number;
    languages: Array<{ name: string; count: number; percent: number }>;
    bugTypes: Record<string, number>;
    timeline: Array<{ type: string; date: string; title?: string; text: string; color?: string; lang?: string; bugType?: string; trust?: number }>;
    replays: Array<{ date: string; lang: string; time: string; hints: number }>;
}

export function Portfolio() {
    const { user } = useAuthStore();
    const [profileData, setProfileData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch(`${API_URL}/api/users/profile`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        })
            .then(r => r.json())
            .then(d => {
                if (d.success) setProfileData(d.data);
                setLoading(false);
            })
            .catch(e => {
                console.error('Profile fetch failed', e);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="w-full h-screen flex items-center justify-center bg-[#030303] text-[#E0E0E0]">
            <div className="animate-pulse font-display text-xl">loading nexus profile...</div>
        </div>
    );

    if (!profileData) return (
        <div className="w-full h-screen flex items-center justify-center bg-[#030303] text-[#E0E0E0]">
            <div className="font-display text-xl">profile initialization failed. check uplink.</div>
        </div>
    );

    const data = profileData;
    const stats = { bugsFixed: data.bugsFixed, reposHelped: data.reposHelped };
    const streak = {
        currentStreak: data.streak,
        longestStreak: data.longestStreak,
        rhythmScore: data.rhythmScore,
        avgReasoningScore: 0
    };

    return (
        <div className="w-full max-w-[1280px] mx-auto min-h-screen pb-20 font-body">

            {/* Inject dynamic language animations here */}
            <style>
                {(data.languages as Array<{ name: string, count: number, percent: number }>).map((lang, idx) => `
                    .lang-bar-${idx} { animation: growBar${idx} 1s ease-out ${idx * 100}ms forwards; }
                    @keyframes growBar${idx} { to { width: ${lang.percent}%; } }
                `).join('\n')}
            </style>

            {/* SECTION 1 — HERO BAND */}
            <div className="profile-hero relative flex flex-col items-center md:items-start md:flex-row justify-between w-full border-b border-[rgba(224, 224, 224,0.2)] px-6 py-10 md:px-14 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(46,46,46,0.9) 0%, rgba(10,10,10,1) 100%)' }}>

                {/* Glow behind avatar */}
                <div className="absolute w-[500px] h-[500px] pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(224, 224, 224,0.2) 0%, transparent 65%)', top: '-150px', left: '-120px' }}></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="w-[88px] h-[88px] rounded-full border-[3px] border-[#E0E0E0] shrink-0"
                        style={{ boxShadow: '0 0 0 6px rgba(200,200,200,0.12), 0 0 32px rgba(200,200,200,0.25)' }}>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" alt="avatar" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-[#030303] flex items-center justify-center font-display text-[28px] text-[#E0E0E0]">
                                {(user?.username || data.username)[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* User Details */}
                    <div className="flex flex-col items-center md:items-start justify-center gap-2">
                        <div className="font-display text-[32px] font-bold text-[#E0E0E0] leading-none">@{user?.username || data.username}</div>
                        <div className="bg-[rgba(224, 224, 224,0.2)] border border-[rgba(224, 224, 224,0.5)] text-[#E0E0E0] px-3 py-0.5 rounded-full font-body text-[13px] font-semibold w-max">
                            {data.badge}
                        </div>
                        <div className="text-[13px] text-[rgba(222,222,221,0.45)] italic mt-1">
                            {data.specialty} · Debugging since {data.joinDate}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 shrink-0 mt-6 md:mt-0 self-center md:self-start md:pt-4">
                    <button className="bg-[#E0E0E0] text-[#030303] font-body font-semibold text-[14px] h-[40px] px-6 rounded-[16px] transition-all duration-200 hover:bg-[#E0E0E0] hover:shadow-[0_0_20px_rgba(224, 224, 224,0.4)]">
                        ↗ Share Profile
                    </button>
                </div>
            </div>

            {/* SECTION 2 — STAT CARDS ROW */}
            <div className="profile-stats grid grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-14 py-8">
                <div className="card text-center flex flex-col justify-center">
                    <div className="font-display text-[48px] font-bold text-[#E0E0E0] leading-none mb-1"><NumberCounter end={streak.currentStreak} /></div>
                    <div className="font-body text-[11px] text-[rgba(222,222,221,0.45)] uppercase tracking-[0.1em]">STREAK</div>
                    <div className="font-body text-[12px] text-[#E0E0E0] mt-1">+{streak.currentStreak > 0 ? '1' : '0'} today</div>
                </div>

                {/* Card 2: Rhythm */}
                <div className="card text-center flex flex-col justify-center pb-4 pt-4">
                    <RhythmRing score={streak.rhythmScore} />
                    <div className="font-body text-[11px] text-[rgba(222,222,221,0.45)] uppercase tracking-[0.1em] mt-2">RHYTHM</div>
                    <div className="font-body text-[12px] text-[#E0E0E0] mt-1">Consistency Score</div>
                </div>

                {/* Card 3: Bugs Fixed */}
                <div className="card text-center flex flex-col justify-center">
                    <div className="font-display text-[48px] font-bold text-[#E0E0E0] leading-none mb-1"><NumberCounter end={stats.bugsFixed} /></div>
                    <div className="font-body text-[11px] text-[rgba(222,222,221,0.45)] uppercase tracking-[0.1em]">BUGS FIXED</div>
                    <div className="font-body text-[12px] text-[#E0E0E0] mt-1">all time</div>
                </div>

                {/* Card 4: Repos Helped */}
                <div className="card text-center flex flex-col justify-center">
                    <div className="font-display text-[48px] font-bold text-[#E0E0E0] leading-none mb-1"><NumberCounter end={stats.reposHelped} /></div>
                    <div className="font-body text-[11px] text-[rgba(222,222,221,0.45)] uppercase tracking-[0.1em]">REPOS HELPED</div>
                    <div className="font-body text-[12px] text-[#E0E0E0] mt-1">all time</div>
                </div>
            </div>

            {/* SECTION 3 — TWO COLUMN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6 px-6 md:px-14">

                {/* LEFT COLUMN (40%) */}
                <div className="profile-left w-full lg:w-[40%] flex flex-col gap-6 shrink-0">

                    {/* Card 1: Languages */}
                    <div className="bg-[rgba(46,46,46,0.4)] border border-[rgba(224, 224, 224,0.2)] rounded-[14px] p-6">
                        <div className="text-[11px] uppercase tracking-[0.1em] text-[rgba(222,222,221,0.45)] mb-6">LANGUAGES</div>

                        <div className="flex flex-col">
                            {data.languages.map((lang, index) => (
                                <div key={lang.name} className="flex items-center w-full mb-3">
                                    <span className="font-body font-semibold text-[14px] text-[#E0E0E0] w-[80px] shrink-0">{lang.name}</span>
                                    <div className="flex-1 h-[6px] rounded-[3px] bg-[rgba(46,46,46,0.8)] mx-3 overflow-hidden relative">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-[3px] lang-bar-${index}`}
                                            style={{ background: 'linear-gradient(to right, #E0E0E0, #E0E0E0)', width: '0%' }}
                                        ></div>
                                    </div>
                                    <span className="font-display text-[13px] text-[#E0E0E0] w-[24px] text-right"><NumberCounter end={lang.count} /></span>
                                </div>
                            ))}
                        </div>

                        <div className="text-[12px] text-[rgba(222,222,221,0.45)] text-center mt-4 border-t border-[rgba(224, 224, 224,0.15)] pt-4">
                            78 bugs across 3 languages
                        </div>
                    </div>

                    {/* Card 2: Bug Type Radar Chart */}
                    <div className="bg-[rgba(46,46,46,0.4)] border border-[rgba(224, 224, 224,0.2)] rounded-[14px] p-6 flex flex-col">
                        <div className="text-[11px] uppercase tracking-[0.1em] text-[rgba(222,222,221,0.45)] mb-2">BUG TYPE BREAKDOWN</div>
                        <div className="flex-1 flex flex-col items-center justify-center py-4">
                            <RadarChart data={data.bugTypes} />
                        </div>
                    </div>

                    {/* Card 3: Community Trust */}
                    <div className="bg-[rgba(46,46,46,0.4)] border border-[rgba(200,200,200,0.3)] rounded-[14px] p-6 relative overflow-hidden">
                        <div className="absolute w-[150px] h-[150px]"
                            style={{ background: 'radial-gradient(circle, rgba(200,200,200,0.12) 0%, transparent 70%)', top: '-40px', right: '-40px' }}></div>

                        <div className="text-[11px] uppercase tracking-[0.1em] text-[rgba(222,222,221,0.45)] mb-4 relative z-10">COMMUNITY TRUST</div>

                        <div className="flex items-center gap-4 mb-4 relative z-10">
                            <span className="text-[24px]">🏅</span>
                            <span className="font-display text-[40px] text-[#E0E0E0] font-bold leading-none"><NumberCounter end={data.trustScore} /></span>
                            <div className="bg-[rgba(200,200,200,0.15)] border border-[#E0E0E0] text-[#E0E0E0] px-3 py-1 rounded-full font-body text-[12px] font-semibold ml-auto">
                                Top {data.trustPercentile}%
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-[8px] rounded-full bg-[rgba(46,46,46,0.8)] overflow-hidden mb-8 relative z-10">
                            <div className="absolute top-0 left-0 h-full rounded-full"
                                style={{
                                    background: 'linear-gradient(to right, #E0E0E0, #E0E0E0)',
                                    width: '0%',
                                    animation: `growTrust 1s ease-out forwards 200ms`
                                }}></div>
                            <style>{`@keyframes growTrust { to { width: ${100 - data.trustPercentile}%; } }`}</style>
                        </div>

                        {/* 2x2 Stats Grid */}
                        <div className="grid grid-cols-2 gap-y-6 relative z-10">
                            <div className="flex flex-col border-r border-[rgba(224, 224, 224,0.15)] pr-2">
                                <span className="font-display text-[18px] text-[#E0E0E0] leading-none mb-1"><NumberCounter end={data.solutionsAccepted} /></span>
                                <span className="font-body text-[12px] text-[rgba(222,222,221,0.45)]">solutions accepted</span>
                            </div>
                            <div className="flex flex-col pl-4">
                                <span className="font-display text-[18px] text-[#E0E0E0] leading-none mb-1"><NumberCounter end={data.upvotesReceived} /></span>
                                <span className="font-body text-[12px] text-[rgba(222,222,221,0.45)]">upvotes received</span>
                            </div>

                            <div className="col-span-2 divider m-0 -my-2 opacity-50"></div>

                            <div className="flex flex-col border-r border-[rgba(224, 224, 224,0.15)] pr-2">
                                <span className="font-display text-[18px] text-[#E0E0E0] leading-none mb-1"><NumberCounter end={data.bugsWentDaily} /></span>
                                <span className="font-body text-[12px] text-[rgba(222,222,221,0.45)]">bugs became daily</span>
                            </div>
                            <div className="flex flex-col pl-4">
                                <span className="font-display text-[18px] text-[#E0E0E0] leading-none mb-1"><NumberCounter end={data.trustScore} /></span>
                                <span className="font-body text-[12px] text-[rgba(222,222,221,0.45)]">total score</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (60%) */}
                <div className="profile-right flex-1 flex flex-col pt-2 lg:pt-0">
                    <div className="text-[11px] uppercase tracking-[0.1em] text-[rgba(222,222,221,0.45)] mb-6">ACTIVITY TIMELINE</div>
                    <div className="timeline">
                        {data.timeline.map((item, i) => (
                            item.type === 'milestone' ? (
                                <div key={i} className="timeline-milestone">
                                    <div className="milestone-dot" style={{ backgroundColor: `var(--${item.color})`, borderColor: `var(--${item.color})` }}></div>
                                    <div className="milestone-label" style={{ color: `var(--${item.color})` }}>{item.date} — {item.title}</div>
                                    <div className="milestone-text">{item.text}</div>
                                </div>
                            ) : (
                                <div key={i} className="timeline-entry">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-date">{item.date}</div>
                                    <div className="timeline-text">{item.text}</div>
                                    <div className="timeline-meta">
                                        <div className="px-2 py-[2px] rounded-full bg-[rgba(224, 224, 224,0.15)] text-[11px] text-[#E0E0E0]">{item.lang}</div>
                                        <div className="px-2 py-[2px] rounded-full bg-[rgba(224, 224, 224,0.15)] text-[11px] text-[#E0E0E0]">{item.bugType}</div>
                                        <div className="trust-gain">+{item.trust} trust pts</div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 4 — RECENT REPLAYS STRIP */}
            <div className="profile-replays px-6 md:px-14 mt-12 mb-8">
                <div className="text-[11px] uppercase tracking-[0.1em] text-[rgba(222,222,221,0.45)] mb-4">RECENT REPLAYS</div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {data.replays.map((replay, i) => (
                        <div key={i} className="replay-card flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5V19L19 12L8 5Z" fill="#E0E0E0" />
                                </svg>
                                <span className="text-[12px] text-[rgba(222,222,221,0.45)]">{replay.date}</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-auto">
                                <div className="px-2 py-[2px] rounded-full bg-[rgba(224, 224, 224,0.15)] text-[11px] text-[#E0E0E0] w-max">{replay.lang}</div>
                                <div className="font-display text-[14px] text-[#E0E0E0] font-bold">{replay.time}</div>
                                <div className={`text-[12px] ${replay.hints === 0 ? 'text-[#E0E0E0]' : 'text-[#E0E0E0]'}`}>
                                    {replay.hints} {replay.hints === 1 ? 'hint' : 'hints'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Portfolio;
