import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import { API_URL, getAuthHeaders } from '../config';
import Button from '../components/ui/Button';

import CreateRoomModal from '../components/community/CreateRoomModal';

interface Room {
    id: string;
    title: string;
    summary: string;
    language: string;
    difficulty: string;
    status: string;
    buggyCode: string;
    creatorId: string;
    creator: {
        username: string;
        avatarUrl?: string;
    };
    _count?: {
        fixes: number;
    };
}

export function Community() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [searchQuery] = useState<string>('');
    const [filterLanguage, setFilterLanguage] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchRooms();
    }, [filterLanguage, filterStatus]);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterLanguage !== 'ALL') params.append('language', filterLanguage);
            if (filterStatus !== 'ALL') params.append('status', filterStatus);

            const res = await fetch(`${API_URL}/api/rooms?${params.toString()}`, {
                credentials: 'include',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (e) {
            console.error('Failed to fetch rooms', e);
        }
        setLoading(false);
    };

    const filteredRooms = rooms.filter((room: Room) =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-[900px] mx-auto p-8 flex flex-col gap-6">

            {/* Topbar Feed Controls */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-[#E0E0E026] pb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 border border-[#E0E0E040] rounded-[8px] bg-[#03030333] px-3 py-2 cursor-pointer hover:bg-[#03030366] transition-colors relative group">
                        <select
                            value={filterLanguage}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterLanguage(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        >
                            <option value="ALL">All Languages</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                        </select>
                        <span className="text-[13px] text-[#E0E0E0]">{filterLanguage === 'ALL' ? 'Language' : filterLanguage.toUpperCase()}</span>
                        <ChevronDown size={14} className="text-[#E0E0E073]" />
                    </div>

                    <div className="flex items-center gap-2 border border-[#E0E0E040] rounded-[8px] bg-[#03030333] px-3 py-2 cursor-pointer hover:bg-[#03030366] transition-colors relative">
                        <select
                            value={filterStatus}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        >
                            <option value="ALL">All Status</option>
                            <option value="open">Open</option>
                            <option value="solved">Solved</option>
                        </select>
                        <span className="text-[13px] text-[#E0E0E0]">{filterStatus === 'ALL' ? 'Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}</span>
                        <ChevronDown size={14} className="text-[#E0E0E073]" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="cta" className="text-[13px] py-2 flex items-center gap-1" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} /> Create Debug Room
                    </Button>
                </div>
            </div>

            {/* Post Feed */}
            <div className="flex flex-col gap-4">
                {loading && <div className="text-center text-[#E0E0E073] py-8">Loading rooms...</div>}
                {!loading && filteredRooms.length === 0 && <div className="text-center text-[#E0E0E073] py-8">No matching debug rooms found.</div>}
                {!loading && filteredRooms.map((post: Room) => {
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
                                <Badge color={post.language.toLowerCase() as any}>{post.language.toUpperCase()}</Badge>
                                <Badge color={post.difficulty.toLowerCase() as any}>{post.difficulty.toUpperCase()}</Badge>
                                <div className={`px-2 py-[2px] rounded-[20px] text-[11px] font-bold border ${statusClass}`}>
                                    {statusLabel}
                                </div>
                                {post._count && post._count.fixes > 0 && (
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
