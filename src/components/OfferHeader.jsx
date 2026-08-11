import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";

const OfferHeader = () => {
    const navigate = useNavigate();

    const handleCreateOffer = () => {
        navigate("/dashboard/offers/create");
    };

    return (
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#E5E7F0] bg-white">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[#6655DF]/8 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[#14B8A6]/8 blur-[90px]" />

            <div className="relative flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2.5 flex items-center gap-2">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#059669] opacity-60" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#059669]" />
                        </span>
                        <span
                            className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#5C6480]"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                            Control Deck · Live
                        </span>
                    </div>

                    <h1
                        className="text-[26px] font-semibold leading-tight tracking-tight text-[#12151F]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Offer Engine
                    </h1>

                    <p className="mt-1.5 text-[12px] text-[#5C6480]">
                        Configure and monitor every live promotion rule in real time
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleCreateOffer}
                    className="group relative flex h-10 w-fit cursor-pointer items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#6655DF] to-[#4F3FCB] px-5 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(102,85,223,0.1),0_8px_20px_-6px_rgba(102,85,223,0.45)] transition-all hover:shadow-[0_1px_2px_rgba(102,85,223,0.15),0_12px_28px_-6px_rgba(102,85,223,0.55)] active:scale-[0.98]"
                >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Sparkles size={14} strokeWidth={2.25} />
                    Create New offer
                </button>
            </div>
        </div>
    );
};

export default OfferHeader;
