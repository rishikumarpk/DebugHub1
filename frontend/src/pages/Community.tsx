import { useState, useEffect } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import { API_URL } from '../config';
import Button from '../components/ui/Button';

import CreateRoomModal from '../components/community/CreateRoomModal';

export function Community() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/rooms`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch rooms', e);
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-[900px] mx-auto p-8 flex flex-col gap-6">

            {/* Topbar Feed Controls */}
            <div className="flex items-center gap-4 border-b border-[#E0E0E026] pb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#E0E0E073]" size={16} />
                    <input
                        type="text"
                        placeholder="Search bugs..."
                        className="w-full bg-[#030303F2] border border-[#E0E0E040] rounded-[8px] py-2 pl-10 pr-4 text-[14px] text-[#E0E0E0] placeholder-[#E0E0E073] focus:outline-none focus:border-[#E0E0E0]"
                    />
                </div>

                <div className="flex items-center gap-2 border border-[#E0E0E040] rounded-[8px] bg-[#03030333] px-3 py-2 cursor-pointer hover:bg-[#03030366] transition-colors">
                    <span className="text-[13px] text-[#E0E0E0]">Language</span>
                    <ChevronDown size={14} className="text-[#E0E0E073]" />
                </div>

                <div className="flex items-center gap-2 border border-[#E0E0E040] rounded-[8px] bg-[#03030333] px-3 py-2 cursor-pointer hover:bg-[#03030366] transition-colors">
                    <span className="text-[13px] text-[#E0E0E0]">Status</span>
                    <ChevronDown size={14} className="text-[#E0E0E073]" />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Button variant="cta" className="text-[13px] py-2 flex items-center gap-1" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} /> Create Debug Room
                    </Button>
                </div>
            </div>

            {/* Post Feed */}
            <div className="flex flex-col gap-4">
                {loading && <div className="text-center text-[#E0E0E073] py-8">Loading rooms...</div>}
                {!loading && rooms.length === 0 && <div className="text-center text-[#E0E0E073] py-8">No open debug rooms yet. Be the first to ask for help!</div>}
                {!loading && rooms.map(post => {
                    let statusClass = '';
                    let statusLabel = '';
                    const st = post.status.toLowerCase();
                    if (st === 'open') {
                        statusClass = 'bg-[#E0E0E026] text-[#E0E0E0] border-[#E0E0E066]';
                        statusLabel = '● Open';
                    } else if (st === 'progress') {
                        statusClass = 'bg-[#E0E0E026] text-[#E0E0E0] border-[#E0E0E066]';
                        statusLabel = '● In Progress';
                    } else {
                        statusClass = 'bg-[#E0E0E026] text-[#E0E0E0] border-[#E0E0E066]';
                        statusLabel = '● Solved';
                    }

                    return (
                        <div key={post.id} className="post-card p-5 bg-[#03030366] border border-[#E0E0E033] rounded-[12px] hover:border-[#E0E0E080] hover:bg-[#03030399] transition-all flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <Badge color={post.language as any}>{post.language.toUpperCase()}</Badge>
                                <Badge color={post.difficulty as any}>{post.difficulty.toUpperCase()}</Badge>
                                <div className={`px-2 py-[2px] rounded-[20px] text-[11px] font-bold border ${statusClass}`}>
                                    {statusLabel}
                                </div>
                                {post._count?.fixes > 0 && (
                                    <div className="ml-auto text-[12px] text-[#E0E0E073]">
                                        {post._count.fixes} suggestions
                                    </div>
                                )}
                            </div>

                            <h2 className="font-body text-[16px] font-semibold text-[#E0E0E0]">
                                {post.title}
                            </h2>

                            <p className="font-body text-[13px] text-[#E0E0E073] truncate">
                                "{post.summary}"
                            </p>

                            <div className="flex items-end justify-between mt-1">
                                <div className="flex items-center gap-2 max-w-[70%] text-[13px] text-[#E0E0E073]">
                                    <img src={post.creator.avatarUrl || `https://ui-avatars.com/api/?name=${post.creator.username}&background=random`} alt="avatar" className="w-5 h-5 rounded-full" />
                                    <span>{post.creator.username}</span>
                                </div>

                                <Link to={`/room/${post.id}`} className="shrink-0 flex items-center">
                                    <Button variant="outline" className="text-[13px] py-1.5 px-4 h-8 flex items-center justify-center border-[#E0E0E0] text-[#E0E0E0] hover:bg-[#E0E0E026] hover:text-[#E0E0E0] transition-colors">
                                        <span>{post.status === 'solved' ? 'Watch Replay' : 'Join Debug Session'}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showCreateModal && (
                <CreateRoomModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        fetchRooms();
                    }}
                />
            )}
        </div>
    );
}
