import React, { useEffect, useRef } from 'react';
import { X, Zap, Building2, Check, Crown } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const plans = [
    {
        tier: 'Freemium',
        label: 'Community',
        audience: 'Students & Hobbyists',
        price: '₹0',
        period: '',
        icon: Zap,
        features: [
            'Daily Bug Challenges (3/day)',
            'Community Feed',
            'Public Profile',
        ],
        color: '#E0E0E0',
        gradient: 'linear-gradient(135deg, rgba(20,20,20,0.98) 0%, rgba(10,10,10,0.95) 100%)',
        borderColor: 'rgba(224, 224, 224,0.2)',
        cta: 'Current Plan',
        disabled: true,
    },
    {
        tier: 'Pro',
        label: 'Individual',
        audience: 'Job Seekers',
        price: '₹999',
        period: '/ month',
        icon: Crown,
        features: [
            'Diagnostic Path Reports',
            'Candidate Benchmarking',
            'Verified Resume Access',
            'Everything in Free',
        ],
        color: '#A78BFA',
        gradient: 'linear-gradient(135deg, rgba(20,16,30,0.98) 0%, rgba(12,10,18,0.95) 100%)',
        borderColor: 'rgba(167,139,250,0.4)',
        cta: 'Get Pro',
        disabled: false,
        popular: true,
        amountInPaise: 99900,
    },
    {
        tier: 'Recruiter',
        label: 'B2B',
        audience: 'HR & Headhunters',
        price: '₹4999',
        period: '/ month',
        icon: Building2,
        features: [
            'Diagnostic Path Reports',
            'Candidate Benchmarking',
            'War Room (Incident Simulator)',
            'Everything in Pro',
        ],
        color: '#F59E0B',
        gradient: 'linear-gradient(135deg, rgba(25,20,10,0.98) 0%, rgba(15,12,8,0.95) 100%)',
        borderColor: 'rgba(245,158,11,0.35)',
        cta: 'Get Recruiter',
        disabled: false,
        amountInPaise: 499900,
    },
];

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Load Razorpay script
    useEffect(() => {
        if (!document.getElementById('razorpay-script')) {
            const script = document.createElement('script');
            script.id = 'razorpay-script';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handlePayment = (plan: typeof plans[0]) => {
        if (plan.disabled) return;

        if (!window.Razorpay) {
            alert('Payment gateway is loading. Please try again in a moment.');
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_YourTestKeyHere',
            amount: plan.amountInPaise,
            currency: 'INR',
            name: 'DebugHub',
            description: `${plan.tier} (${plan.label}) - Monthly Subscription`,
            image: '/favicon.ico',
            handler: function (response: any) {
                // On success
                alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                onClose();
            },
            prefill: {
                name: '',
                email: '',
            },
            theme: {
                color: plan.color,
                backdrop_color: '#030303',
            },
            modal: {
                ondismiss: function () {
                    console.log('Payment modal dismissed');
                },
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ animation: 'pricing-backdrop-in 0.3s ease-out forwards' }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative z-10 w-full max-w-[960px] bg-[#0A0A0A] rounded-3xl border border-[#E0E0E026] overflow-hidden shadow-2xl"
                style={{ animation: 'pricing-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
                {/* Close button - now inside the modal for better visibility */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full border border-[#E0E0E026] bg-[#03030366] flex items-center justify-center text-[#E0E0E0] hover:text-white hover:bg-[#E0E0E026] transition-all z-20"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#A78BFA33] bg-[#A78BFA0D] mb-4">
                        <Crown size={14} className="text-[#A78BFA]" />
                        <span className="text-[12px] font-semibold text-[#A78BFA] uppercase tracking-widest">Upgrade</span>
                    </div>
                    <h2 className="font-display text-[32px] font-bold text-[#E0E0E0] mb-2">
                        Choose Your Plan
                    </h2>
                    <p className="font-body text-[14px] text-[#E0E0E066]">
                        Unlock advanced debugging tools and career features
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.tier}
                                className="pricing-card relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: plan.gradient,
                                    border: `1px solid ${plan.borderColor}`,
                                    animation: `pricing-card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms forwards`,
                                    opacity: 0,
                                    transform: 'translateY(20px)',
                                }}
                            >
                                {/* Popular badge */}
                                {plan.popular && (
                                    <div
                                        className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider"
                                        style={{
                                            background: `${plan.color}22`,
                                            color: plan.color,
                                            borderBottom: `1px solid ${plan.borderColor}`,
                                            borderLeft: `1px solid ${plan.borderColor}`,
                                        }}
                                    >
                                        Most Popular
                                    </div>
                                )}

                                <div className="p-6 flex flex-col h-full">
                                    {/* Icon & Tier */}
                                    <div className="flex items-center gap-3 mb-5">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: `${plan.color}15`,
                                                border: `1px solid ${plan.color}30`,
                                            }}
                                        >
                                            <Icon size={20} style={{ color: plan.color }} />
                                        </div>
                                        <div>
                                            <div className="font-display text-[16px] font-bold text-[#E0E0E0]">
                                                {plan.tier}
                                            </div>
                                            <div className="font-body text-[11px] text-[#E0E0E066] uppercase tracking-wider">
                                                {plan.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Audience */}
                                    <div className="font-body text-[12px] text-[#E0E0E080] mb-4 pb-4 border-b border-[#E0E0E015]">
                                        For {plan.audience}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-5">
                                        <span
                                            className="font-display text-[36px] font-bold"
                                            style={{ color: plan.color }}
                                        >
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="font-body text-[14px] text-[#E0E0E066] ml-1">
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="flex flex-col gap-3 mb-6 flex-1">
                                        {plan.features.map((feature) => (
                                            <div key={feature} className="flex items-start gap-2.5">
                                                <div
                                                    className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                                    style={{
                                                        background: `${plan.color}15`,
                                                        border: `1px solid ${plan.color}25`,
                                                    }}
                                                >
                                                    <Check size={10} style={{ color: plan.color }} />
                                                </div>
                                                <span className="font-body text-[13px] text-[#E0E0E099]">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handlePayment(plan)}
                                        disabled={plan.disabled}
                                        className="w-full py-3 rounded-xl font-body text-[14px] font-semibold transition-all duration-200 cursor-pointer disabled:cursor-default"
                                        style={{
                                            background: plan.disabled
                                                ? 'rgba(224, 224, 224,0.08)'
                                                : plan.popular
                                                    ? plan.color
                                                    : `${plan.color}15`,
                                            color: plan.disabled
                                                ? '#E0E0E066'
                                                : plan.popular
                                                    ? '#030303'
                                                    : plan.color,
                                            border: `1px solid ${plan.disabled ? '#E0E0E020' : plan.borderColor}`,
                                            ...(plan.popular && !plan.disabled
                                                ? { boxShadow: `0 0 24px ${plan.color}40` }
                                                : {}),
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!plan.disabled && !plan.popular) {
                                                e.currentTarget.style.background = `${plan.color}25`;
                                                e.currentTarget.style.boxShadow = `0 0 16px ${plan.color}20`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!plan.disabled && !plan.popular) {
                                                e.currentTarget.style.background = `${plan.color}15`;
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {plan.cta}
                                    </button>
                                </div>

                                {/* Subtle glow on popular card */}
                                {plan.popular && (
                                    <div
                                        className="absolute -inset-[1px] rounded-2xl pointer-events-none"
                                        style={{
                                            background: `linear-gradient(180deg, ${plan.color}10 0%, transparent 50%)`,
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
