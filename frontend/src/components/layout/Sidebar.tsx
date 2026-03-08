import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bug, MessageSquare, User, Bell, Settings, ChevronLeft, ChevronRight, Zap, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(true);

    const navItems = [
        { icon: <Home size={20} />, label: 'Home', path: '/' },
        { icon: <Bug size={20} />, label: 'Daily Bug', path: '/challenges' },
        { icon: <Zap size={20} />, label: 'Practice', path: '/practice' },
        { icon: <ShieldAlert size={20} />, label: 'Simulator', path: '/incidents' },
        { icon: <MessageSquare size={20} />, label: 'Community', path: '/community' },
        { icon: <User size={20} />, label: 'Profile', path: '/profile' },
        { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 flex flex-col pt-6 pb-6 border-r border-[var(--border-primary)] backdrop-blur-[20px] ${collapsed ? 'w-16' : 'w-[220px]'
                }`}
            style={{ background: 'var(--sidebar-bg)' }}
        >
            <div className="flex items-center justify-between px-4 mb-8">
                {!collapsed && (
                    <span className="font-display font-bold text-[var(--text-primary)] text-xl">
                        DebugHub
                    </span>
                )}
                <button
                    onClick={() => {
                        const newState = !collapsed;
                        setCollapsed(newState);
                        window.dispatchEvent(new CustomEvent('sidebarToggle', { detail: newState }));
                    }}
                    className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ${collapsed ? 'mx-auto' : ''}`}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `relative flex items-center px-4 py-3 cursor-pointer transition-all duration-200 border-l-[3px] group ${isActive
                                ? 'border-[var(--text-primary)] bg-[var(--deep-lavender-20)] text-[var(--text-primary)]'
                                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            } ${collapsed ? 'justify-center' : 'justify-start gap-4'}`
                        }
                    >
                        {item.icon}
                        {!collapsed && <span className="font-body text-[14px] leading-none whitespace-nowrap">{item.label}</span>}

                        {/* Tooltip on hover — only when collapsed */}
                        {collapsed && (
                            <div className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-[12px] font-semibold font-body whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 translate-x-[-4px] z-[100] shadow-lg"
                                style={{
                                    background: 'var(--surface-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-primary)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                }}
                            >
                                {item.label}
                                {/* Arrow */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-[10px] h-[10px] rotate-45"
                                    style={{
                                        background: 'var(--surface-elevated)',
                                        borderLeft: '1px solid var(--border-primary)',
                                        borderBottom: '1px solid var(--border-primary)',
                                    }}
                                />
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
