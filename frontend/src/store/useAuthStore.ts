import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
    preferredLanguage?: string;
    autoShowSplitView?: boolean;
    emailNotifs?: boolean;
    streakReminders?: boolean;
    communityNotifs?: boolean;
    publicProfile?: boolean;
    showStreak?: boolean;
    editorFontSize?: number;
    streak?: { currentStreak: number; rhythmScore: number; longestStreak: number; avgReasoningScore?: number };
    stats?: { bugsFixed: number, reposHelped: number };
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setLoading: (isLoading) => set({ isLoading }),
}));
