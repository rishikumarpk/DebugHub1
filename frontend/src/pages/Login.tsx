import { Bug } from 'lucide-react';
import { DottedSurface } from '@/components/ui/dotted-surface';

const API_URL = import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.PROD ? '' : 'http://localhost:3001');

export function Login() {
    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleMockLogin = async () => {
        await fetch(`${API_URL}/auth/mock-login`, { method: 'POST', credentials: 'include' });
        window.location.href = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/`;
    };

    return (
        <div className="w-full h-screen bg-black flex flex-col font-body relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <DottedSurface className="w-full h-full" />
            </div>
            {/* --- Content Overlay --- */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6">

                {/* Header Text - Centered to pull the eye into the tunnel */}
                <div className="flex flex-col items-center text-center mb-16 animate-[fade-up_0.8s_ease-out]">
                    <div className="flex items-center gap-3 mb-6 bg-[#2E2E2E66] px-4 py-2 border border-[#434343] rounded-full backdrop-blur-md">
                        <Bug size={20} className="text-[#E0E0E0]" />
                        <span className="font-code text-sm text-[#E0E0E0] tracking-widest uppercase">DebugHub</span>
                    </div>

                    <h1 className="font-display text-[48px] md:text-[64px] font-bold text-[#E0E0E0] leading-[1.1] max-w-[800px] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        Build debugging <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B8B8B] to-[#616161]">instinct.</span><br />
                        One bug at a time.
                    </h1>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-[400px] bg-[#030303] p-8 border border-[#2E2E2E] rounded-[24px] backdrop-blur-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-[fade-up_1s_ease-out]">
                    <h2 className="font-display text-2xl font-bold text-[#E0E0E0] mb-2 text-center w-full">Welcome back</h2>
                    <p className="font-body text-[14px] text-[#626262] mb-8 text-center w-full">Sign in to continue your streak.</p>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full h-[52px] bg-[#2E2E2E] hover:bg-[#414141] text-[#E0E0E0] font-bold rounded-[12px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,0,0,0.4)] mb-6 border border-[#434343]"
                    >
                        <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="w-full flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-[#434343]"></div>
                        <span className="text-[12px] text-[#626262] font-body uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[#434343]"></div>
                    </div>

                    <button
                        onClick={handleMockLogin}
                        className="w-full h-[52px] bg-transparent border border-[#434343] hover:bg-[#2E2E2E] text-[#E0E0E0] font-bold rounded-[12px] transition-all hover:scale-[1.02]"
                    >
                        Mock Login (Local Dev)
                    </button>

                    <p className="mt-8 text-[11px] text-[#616161] text-center w-full">
                        By authenticating, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
