import { useState } from 'react';
import { API_URL } from '../config';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Save, User, Code, Bell, Shield, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
    const { user } = useAuthStore();
    const [saved, setSaved] = useState(false);

    // Profile
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState('');

    // Preferences
    const { editorFontSize, setEditorFontSize } = useSettingsStore();
    const [defaultLanguage, setDefaultLanguage] = useState((user as any)?.preferredLanguage || 'python');
    const [autoShowSplitView, setAutoShowSplitView] = useState(false);

    // Notifications
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [streakReminders, setStreakReminders] = useState(true);
    const [communityNotifs, setCommunityNotifs] = useState(false);

    // Privacy
    const [publicProfile, setPublicProfile] = useState(true);
    const [showStreak, setShowStreak] = useState(true);

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/api/preferences`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferredLanguage: defaultLanguage }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (e) {
            console.error('Failed to save preferences', e);
        }
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#E0E0E0]' : 'bg-[#030303]'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#E0E0E0] transition-transform ${checked ? 'left-6' : 'left-1'}`} />
        </button>
    );

    const SectionHeader = ({ icon: Icon, title, color }: { icon: any; title: string; color: string }) => (
        <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
                <Icon size={16} color={color} />
            </div>
            <h3 className="font-body font-semibold text-[16px] text-[#E0E0E0] uppercase tracking-wider">{title}</h3>
        </div>
    );

    return (
        <div className="w-full max-w-[800px] mx-auto p-8 animate-[fade-up_0.5s_ease-out]">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-display text-[40px] font-bold text-[#E0E0E0] mb-2">Settings</h1>
                    <p className="font-body text-[#E0E0E073]">Customize your DebugHub experience.</p>
                </div>
                <Button variant="cta" onClick={handleSave} className="flex items-center gap-2 px-6 py-3">
                    <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>

            {/* Profile Section */}
            <Card className="p-6 bg-[#0303034D] border-[#E0E0E033] mb-8">
                <SectionHeader icon={User} title="Profile" color="#E0E0E0" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#E0E0E073] uppercase tracking-wider">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="bg-[#030303] border border-[#E0E0E033] rounded-[8px] px-4 py-3 text-[14px] text-[#E0E0E0] font-body focus:outline-none focus:border-[#E0E0E0] transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-[#E0E0E073] uppercase tracking-wider">Email</label>
                        <input
                            type="text"
                            value={user?.email || 'demo@example.com'}
                            disabled
                            className="bg-[#030303] border border-[#E0E0E01A] rounded-[8px] px-4 py-3 text-[14px] text-[#E0E0E073] font-body cursor-not-allowed"
                        />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[12px] font-bold text-[#E0E0E073] uppercase tracking-wider">Bio</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell others about yourself..."
                            rows={3}
                            className="bg-[#030303] border border-[#E0E0E033] rounded-[8px] px-4 py-3 text-[14px] text-[#E0E0E0] font-body focus:outline-none focus:border-[#E0E0E0] transition-colors resize-none"
                        />
                    </div>
                </div>
            </Card>

            {/* Coding Preferences */}
            <Card className="p-6 bg-[#0303034D] border-[#E0E0E033] mb-8">
                <SectionHeader icon={Code} title="Coding Preferences" color="#E0E0E0" />
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Default Language</div>
                            <div className="text-[12px] text-[#E0E0E073]">Used for new challenges</div>
                        </div>
                        <select
                            value={defaultLanguage}
                            onChange={e => setDefaultLanguage(e.target.value)}
                            className="bg-[#030303] border border-[#E0E0E033] rounded-[8px] px-4 py-2 text-[14px] text-[#E0E0E0] font-body focus:outline-none focus:border-[#E0E0E0] transition-colors appearance-none cursor-pointer"
                        >
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Editor Font Size</div>
                            <div className="text-[12px] text-[#E0E0E073]">Adjust code readability</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={10}
                                max={20}
                                value={editorFontSize}
                                onChange={e => setEditorFontSize(Number(e.target.value) as any)}
                                className="w-32 accent-[#E0E0E0]"
                            />
                            <span className="text-[14px] font-code text-[#E0E0E0] w-6 text-right">{editorFontSize}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Auto-open AI Comparison</div>
                            <div className="text-[12px] text-[#E0E0E073]">Automatically show split view after solving</div>
                        </div>
                        <ToggleSwitch checked={autoShowSplitView} onChange={setAutoShowSplitView} />
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 bg-[#0303034D] border-[#E0E0E033] mb-8">
                <SectionHeader icon={Bell} title="Notifications" color="#E0E0E0" />
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Email Notifications</div>
                            <div className="text-[12px] text-[#E0E0E073]">Receive weekly progress digests</div>
                        </div>
                        <ToggleSwitch checked={emailNotifs} onChange={setEmailNotifs} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Streak Reminders</div>
                            <div className="text-[12px] text-[#E0E0E073]">Get reminded before your streak breaks</div>
                        </div>
                        <ToggleSwitch checked={streakReminders} onChange={setStreakReminders} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Community Activity</div>
                            <div className="text-[12px] text-[#E0E0E073]">Mentions, replies, and friend activity</div>
                        </div>
                        <ToggleSwitch checked={communityNotifs} onChange={setCommunityNotifs} />
                    </div>
                </div>
            </Card>

            {/* Privacy */}
            <Card className="p-6 bg-[#0303034D] border-[#E0E0E033] mb-8">
                <SectionHeader icon={Shield} title="Privacy" color="#E0E0E0" />
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Public Profile</div>
                            <div className="text-[12px] text-[#E0E0E073]">Others can view your profile and stats</div>
                        </div>
                        <ToggleSwitch checked={publicProfile} onChange={setPublicProfile} />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-[14px] font-medium text-[#E0E0E0]">Show Streak on Leaderboard</div>
                            <div className="text-[12px] text-[#E0E0E073]">Display your streak publicly</div>
                        </div>
                        <ToggleSwitch checked={showStreak} onChange={setShowStreak} />
                    </div>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="p-6 bg-[#E0E0E00D] border-[#E0E0E033] mb-8">
                <SectionHeader icon={Trash2} title="Danger Zone" color="#E0E0E0" />
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[14px] font-medium text-[#E0E0E0]">Delete Account</div>
                        <div className="text-[12px] text-[#E0E0E073]">Permanently delete your account and all data</div>
                    </div>
                    <Button variant="outline" className="border-[#E0E0E080] text-[#E0E0E0] hover:bg-[#E0E0E01A] text-[13px] px-4 py-2 h-auto">
                        Delete Account
                    </Button>
                </div>
            </Card>
        </div>
    );
}
